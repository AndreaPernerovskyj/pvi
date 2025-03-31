const navbar = document.querySelector('.navbar');
const content = document.querySelector('.content');
const notification_popup = document.querySelector('.notifications-popup');
const user_info = document.querySelector(".user-info");
const header_title = document.getElementById("header-title");

document.addEventListener("DOMContentLoaded", async function() {
    if("serviceWorker" in navigator) {
        try {
            await navigator.serviceWorker.register("/sw.js")
            console.log("Service worker register successful");
        }
        catch(e) {
            console.log("Service worker register fail");
        }
    }

    newNotificationsCheckUp();

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

    const initialContent = navbar.querySelector(".active").dataset.content;
    loadContent(initialContent);

    document.addEventListener("dblclick", function() {
        if(notification_popup.querySelector("h3")) {
            notification_popup.innerHTML = '';
            newNotificationsBellAnimationStartUp();
        }

        createNewNotificationItem({id: 10, userName:"P Diddy", message:"Good"});
    });
});

async function loadContent(url)  {
    switch (url) {
        case "./resources/pages/students.html": {
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

function loadStudentsPage(url) {
    fetch(url)
        .then((response) => response.text())
        .then((html) => {
            content.innerHTML = html;

            state.students.forEach((student) => {
                create_new_row(student);
            });

            document.querySelector(".add-students-btn").addEventListener("click", (e) => {
                e.preventDefault();
                add_students_modal();

                document.querySelector(".add-student-modal-container").classList.add("show");
                const addEditModalHead = document.querySelector(".add-edit-modal-header");
                addEditModalHead.innerHTML = "Add Students";
                addEditModalHead.focus();
            });

            const mainCheckBox = document.querySelector(".main-checkbox");
            mainCheckBox.addEventListener("change", (e) => {
                numberOfChecked=0;
                const table = e.target.closest("tbody");
                for (let i = 1; i < table.children.length; i++) {
                    checkBoxChanged(table.children[i], !!mainCheckBox.checked);
                }
            })

            const deleteSelectedBtn= document.querySelector(".delete-selected-btn")
            deleteSelectedBtn.addEventListener("click", e => {
                const table = document.querySelector(".students-table-body");

                const length = table.children.length;
                for (let i = length - 1; i > 0; i--) { // Looping in reverse
                    const tr_element = table.children[i];
                    if (!tr_element.querySelector(".student-checkbox").checked) continue;

                    tr_element.remove();
                    state.students = state.students.filter(student => student.id !== Number(tr_element.id));
                    numberOfChecked--;
                }

                numberOfCheckedChanged();
            })

        })
        .catch((error) => console.error("Error loading students.html:", error));
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
        <div class="notification-item" data-content="./resources/pages/messages.html" aria-label="Open notification" tabindex="0">
            <i class="fa-solid fa-user icon_size avatar"></i>
            <div class="notification-content">
                <span class="notification-user-name">${notificationInfo.userName}</span>
                <p class="notification-message">${notificationInfo.message}</p>
            </div>
        </div>
    `

    const newNotificationItem = notificationsPopup.querySelector(".notification-item");
    newNotificationItem.addEventListener("click", function() {
        delete_all_active(navbar);
        const url = newNotificationItem.dataset.content;
        loadContent(url);
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