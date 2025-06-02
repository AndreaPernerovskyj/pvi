const content = document.querySelector('.content');
const navbar = document.querySelector('.navbar');

async function initializeApplication(currentUserSession) {
    state.socket = io("http://localhost:3001")
    state.socket.on("connect", () => {
        console.log("Connected to socket server");
        state.socket.emit("userConnected", state.profileInfo.id);
    });
    state.socket.on("newMessageNotification", (notification) => {
        debugger
        if(!state.messagesPage.currentChatRoom || state.messagesPage.currentChatRoom._id !== notification.roomId) {
            newNotificationsBellAnimationStartUp();
            createNewNotificationItem(notification);
        }
        else {
            renderMessage({name: notification.senderName, text: notification.text, senderId: notification.senderId });
        }
    });

    state.socket.on("deleteNotification", async (notification) => {
        await deleteNotificationFromNotificationList(notification, document.querySelector(`.notification-item[id=\"${notification._id}\"]`))
    })

    fetch(`http://localhost:3001/notifications/${state.profileInfo.id}`)
        .then(response => response.json())
        .then(data => {
            debugger
            console.log(data)
            data.forEach(notification => {
                newNotificationsBellAnimationStartUp();
                createNewNotificationItem(notification)
            })
        })

    const notification_popup = document.querySelector('.notifications-popup');
    const h3 = document.createElement("h3");
    h3.innerText = "No messages yet";
    notification_popup.append(h3);

    const user_info = document.querySelector(".user-info");
    const header_title = document.getElementById("header-title");

    user_info.querySelector("a").innerText = currentUserSession.username;

    const bellNotifications = document.querySelector(".bell-notifications");
    bellNotifications.style.display = "inline-block";

    const userName = document.querySelector(".user-name");
    userName.style.display = "block";

    header_title.addEventListener("click", function () {
        const url = header_title.dataset.content;
        delete_all_active(navbar);
        loadContent(url);
        document.querySelector(".students-navbar").classList.add('active');
    });
    user_info.addEventListener("click", function () {
        delete_all_active(navbar);
        loadContent(user_info.dataset.content);
    });

    for (let item of navbar.children) {
        item.addEventListener("click", function () {
            if (!item.classList.contains("active")) {
                delete_all_active(navbar);
                item.classList.add("active");

                const url = item.dataset.content;
                loadContent(url);
            }
        });
    }

    document.querySelector(".tasks-navbar").classList.add("active");
    const initialContent = navbar.querySelector(".active").dataset.content;
    await loadContent(initialContent);
}

async function loadContent(url) {
    state.messagesPage.currentChatRoom = null;
    switch (url) {
        case "./src/ui/components/students.html": {
            loadStudentsPage(url);
            break;
        }
        case "./src/ui/components/tasks.html": {
            loadTasksPage(url);
            break;
        }
        case "./src/ui/components/messages.html": {
            loadMessagesPage(url);
            break;
        }
        default: {
            const response = await fetch(url);
            if (!response.ok) {
                content.innerHTML = `HTTP error! Status: ${response.status}`;
                return;
            }
            content.innerHTML = await response.text();
        }
    }
}

function createNewNotificationItem(notificationInfo) {
    const notificationsPopup = document.querySelector(".notifications-popup");

    const h3 = notificationsPopup.querySelector("h3");
    if (h3) {
        h3.remove();
    }

    notificationsPopup.insertAdjacentHTML("beforeend", `
        <div id="${notificationInfo._id}" class="notification-item" data-content="./src/ui/components/messages.html" aria-label="Open notification" tabindex="0">
            <i class="fa-solid fa-user icon_size avatar"></i>
            <div class="notification-content">
                <span class="notification-user-name">${notificationInfo.senderName}</span>
                <p class="notification-message">${notificationInfo.text}</p>
            </div>
        </div>
    `);

    const newNotificationItem = document.getElementById(notificationInfo._id);
    newNotificationItem.addEventListener("click", async () => {
        state.socket.emit("notificationRead", notificationInfo);
    });
}

async function deleteNotificationFromNotificationList (notificationInfo, newNotificationItem) {
    if(!document.querySelector(".messages-navbar").classList.contains("active")) {
        const url = newNotificationItem.dataset.content;
        delete_all_active(navbar);
        await loadContent(url);
    }

    setTimeout(() => {
        loadChatRoom(notificationInfo.roomId)
        document.querySelector(`.chat-room[data-chatroom-id="${notificationInfo.roomId}"]`).classList.add("active");
        newNotificationItem.remove();
        newNotificationsBellAnimationEnd();
    }, 100)
}

function newNotificationsBellAnimationStartUp() {
    const notificationBell = document.getElementById("notification-bell");
    notificationBell.classList.add("animation")
    document.getElementById("notification-bell-dot").classList.add("dot")
}

function newNotificationsBellAnimationEnd() {
    const notificationsPopup = document.querySelector(".notifications-popup");
    if(notificationsPopup.children.length !== 0) return;

    const h3 = document.createElement("h3");
    h3.innerText = "No messages yet";
    notificationsPopup.append(h3);
    const notificationBell = document.getElementById("notification-bell");
    notificationBell.classList.remove("animation")
    document.getElementById("notification-bell-dot").classList.remove("dot")
}

function delete_all_active(navbar) {
    for (let item of navbar.children) {
        item.classList.remove('active');
    }
}