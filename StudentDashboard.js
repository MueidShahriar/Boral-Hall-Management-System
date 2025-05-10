document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById('menu_bar');
    const sidebar = document.querySelector('.aside');
    const closeBtn = document.querySelector('.close span');
    const complaintBtn = document.getElementById('complainButton');


    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('show');
    });

    const logoutButtons = document.querySelectorAll("#logoutButton");
    logoutButtons.forEach(button => {
        button.addEventListener("click", () => {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = "LoginRegister.html";
        });
    });
    complaintBtn.addEventListener('click', () => {
       window.location.href = "complainbox.html";
    });
});

