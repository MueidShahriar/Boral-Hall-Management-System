document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById('menu_bar');
    const sidebar = document.querySelector('.aside');
    const closeBtn = document.querySelector('.close span');
    const complaintBtn = document.getElementById('complainButton');

    // Extract the user ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    // Add the ID parameter to all navigation links
    if (studentId) {
        // Update sidebar links
        const sidebarLinks = document.querySelectorAll('.sidebar a');
        sidebarLinks.forEach(link => {
            // Skip if it's the logout button
            if (link.id === 'logoutButton') return;
            
            const href = link.getAttribute('href');
            // Only update links that point to actual pages (not #)
            if (href && href !== '#') {
                // Check if the URL already has parameters
                if (href.includes('?')) {
                    link.setAttribute('href', `${href}&id=${studentId}`);
                } else {
                    link.setAttribute('href', `${href}?id=${studentId}`);
                }
            }
        });
    }

    // Sidebar toggle functionality
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('show');
    });

    // Handle logout buttons
    const logoutButtons = document.querySelectorAll("#logoutButton");
    logoutButtons.forEach(button => {
        button.addEventListener("click", () => {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = "LoginRegister.html";
        });
    });

    // Handle complaint button click
    if (complaintBtn) {
        complaintBtn.addEventListener('click', () => {
            if (studentId) {
                window.location.href = `complainbox.html?id=${studentId}`;
            } else {
                window.location.href = "complainbox.html";
            }
        });
    }

    // Handle dashboard card buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cardType = button.closest('.card').classList[1]; // Get the card type (payment, booking, etc.)
            let targetPage = '';
            
            // Determine which page to navigate to based on card type
            switch (cardType) {
                case 'payment':
                    targetPage = 'payments.html';
                    break;
                case 'booking':
                    targetPage = 'booking.html';
                    break;
                case 'meal':
                    targetPage = 'MealManagement.html';
                    break;
                case 'complaint':
                    targetPage = 'complainbox.html';
                    break;
                default:
                    return; // If no match, do nothing
            }
            
            // Navigate to the target page with the ID parameter
            if (studentId) {
                window.location.href = `${targetPage}?id=${studentId}`;
            } else {
                window.location.href = targetPage;
            }
        });
    });
});