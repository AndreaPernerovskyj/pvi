let offset = 0;
let addingToChat = false;

// true - creating, false - adding

function loadMessagesPage(url) {
    fetch(url)
        .then((response) => response.text())
        .then((html) => {
            content.innerHTML = html;
            loadChatRooms();
            setInitialListeners();
        })
        .catch((error) => console.error("Error loading tasks.html:", error));
}

function setInitialListeners() {
    state.socket.on("onRoomCreated", (room) => {
        renderChatRoomNav(room)
    })

    state.socket.on("onUserAddedToRoom", (roomId, members) => {
        if(roomId !== state.messagesPage.currentChatRoom._id) return;
        members.forEach(m => {
            createMemberUi(m);
        })
    })

    const newChatBtn = document.querySelector(".new-chat-btn");
    const closeModal = document.querySelector(".close-modal");
    const cancelBtn = document.getElementById("cancelBtn");
    const modal = document.getElementById("newChatModal");
    const createChatBtn = document.getElementById("createChatBtn");
    const memberSearch = document.getElementById("memberSearch");
    const searchResults = document.querySelector(".search-results")
    const addMembersBtn = document.querySelector(".add-members-chat-create-btn")
    const modalSelect = document.getElementById("selectMembersModal");
    const membersBtnOk = document.querySelector(".members-btn-ok")


    newChatBtn.addEventListener("click", () => {
        modal.classList.add("active");
    });
    closeModal.addEventListener("click", closeModalFunction);
    cancelBtn.addEventListener("click", closeModalFunction);

    addMembersBtn.addEventListener("click", () => {
        addingToChat = false;
        getMembersForChatCreating(0)
        modalSelect.classList.add("active");
        membersBtnOk.innerText = "Ok";

    })

    membersBtnOk.addEventListener("click", () => {
        if (addingToChat) {
            fetch(`http://localhost:3001/chatrooms/members/${state.messagesPage.currentChatRoom._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(state.messagesPage.selectedMembers)
            })
                .then(async response => {
                    if (!response.ok) {
                        const errorBody = await response.json().catch(() => ({}));
                        const msg = errorBody.error || response.statusText;
                        throw new Error(`Server error: ${msg} (status ${response.status})`);
                    }

                    return response.json();
                })
                .then(data => {
                    console.log("Members added:", data);
                    document.getElementById("selectedMembers").innerHTML = "";
                })
                .catch(err => {
                    console.error("Failed to add members:", err);
                });

        }
        modalSelect.classList.remove("active");
    })

    memberSearch.addEventListener("input", (e) => {
        e.preventDefault();

        searchResults.innerHTML = "";
        if (!memberSearch.value) {
            getMembersForChatCreating(0)
            return;
        }

        fetch(`http://localhost/project/back-end/students/initials?fullName=${memberSearch.value}`)
            .then(response => response.json())
            .then(members => {
                members.forEach(member => {
                    renderMemberItem(member);
                })
            })
    });

    createChatBtn.addEventListener("click", function () {
        const chatName = document.getElementById("chatName").value.trim();
        const chatDescription = document.getElementById("chatDescription").value.trim();

        if (!chatName) {
            alert("Please enter a chat room name");
            return;
        }

        state.messagesPage.selectedMembers.push({
            userId: state.profileInfo.id,
            userName: state.profileInfo.firstName + " " + state.profileInfo.lastName,
            status: "admin"
        })

        const chatRoomInfo = {
            name: chatName,
            description: chatDescription,
            members: state.messagesPage.selectedMembers
        }

        console.log(chatRoomInfo);
        fetch("http://localhost:3001/chatrooms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(chatRoomInfo)
        }).then(response => {
            if (!response.ok) {

            }

            return response.json()
        }).then(data => {
            debugger;
        })

        closeModalFunction();
    });
}

function closeModalFunction() {
    const modal = document.getElementById("newChatModal");
    state.messagesPage.selectedMembers = null;
    modal.classList.remove("active");
    document.getElementById("newChatForm").reset();
}

function getMembersForChatCreating(offset) {
    fetch(`http://localhost/project/back-end/students/initials?offset=${offset}`)
        .then(response => response.json())
        .then(members => {
            members.forEach(member => {
                renderMemberItem(member);
            })
        })
}

function renderMemberItem(member) {
    if (member.id === state.profileInfo.id) return;
    if (addingToChat && state.messagesPage.currentChatRoom.members.some(m => m.user_id === member.id)) return;

    const memberItem = document.createElement("div");
    memberItem.className = "member-item";

    // Create avatar div
    const avatarDiv = document.createElement("div");
    avatarDiv.className = "member-avatar";

    const initials = `${member.firstName[0]}${member.lastName[0]}`
    avatarDiv.textContent = initials.toUpperCase();

    const infoDiv = document.createElement("div");
    infoDiv.className = "member-info";

    const nameDiv = document.createElement("div");
    nameDiv.className = "member-name";
    nameDiv.textContent = member.firstName + " " + member.lastName;

    const addButton = document.createElement("button");
    addButton.className = "add-member-btn";
    addButton.textContent = "Add";
    addButton.dataset.id = member.id;
    addButton.dataset.name = member.firstName + " " + member.lastName;
    if (state.messagesPage.selectedMembers?.some(m => Number(m.userId) === member.id)) {
        addButton.disabled = true;
        addButton.textContent = "Added";
    }

    addButton.addEventListener("click", function () {
        const userId = this.dataset.id;
        const userName = this.dataset.name;

        addSelectedMember(userId, userName);

        this.disabled = true;
        this.textContent = "Added";
    });

    infoDiv.appendChild(nameDiv);

    memberItem.appendChild(avatarDiv);
    memberItem.appendChild(infoDiv);
    memberItem.appendChild(addButton);

    const searchResults = document.querySelector(".search-results");
    searchResults.appendChild(memberItem);
}

function addSelectedMember(userId, userName) {
    state.messagesPage.selectedMembers.push({userId: Number(userId), userName, status: "member"})
    const selectedMembersContainer = document.getElementById("selectedMembers");
    const memberElement = document.createElement("div");
    memberElement.className = "selected-member";
    memberElement.dataset.id = userId;
    memberElement.innerHTML = `
                    <span class="member-name">${userName}</span>
                    <button type="button" class="remove-member" data-id="${userId}">&times;</button>
                `;
    selectedMembersContainer.appendChild(memberElement);

    // Add remove functionality
    memberElement.querySelector(".remove-member").addEventListener("click", function () {
        const userId = this.getAttribute("data-id");
        memberElement.remove();

        state.messagesPage.selectedMembers = state.messagesPage.selectedMembers.filter(member => member.userId !== userId);

        const addBtn = document.querySelector(`.add-member-btn[data-id="${userId}"]`);
        if (addBtn) {
            addBtn.disabled = false;
            addBtn.innerText = "Add";
        }
    });
}

function loadChatRooms() {
    fetch("http://localhost:3001/chatrooms/" + state.profileInfo.id)
        .then(response => {
            if (!response.ok) {
            }
            return response.json();
        })
        .then(chatRooms => {
            chatRooms.forEach(room => {
                renderChatRoomNav(room);
            });
        })
        .catch(err => {
            console.error("Fetch failed:", err)
        });
}

function renderChatRoomNav(room) {
    const chatRooms = document.querySelector(".chat-rooms");

    const chatRoomDiv = document.createElement("div");
    chatRoomDiv.classList.add("chat-room");
    chatRoomDiv.dataset.chatroomId = room._id;

    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("avatar");
    avatarDiv.append(room.name[0])

    const roomNameDiv = document.createElement("div");
    roomNameDiv.classList.add("room-name");
    roomNameDiv.append(room.name);

    chatRoomDiv.append(avatarDiv);
    chatRoomDiv.append(roomNameDiv);

    chatRooms.appendChild(chatRoomDiv);

    chatRoomDiv.addEventListener("click", (e) => {
        loadChatRoom(chatRoomDiv.dataset.chatroomId);
        chatRoomDiv.classList.add("active");
    })
}

function loadChatRoom(chatRoomId) {
    const chatRoomArray = document.querySelectorAll(".chat-room");
    chatRoomArray.forEach(room => room.classList.remove("active"));

    if (chatRoomId === state.currentChatRoom?._id) {
        return;
    }

    const chatRoom = state.messagesPage.chatRooms.find(chat => chat._id === chatRoomId);
    if (chatRoom) {
        renderMainChatRoomArea(chatRoom);
        return;
    }

    fetch(`http://localhost:3001/chatrooms/${state.profileInfo.id}/${chatRoomId}`)
        .then(response => response.json())
        .then(roomData => {
            state.messagesPage.chatRooms.push(roomData)
            renderMainChatRoomArea(roomData);
        })
}

async function renderMainChatRoomArea(room) {
    const modalSelect = document.getElementById("selectMembersModal");
    state.messagesPage.currentChatRoom = room;

    const chatMain = document.querySelector(".chat-main");
    if (chatMain.querySelector("h1")) {
        chatMain.innerHTML = `
        <div class="chat-header">
            <h3>Chat room Admin</h3>
            <div class="members">
                <h4>Members</h4>
                <div class="member-avatars-container">
                    <div class="member-avatars">
                        <div class="member-wrapper">
                            <div class="member-avatar add-member-to-current-chat">+</div>
                            <div class="member-status">Add</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="messages-container">
            <h4>Messages</h4>
            <div class="message-list">
            </div>
        </div>

        <div class="message-input">
            <input type="text" placeholder="Type your message here..."/>
            <button class="send-btn">→</button>
        </div>`

        document.querySelector(".send-btn").addEventListener("click", () => {
            sendMessage();
        })

        chatMain.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                sendMessage();
            }
        });

        document.querySelector(".add-member-to-current-chat").addEventListener("click", () => {
            addingToChat = true;
            document.querySelector(".members-btn-ok").innerText = "Add";
            getMembersForChatCreating(0)
            modalSelect.classList.add("active");
        })
    }

    const chatRoomName = document.querySelector(".chat-main h3");
    chatRoomName.innerText = `Chat room ${room.name}`
    const memberAvatars = document.querySelector(".member-avatars");
    Array.from(memberAvatars.children).slice(1).forEach(child => child.remove());

    room.members.forEach((member) => {
        createMemberUi(member);
    });

    document.querySelector(".message-list").innerHTML = "";
    await loadMessages(room._id);
}

