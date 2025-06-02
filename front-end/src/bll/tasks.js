function loadTasksPage(url) {
    fetch(url)
        .then((response) => response.text())
        .then((html) => {
            content.innerHTML = html;

            loadTasks(state.profileInfo.id, "todo");
            loadTasks(state.profileInfo.id, "in_progress");
            loadTasks(state.profileInfo.id, "done");
            loadTasks(state.profileInfo.id, "archived");
        })
        .catch((error) => console.error("Error loading tasks.html:", error));
}

function loadTasks(id, status) {
    taskDal.getTasks(id, status)
        .then((todoTasks) => {
            if (todoTasks.length > 0) {
                todoTasks.forEach((task) => {
                    createTask(task);
                })
            }
        });
}

function createTask(task) {
    const taskHtml = `
        <li class="task-item">
            <div class="task-header">
                <span class="task-title">${task.title}</span>
                    <span class="task-due-date">Due: ${task.due_date}</span>
            </div>
             <div class="task-description">
                 ${task.description}
             </div>
             <div class="task-footer">
                 <span class="task-priority priority-high">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                 <div class="task-actions">
                     <button class="task-action-btn">✏️</button>
                     <button class="task-action-btn">🗑️</button>
                 </div>
            </div>
        </li>
    `;

    switch (task.status) {
        case "todo":
            renderTask(taskHtml, document.querySelector(".todo-list"));
            break;
        case "in_progress":
            renderTask(taskHtml, document.querySelector(".in-progress-list"));
            break;
        case "done":
            renderTask(taskHtml, document.querySelector(".done-list"));
             break;
        case "archived":
            renderTask(taskHtml, document.querySelector(".archived-list"));
            break;
    }
}

function renderTask(html, currentList) {
    const taskBlock = currentList.closest(".task-block");
    currentList.innerHTML += html;
    const counter = taskBlock.querySelector(".task-count")
    counter.textContent = Number(counter.textContent) + 1;
    const h3 = currentList.querySelector("h3");
    if (h3) {
        h3.remove();
    }
}