
function showPopup(message, isSuccess = true) {
    const popup = document.querySelector(".popup-message");
    popup.innerText = message;

    if (isSuccess) {
        popup.classList.remove("error");
    } else {
        popup.classList.add("error");
    }

    popup.classList.add("show");

    if (popup.timeoutId) {
        clearTimeout(popup.timeoutId);
    }

    popup.timeoutId = setTimeout(() => {
        popup.classList.remove("show");
    }, 3000);
}