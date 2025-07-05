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

    console.log("Action buttons:", document.querySelectorAll('.action-btn').length);

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
                    targetPage = 'Attendance.html';
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

            console.log("Navigating to:", targetPage);
            window.location.href = targetPage;
        });
    });
});
