let isAuth = false;

document.addEventListener("DOMContentLoaded", async function () {
    const storedAuthData = localStorage.getItem('authData');
    if (storedAuthData) {
        const authData = JSON.parse(storedAuthData);
        const currentTime = Date.now();

        if (authData.expiration > currentTime) {
            const data = {
                identifier: authData.identifier,
                password: authData.password
            };

            await authApi.login(data)
                .then(async data => {
                    isAuth = true;
                    showPopup("Welcome back!", true);
                    await initializeApplication({ username: authData.identifier });
                })
                .catch(error => {
                    console.error("Auto-login failed:", error);
                });
        } else {
            localStorage.removeItem('authData');
        }
    }

    if ("serviceWorker" in navigator) {
        try {
            await navigator.serviceWorker.register("/sw.js")
            console.log("Service worker register successful");
        } catch (e) {
            console.log("Service worker register fail");
        }
    }

    if (!isAuth) {
        const headerUserRelated = document.querySelector(".header-user-related");
        headerUserRelated.innerHTML += `
        <div class="user-authorization">
            <button class="login" onclick="handleLogin()">Login</button>
            <button class="signUp" onclick="handleSignUp()">Sign up</button>
        </div>
        `
        const content = document.querySelector(".content");
        content.innerHTML = `<h2 class="not-authorized-message">You are not authorized to view this page. Please sign up or login to have access to this content</h2>`;
    }
});