document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById('menu_bar');
    const sidebar = document.querySelector('.aside');
    const closeBtn = document.querySelector('.close span');
    const complaintBtn = document.getElementById('complainButton');
    const attendanceBtn = document.getElementById('attendanceButton');

    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (studentId) {
        const sidebarLinks = document.querySelectorAll('.sidebar a');
        sidebarLinks.forEach(link => {
            if (link.id === 'logoutButton' || link.id === 'attendanceButton') return;
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                if (href.includes('?')) {
                    link.setAttribute('href', `${href}&id=${studentId}`);
                } else {
                    link.setAttribute('href', `${href}?id=${studentId}`);
                }
            }
        });
    }

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

    if (complaintBtn) {
        complaintBtn.addEventListener('click', () => {
            if (studentId) {
                window.location.href = `complainbox.html?id=${studentId}`;
            } else {
                window.location.href = "complainbox.html";
            }
        });
    }

    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cardType = button.closest('.card').classList[1];
            let targetPage = '';
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
                default:
                    return;
            }
            if (studentId) {
                window.location.href = `${targetPage}?id=${studentId}`;
            } else {
                window.location.href = targetPage;
            }
        });
    });
    
    if (attendanceBtn) {
        attendanceBtn.addEventListener('click', () => {
            handleAttendance(studentId);
        });
    }
    
    function handleAttendance(studentId) {
        if (!studentId) {
            alert("User ID not found. Please log in again.");
            return;
        }
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        if (currentHour < 8 || currentHour >= 20) {
            alert("Attendance can only be recorded between 8:00 AM and 8:00 PM");
            return;
        }
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
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
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const hallLatitude = 24.289440;
                const hallLongitude = 89.008940;
                const userLatitude = position.coords.latitude;
                const userLongitude = position.coords.longitude;
                const distance = calculateDistance(
                    hallLatitude, hallLongitude,
                    userLatitude, userLongitude
                );
                document.body.removeChild(loadingMessage);
                if (distance <= 0.1) {
                    const today = new Date();
                    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
                    const timestamp = today.toISOString();
                    const attendanceData = {
                        latitude: userLatitude,
                        longitude: userLongitude,
                        timestamp: timestamp,
                        date: dateString
                    };
                    saveAttendanceToFirestore(studentId, dateString, attendanceData);
                } else {
                    alert(`You must be within 100 meters of the hall to record attendance. You are approximately ${(distance * 1000).toFixed(0)} meters away.`);
                }
            },
            (error) => {
                document.body.removeChild(loadingMessage);
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
    
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }
    
    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    function saveAttendanceToFirestore(studentId, dateString, attendanceData) {
        try {
            const attendanceRef = firebase.firestore()
                .collection('attendance')
                .doc(studentId)
                .collection('attendance_by_date')
                .doc(dateString);
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