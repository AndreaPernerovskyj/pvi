const content = document.querySelector('.content');
const navbar = document.querySelector('.navbar');

async function initializeApplication(currentUserSession) {
    const notification_popup = document.querySelector('.notifications-popup');
    const user_info = document.querySelector(".user-info");
    const header_title = document.getElementById("header-title");

    user_info.querySelector("a").innerText = currentUserSession.username;

    const bellNotifications = document.querySelector(".bell-notifications");
    bellNotifications.style.display = "inline-block";

    const userName = document.querySelector(".user-name");
    userName.style.display = "block";

    await newNotificationsCheckUp();
    header_title.addEventListener("click", function() {
        const url = header_title.dataset.content;
        delete_all_active(navbar);
        loadContent(url);
        document.querySelector(".students-navbar").classList.add('active');
    });
    user_info.addEventListener("click", function() {
        delete_all_active(navbar);
        loadContent(user_info.dataset.content);
    });

    for (let item of navbar.children) {
        item.addEventListener("click", function() {
            if (!item.classList.contains("active")) {
                delete_all_active(navbar);
                item.classList.add("active");

                const url = item.dataset.content;
                loadContent(url);
            }
        });
    }

    document.querySelector(".students-navbar").classList.add("active");
    const initialContent = navbar.querySelector(".active").dataset.content;
    await loadContent(initialContent);

    document.addEventListener("dblclick", function() {
        if(notification_popup.querySelector("h3")) {
            notification_popup.innerHTML = '';
            newNotificationsBellAnimationStartUp();
        }

        createNewNotificationItem({id: 10, userName:"P Diddy", message:"Good"});
    });
}

async function loadContent(url)  {
    switch (url) {
        case "./src/ui/components/students.html": {
            loadStudentsPage(url);
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

async function newNotificationsCheckUp() {
    // Тут був би запит на сервер щоб отримати нові повідомленні
    const notificationsPopup = document.querySelector(".notifications-popup");
    if(state.notifications != null && state.notifications.length !== 0) {
        newNotificationsBellAnimationStartUp();

        state.notifications.map(notification => {
            createNewNotificationItem(notification);
        });
    }
    else {
        const h3 = document.createElement("h3");
        h3.innerText = "No messages yet";
        notificationsPopup.append(h3);
    }
}

function createNewNotificationItem(notificationInfo) {
    const notificationsPopup = document.querySelector(".notifications-popup");

    notificationsPopup.innerHTML += `
        <div class="notification-item" data-content="/src/ui/components/messages.html" aria-label="Open notification" tabindex="0">
            <i class="fa-solid fa-user icon_size avatar"></i>
            <div class="notification-content">
                <span class="notification-user-name">${notificationInfo.userName}</span>
                <p class="notification-message">${notificationInfo.message}</p>
            </div>
        </div>
    `

    const newNotificationItem = notificationsPopup.querySelector(".notification-item");
    newNotificationItem.addEventListener("click", async function() {
        delete_all_active(navbar);
        const url = newNotificationItem.dataset.content;
        await loadContent(url);
    });

    notificationsPopup.append(newNotificationItem)
}

function newNotificationsBellAnimationStartUp() {
    const notificationBell = document.getElementById("notification-bell");
    notificationBell.classList.add("animation")
    document.getElementById("notification-bell-dot").classList.add("dot")
}

function delete_all_active(navbar) {
    for (let item of navbar.children) {
        item.classList.remove('active');
    }
}