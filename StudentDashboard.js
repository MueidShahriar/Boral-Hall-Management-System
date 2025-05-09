document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById('menu_bar');
    const sidebar = document.querySelector('.aside');
    const closeBtn = document.querySelector('.close span');

    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('show');
    });

    document.getElementById("logoutBtn").addEventListener("click", function () {
        sessionStorage.clear();
        localStorage.clear();
        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        });
        window.location.href = "login.html";
    });

    document.getElementById("logoutButton").addEventListener("click", () => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "LoginRegister.html";
    });
});

