import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import emailjs from "https://cdn.jsdelivr.net/npm/emailjs-com@3.2.0/dist/email.min.js";

// Your Firebase config (reuse from your project)
const firebaseConfig = {
    apiKey: "AIzaSyBF-nMMW5lG44JfHxx4HxCbf5N81geOiRs",
    authDomain: "bauet-hms-63f5b.firebaseapp.com",
    databaseURL: "https://bauet-hms-63f5b-default-rtdb.firebaseio.com",
    projectId: "bauet-hms-63f5b",
    storageBucket: "bauet-hms-63f5b.appspot.com",
    messagingSenderId: "200038506273",
    appId: "1:200038506273:web:2e141fc9ec36de049ae860"
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const guestForm = document.getElementById("guestRoomForm");
    if (!guestForm) return;

    guestForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
            nid: document.getElementById("nid").value.trim(),
            name: document.getElementById("name").value.trim(),
            dob: document.getElementById("dob").value,
            relationship: document.getElementById("relationship").value,
            phone: document.getElementById("phone").value.trim(),
            email: document.getElementById("email").value.trim(),
            checkin: document.getElementById("checkin").value,
            checkout: document.getElementById("checkout").value,
            createdAt: serverTimestamp(),
            status: "pending" // Mark as pending for admin approval
        };

        try {
            // Store in GuestRoom collection
            await addDoc(collection(firestore, "GuestRoom"), data);

            // Also send a request to admin (store in GuestRoomRequests collection)
            await addDoc(collection(firestore, "GuestRoomRequests"), data);

            alert("Guest room booking request sent to admin!");
            guestForm.reset();
        } catch (error) {
            alert("Failed to submit booking: " + error.message);
        }
    });
});

export async function sendGuestRoomStatusEmail({ userEmail, guestEmail, guestName, status }) {
    // EmailJS initialization (replace with your EmailJS user ID)
    emailjs.init("YOUR_EMAILJS_USER_ID");

    // Prepare email parameters
    const templateParams = {
        to_user: userEmail,
        to_guest: guestEmail,
        guest_name: guestName,
        status: status // "approved" or "rejected"
    };

    // Send email to user
    await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID_USER", templateParams);

    // Send email to guest (optional, if different template)
    await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID_GUEST", templateParams);
}

// Example usage (call this in your admin panel after approval/rejection):
// await sendGuestRoomStatusEmail({
//     userEmail: "user@example.com",
//     guestEmail: "guest@example.com",
//     guestName: "Guest Name",
//     status: "approved" // or "rejected"
// });