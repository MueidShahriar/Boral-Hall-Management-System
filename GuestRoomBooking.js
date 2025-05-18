<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", () => {
    const guestForm = document.getElementById("guestForm");
    const guestList = document.getElementById("guestList");

    guestForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const guestName = document.getElementById("guestName").value.trim();
        if (guestName) {
            const listItem = document.createElement("li");
            listItem.textContent = guestName;
            guestList.appendChild(listItem);

            document.getElementById("guestName").value = "";
        }
    });
=======
document.addEventListener("DOMContentLoaded", () => {
    const guestForm = document.getElementById("guestForm");
    const guestList = document.getElementById("guestList");

    guestForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const guestName = document.getElementById("guestName").value.trim();
        if (guestName) {
            const listItem = document.createElement("li");
            listItem.textContent = guestName;
            guestList.appendChild(listItem);

            document.getElementById("guestName").value = "";
        }
    });
>>>>>>> 1a2a16efe8b53d84fb0517044d137463536d3e73
});