function createMemberUi(member) {
    const memberAvatars = document.querySelector(".member-avatars");

    const memberDiv = document.createElement("div");
    memberDiv.classList.add("member-wrapper");

    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("member-avatar");
    if (member.user_id === state.profileInfo.id) {
        avatarDiv.classList.add("authorized-member-avatar");
    }
    avatarDiv.innerText = member.name.charAt(0).toUpperCase();

    const statusDiv = document.createElement("div");
    statusDiv.classList.add("member-status");
    statusDiv.innerText = member.status;

    memberDiv.appendChild(avatarDiv);
    memberDiv.appendChild(statusDiv);

    // Add tooltip for member name
    memberDiv.title = member.name;

    memberAvatars.appendChild(memberDiv);
}

function loadMessages(roomId) {
    fetch(`http://localhost:3001/messages/${roomId}`)
        .then(response => response.json())
        .then(messages => {
            messages.forEach(message => {
                renderMessage(message);
            })
            const messagesContainer = document.querySelector(".messages-container");
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }).catch(err => {
        console.error(err)
    })
}

function renderMessage(messageData) {
    const messageList = document.querySelector(".message-list")

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("avatar", "small");
    avatarDiv.innerText = messageData.name.charAt(0);

    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    const messageBubbleText = document.createElement("div");
    messageBubbleText.innerText = messageData.text;
    messageBubbleText.classList.add("message-bubble");

    const messageInfo = document.createElement("div");
    messageInfo.classList.add("message-info");

    messageContent.appendChild(messageBubbleText);
    messageContent.appendChild(messageInfo);

    if (messageData.senderId === state.profileInfo.id) {
        messageInfo.innerText = "Me";
        messageDiv.classList.add("outgoing");
        messageDiv.appendChild(messageContent)
        messageDiv.appendChild(avatarDiv)
    } else {
        messageInfo.innerText = messageData.name;
        messageDiv.classList.add("incoming");
        messageDiv.appendChild(avatarDiv)
        messageDiv.appendChild(messageContent)
    }

    messageList.appendChild(messageDiv)
}

function sendMessage() {
    const messageInput = document.querySelector(".message-input input");
    const message = messageInput.value.trim();

    if (!message) return;

    messageInput.value = "";
    const messageData = {
        text: message,
        senderId: state.profileInfo.id,
        name: state.profileInfo.firstName + " " + state.profileInfo.lastName,
        timestamp: new Date(),
    }

    state.socket.emit("sendMessage", messageData, state.messagesPage.currentChatRoom._id)
    renderMessage(messageData)
    const messagesContainer = document.querySelector(".messages-container");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}