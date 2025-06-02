async function handleLogin() {
    await loadContent("/src/ui/components/login.html");

    document.querySelector("#identifier").addEventListener("input", clenUpIdentifier);
    document.querySelector("#current-password").addEventListener("input", cleanUpPassword);

    const loginForm = document.querySelector(".login-form");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = new FormData(loginForm);

        const obj = {
            identifier: data.get("identifier"),
            password: data.get("current-password")
        }

        await authdal.login(obj)
            .then(async data => {
                isAuth = true;
                state.profileInfo = {...data.student};
                const expirationTime = Date.now() + 60 * 60 * 1000;  // 15 minutes from now
                localStorage.setItem('authData', JSON.stringify({
                    identifier: obj.identifier,
                    password: obj.password,
                    expiration: expirationTime
                }));

                const userAuthorization = document.querySelector(".user-authorization");
                userAuthorization.style.display = "none";
                showPopup("Welcome", true);
                await initializeApplication({ username: obj.identifier });
            })
            .catch(error => {
                validateLoginForm(error);
            });
    });
}

async function handleLogout() {
    localStorage.removeItem('authData');
    location.reload();
}

function validateLoginForm(error) {
    const loginServerSideErrorSpan = document.querySelector("#login-serverside-error");

    if (error.error) {
        loginServerSideErrorSpan.innerText = error.error;
    }


    if (error.identifier) {
        document.querySelector("#identifier-error").innerText = error.identifier;
        document.querySelector("#identifier").style.borderColor = "red";
    }

    if (error.password) {
        document.querySelector("#password-error").innerText = error.password;
        document.querySelector("#current-password").style.borderColor = "red";
    }
}

function clenUpIdentifier() {
    document.querySelector("#identifier-error").innerText = "";
    document.querySelector("#identifier").style.borderColor = "#dcdcdc";
    document.querySelector("#login-serverside-error").innerText = "";
}

function cleanUpPassword() {
    document.querySelector("#password-error").innerText = "";
    document.querySelector("#current-password").style.borderColor = "#dcdcdc";
    document.querySelector("#login-serverside-error").innerText = "";
}

async function handleSignUp() {
    await loadContent("/src/ui/components/signup.html");
}