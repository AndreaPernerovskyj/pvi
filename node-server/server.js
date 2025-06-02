const express = require('express');
const cors = require('cors');
const { Db } = require("./config/db");
const { ObjectId } = require('mongodb');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // або конкретний фронт, наприклад "http://localhost:3000"
        methods: ["GET", "POST"]
    }
});

// Initializing DB instance and connecting to a mongoDB database
const dbInstance = new Db();
let db;
let globalSocket = null;

const connectedUsers = new Map();
io.on("connection", socket => {
    globalSocket = socket;
    console.log("Socket підключено:", socket.id);

    socket.on("userConnected", (userId) => {
        connectedUsers.set(userId, socket.id);
    });

    socket.on("disconnect", () => {
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                console.log(`User ${userId} disconnected with socket id: ${socket.id}`);
                break;
            }
        }
    });

    socket.on("sendMessage", async (message, roomId) => {
        const chatRoomId = new ObjectId(roomId);
        const { text, senderId, name, timestamp } = message;

        const newMessage = {
            roomId: chatRoomId,
            text,
            senderId,
            name,
            sentAt: new Date(timestamp),
            edited: false,
            read_by: [],
        };

        await db.collection("messages").insertOne(newMessage);

        const chatroom = await db.collection("chatrooms").findOne({ _id: chatRoomId });
        const members = chatroom?.members || []; // Array of member userIds

        for (const m of members) {
            if (m.user_id === senderId) continue;

            const result = await db.collection("notifications").insertOne({
                userId: m.user_id,
                roomId,
                text,
                senderName: name,
            });

            const notification = await db.collection("notifications").findOne({ _id: result.insertedId });
            notification.senderId = senderId;
            const socketId = connectedUsers.get(m.user_id);
            if (socketId) {
                io.to(socketId).emit("newMessageNotification", notification);
            }
        }
    });

    socket.on("createRoom", async (chatroom) => {
        for (const m of chatroom.members) {
            const socketId = connectedUsers.get(m.user_id);
            if (socketId) {
                io.to(socketId).emit("onRoomCreated", chatroom);
            }
        }
    })

    socket.on("notificationRead", async (notification) => {
        const objectId = new ObjectId(notification._id);
        await db.collection("notifications").deleteOne({ _id: objectId });
        socket.emit("deleteNotification", notification);

        const cursor = db.collection("notifications").find({ userId: notification.userId });
        for await (const n of cursor) {
            if (n.roomId === notification.roomId) {
                await db.collection("notifications").deleteOne({ _id: n._id });
                socket.emit("deleteNotification", n);
            }
        }
    });

    socket.on("joinRoom", (newRoom) => {
        socket.join(newRoom);
    })
});

async function startServer() {
    db = await dbInstance.connectToDb("cmd_node");
    app.get('/chatrooms/:userId', async (req, res) => {
        const userId = parseInt(req.params.userId);

        try {
            const chatRooms = await db.collection('chatrooms').find(
                { "members.user_id": userId },
                { projection: { _id: 1, name: 1 } }
            ).toArray();

            res.json(chatRooms);
        } catch (err) {
            console.error('Error fetching chatrooms:', err);
            res.status(500).json({ error: 'Failed to fetch chatrooms' });
        }
    });

    app.get('/chatrooms/:userId/:chatRoomId', async (req, res) => {
        const chatRoomId = new ObjectId(req.params.chatRoomId);

        try {
            const chatRoom = await db.collection('chatrooms').findOne({ _id: chatRoomId });
            res.json(chatRoom);
        } catch (err) {
            console.error('Error fetching chatroom:', err);
            res.status(500).json({ error: 'Failed to fetch chatroom' });
        }
    });

    app.post("/chatrooms", async (req, res) => {
        const chatRoomInfo = req.body;

        const formattedMembers = chatRoomInfo.members.map(m => ({
            user_id: m.userId,
            status: m.status,
            joined_at: new Date(),
            last_read: new Date(),
            name: m.userName
        }));

        try {
            const result = await db.collection('chatrooms').insertOne({
                name: chatRoomInfo.name,
                description: chatRoomInfo.description,
                created_at: new Date(),
                members: formattedMembers
            });

            const chatroom = await db.collection("chatrooms").findOne({ _id: result.insertedId });

                for (const m of chatroom.members) {
                    const socketId = connectedUsers.get(m.user_id);
                    if (socketId) {
                        io.to(socketId).emit("onRoomCreated", chatroom);
                    }
                }

            res.status(201).json({ message: "Chatroom created", insertedId: result.insertedId });
        } catch (err) {
            console.error("Error creating chatroom:", err);
            res.status(500).json({ error: "Failed to create chatroom" });
        }
    });

    app.get('/messages/:chatRoomId', async (req, res) => {
        const chatRoomId = new ObjectId(req.params.chatRoomId);

        try {
            const messages = await db.collection('messages').find({ roomId: chatRoomId }).toArray();
            res.json(messages);
        } catch (err) {
            console.error('Error fetching messages:', err);
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    });

    app.put("/chatrooms/members/:chatRoomId", async (req, res) => {
        try {
            const chatRoomId = new ObjectId(req.params.chatRoomId);
            const newMembers = req.body;
            // очікуємо масив об’єктів виду { userId, status, userName }

            // Форматуємо в тому ж стилі, що й при створенні:
            const formatted = newMembers.map(m => ({
                user_id: m.userId,
                status: m.status,
                joined_at: new Date(),
                last_read: new Date(),
                name: m.userName
            }));

            const result = await db.collection('chatrooms').updateOne(
                { _id: chatRoomId },
                {
                    $addToSet: {
                        members: {
                            $each: formatted
                        }
                    }
                }
            );
            console.log(result)

            const chatroom = await db.collection("chatrooms").findOne({ _id: chatRoomId });

            for (const m of chatroom.members) {
                const socketId = connectedUsers.get(m.user_id);
                if (socketId) {
                    io.to(socketId).emit("onUserAddedToRoom", chatroom._id, formatted);
                }
            }

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: "Chatroom not found" });
            }

            res.json({
                message: "Members added",
                modifiedCount: result.modifiedCount
            });
        } catch (err) {
            console.error("Error adding members:", err);
            res.status(500).json({ error: "Failed to add members" });
        }
    });

    app.get("/notifications/:userId", async (req, res) => {
        const userId = parseInt(req.params.userId);
        console.log(userId)
        const notifications = await db.collection('notifications').find({ userId: userId }).toArray();
        res.json(notifications);
    })

    server.listen(PORT, () => {
        console.log(`Сервер слухає на http://localhost:${PORT}`);
    });
}

startServer().catch(err => {
    console.error("Failed to start server:", err);
});
