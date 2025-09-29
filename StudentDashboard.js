document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById('menu_bar');
    const sidebar = document.querySelector('.aside');
    const closeBtn = document.querySelector('.close span');
    const complaintBtn = document.getElementById('complainButton');
    const attendanceBtn = document.getElementById('attendanceButton');

    // Extract the user ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    // Add the ID parameter to all navigation links
    if (studentId) {
        // Update sidebar links
        const sidebarLinks = document.querySelectorAll('.sidebar a');
        sidebarLinks.forEach(link => {
            // Skip if it's the logout button or attendance button (handled separately)
            if (link.id === 'logoutButton' || link.id === 'attendanceButton') return;
            
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
                    targetPage = 'GuestRoomBooking.html';
                    break;
                case 'meal':
                    targetPage = 'MealManagement.html';
                    break;
                case 'complaint':
                    targetPage = 'complainbox.html';
                    break;
                case 'notices':
                    targetPage = 'Notices.html';
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
    
    // Handle attendance button click
    if (attendanceBtn) {
        attendanceBtn.addEventListener('click', () => {
            handleAttendance(studentId);
        });
    }
    
    // Function to handle attendance recording
    function handleAttendance(studentId) {
        if (!studentId) {
            alert("User ID not found. Please log in again.");
            return;
        }
        
        // Check if the current time is between 8:00 AM and 8:00 PM
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        
        if (currentHour < 8 || currentHour >= 20) {
            alert("Attendance can only be recorded between 8:00 AM and 8:00 PM");
            return;
        }
        
        // Check if geolocation is supported by the browser
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        
        // Show loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.id = 'loading-message';
        loadingMessage.style.position = 'fixed';
        loadingMessage.style.top = '50%';
        loadingMessage.style.left = '50%';
        loadingMessage.style.transform = 'translate(-50%, -50%)';
        loadingMessage.style.padding = '20px';
        loadingMessage.style.backgroundColor = 'rgba(0,0,0,0.8)';
        loadingMessage.style.color = 'white';
        loadingMessage.style.borderRadius = '10px';
        loadingMessage.style.zIndex = '1000';
        loadingMessage.textContent = 'Verifying your location...';
        document.body.appendChild(loadingMessage);
        
        // Get current position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Hall location coordinates (example - replace with actual coordinates)
                const hallLatitude = 24.289440; // Replace with actual hall latitude
                const hallLongitude = 89.008940; // Replace with actual hall longitude
                
                // User's current position
                const userLatitude = position.coords.latitude;
                const userLongitude = position.coords.longitude;
                
                // Calculate distance between two points using Haversine formula
                const distance = calculateDistance(
                    hallLatitude, hallLongitude,
                    userLatitude, userLongitude
                );
                
                // Remove loading message
                document.body.removeChild(loadingMessage);
                
                // Check if user is within 100 meters of the hall
                if (distance <= 0.1) { // 0.1 km = 100 meters
                    // Format current date for Firestore document
                    const today = new Date();
                    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
                    const timestamp = today.toISOString();
                    
                    // Prepare data for Firestore
                    const attendanceData = {
                        latitude: userLatitude,
                        longitude: userLongitude,
                        timestamp: timestamp,
                        date: dateString
                    };
                    
                    // Send data to Firestore
                    saveAttendanceToFirestore(studentId, dateString, attendanceData);
                } else {
                    alert(`You must be within 100 meters of the hall to record attendance. You are approximately ${(distance * 1000).toFixed(0)} meters away.`);
                }
            },
            (error) => {
                // Remove loading message
                document.body.removeChild(loadingMessage);
                
                // Handle geolocation errors
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        alert("Location permission denied. Please enable location services to mark attendance.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("The request to get user location timed out.");
                        break;
                    default:
                        alert("An unknown error occurred while trying to access your location.");
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }
    
    // Function to calculate distance between two points using Haversine formula
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    }
    
    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Function to save attendance data to Firestore
    function saveAttendanceToFirestore(studentId, dateString, attendanceData) {
        // This assumes Firebase is already initialized in your project
        // If you need to import Firebase, you'll need to add the imports at the top of your file
        
        try {
            // Reference to the student's attendance document for today
            const attendanceRef = firebase.firestore()
                .collection('attendance')
                .doc(studentId)
                .collection('attendance_by_date')
                .doc(dateString);
            
            // Set attendance data
            attendanceRef.set(attendanceData)
                .then(() => {
                    alert("Attendance recorded successfully!");
                })
                .catch((error) => {
                    console.error("Error recording attendance: ", error);
                    alert("Failed to record attendance. Please try again.");
                });
        } catch (error) {
            console.error("Firestore error: ", error);
            alert("Error connecting to database. Please ensure you're online and try again.");
        }
    }
});