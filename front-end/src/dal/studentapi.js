
const studentApi = {
    baseURL: "http://localhost/project/back-end/students",

    async getStudents(page = 1) {
        return fetch(`${this.baseURL}?page=${page}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Something's wrong with the server");
                }
                return response.json();
            })
    },
    getById() {

    },
    addStudent(newStudentData) {
        return fetch('http://localhost/project/back-end/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newStudentData)
        })
    },
    updateStudent() {

    },
    async deleteById(id) {
        return fetch(`${this.baseURL}?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    },
    deleteSelected() {

    },
}
