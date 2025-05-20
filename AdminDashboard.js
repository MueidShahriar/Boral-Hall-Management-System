document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById('menu_bar');
    const sidebar = document.querySelector('.aside');
    const closeBtn = document.querySelector('.close span');

    if (!sessionStorage.getItem("userId")) {
        window.location.replace("LoginRegister.html");
        return;
    }

    const logout = document.querySelectorAll(".logout-btn");
    logout.forEach(button => {
        button.addEventListener("click", () => {
            sessionStorage.clear();
            localStorage.clear();
            window.location.replace("LoginRegister.html");
        });
    });

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('show');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('show');
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const adminId = urlParams.get('id');

    console.log("Admin ID:", adminId);
    console.log("Navigation links:", document.querySelectorAll('.sidebar a:not(.logout-btn)').length);
    console.log("Action buttons:", document.querySelectorAll('.action-btn').length);

    if (adminId) {
        const navLinks = document.querySelectorAll('.sidebar a:not(.logout-btn)');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                if (href.includes('?')) {
                    link.setAttribute('href', `${href}&id=${adminId}`);
                } else {
                    link.setAttribute('href', `${href}?id=${adminId}`);
                }
            }
        });

        const actionButtons = document.querySelectorAll('.action-btn');
        console.log("Found action buttons:", actionButtons.length);

        actionButtons.forEach((button, index) => {
            console.log(`Button ${index} attached`);

            button.addEventListener('click', function () {
                const card = this.closest('.card');
                if (!card) {
                    console.error("No parent card found for button");
                    return;
                }

                console.log("Card classes:", card.classList);
                const cardType = card.classList[1];
                console.log("Card type:", cardType);

                let targetPage = '';

                switch (cardType) {
                    case 'request':
                        targetPage = 'requests.html';
                        break;
                    case 'attendance':
                        targetPage = 'attendance.html';
                        break;
                    case 'allocation':
                        targetPage = 'room.html';
                        break;
                    case 'meal':
                        targetPage = 'mealreport.html';
                        break;
                    case 'student_info':
                        targetPage = 'StudentInformation.html';
                        break;
                    case 'complaint':
                        targetPage = 'complaints.html';
                        break;
                    default:
                        console.error("Unknown card type:", cardType);
                        return;
                }

                console.log("Navigating to:", `${targetPage}?id=${adminId}`);
                window.location.href = `${targetPage}?id=${adminId}`;
            });
        });
    }

    const complaintButton = document.querySelector('.card.complaint .action-btn');
    if (complaintButton) {
        complaintButton.addEventListener('click', function () {
            console.log("Complaint button clicked directly");
            window.location.href = adminId ? `complaints.html?id=${adminId}` : 'complaints.html';
        });
    }

    const roomButton = document.querySelector('.card.allocation .action-btn');
    if (roomButton) {
        roomButton.addEventListener('click', function () {
            console.log("Room allocation button clicked directly");
            window.location.href = adminId ? `room.html?id=${adminId}` : 'room.html';
        });
    }
});