const navbar = document.querySelector('.navbar');
const content = document.querySelector('.content');
const notification_popup = document.querySelector('.notifications-popup');
const user_info = document.querySelector(".user-info")
const header_title = document.getElementById("header-title");

const loadContent = async (url) => {
    switch (url) {
        case "./resources/pages/students.html": {
            loadStudentsPage(url);
            break;
        }
        default: {
            const response = await fetch(url);
            if(!response.ok) {
                content.innerHTML = `HTTP error! Status: ${response.status}`;
            }

            content.innerHTML = await response.text();
        }
    }
}

function delete_all_active(navbar) {
    for(let item of  navbar.children) {
        item.classList.remove('active');
    }
}

header_title.addEventListener("click", () => {
    const url = header_title.dataset.content;
    loadContent(url);
    delete_all_active(navbar)
    document.querySelector(".students-navbar").classList.add('active');
})

user_info.addEventListener("click", e => {
    delete_all_active(navbar)
    loadContent(user_info.dataset.content);
})

for(let item of notification_popup.children) {
    item.addEventListener("click", e => {
        delete_all_active(navbar)
        const url = item.dataset.content;
        loadContent(url);
    })
}

for(let item of  navbar.children) {
    item.addEventListener('click', () => {
        if(!item.classList.contains('active')) {
            delete_all_active(navbar)
            item.classList.add('active');
            const url = item.dataset.content;
            loadContent(url);
        }
    })
}

const initialContent = navbar.querySelector('.active').dataset.content;
loadContent(initialContent);

function loadStudentsPage (url) {
    fetch(url)
        .then((response) => response.text())
        .then((html) => {
            content.innerHTML = html;

            state.students.map((student) => {
                create_new_row(student);
            })

            $(".add-students-btn").on("click", (e) => {
                e.preventDefault();
                add_students_modal();

                $(".add-student-modal-container").addClass("show");
                $(".add-edit-modal-header").focus();
            })
        })
        .catch((error) => console.error('Error loading students.html:', error));
}

