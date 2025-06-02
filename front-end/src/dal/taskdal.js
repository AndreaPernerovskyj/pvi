
const taskDal = {
    baseURL: "http://localhost/project/back-end/tasks",

    getTasks: function (id, status) {
        return fetch(`${this.baseURL}?studentId=${id}&status=${status}`)
            .then(res => res.json())
            .then(data => data.tasks);
    }
}