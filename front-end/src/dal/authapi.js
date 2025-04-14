
let authApi = {
    login(data) {
        return fetch("http://localhost/project/back-end/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(async response => {
            const data = await response.json();

            if (!response.ok) {
                return Promise.reject(data);
            }

            return data;
        })
    }
}