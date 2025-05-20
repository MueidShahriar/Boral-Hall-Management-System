import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { sendGuestRoomStatusEmail } from "./GuestRoomBooking.js";

// ...initialize Firestore as in your other files...

async function approveOrRejectRequest(requestId, data, newStatus) {
    const firestore = getFirestore();
    const requestRef = doc(firestore, "GuestRoomRequests", requestId);

    // Update status in Firestore
    await updateDoc(requestRef, { status: newStatus });

    // Send email notification
    await sendGuestRoomStatusEmail({
        userEmail: data.email, // or data.userEmail if you store it separately
        guestEmail: data.email, // or a separate guest email if you have it
        guestName: data.name,
        status: newStatus
    });
}

// Example usage after admin clicks approve/reject:
// approveOrRejectRequest(requestId, requestData, "approved"); // or "rejected"

// You should call approveOrRejectRequest when admin approves/rejects a request.
// For example, in your admin UI, after fetching requests:

async function handleAdminAction(requestId, newStatus) {
    // Fetch the request data from Firestore
    const firestore = getFirestore();
    const requestRef = doc(firestore, "GuestRoomRequests", requestId);
    const requestSnap = await requestRef.get ? await requestRef.get() : await (await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js")).getDoc(requestRef);
    if (!requestSnap.exists()) {
        alert("Request not found.");
        return;
    }
    const requestData = requestSnap.data();
    await approveOrRejectRequest(requestId, requestData, newStatus);
    alert(`Request ${newStatus} and email sent.`);
}

// Example: Call this function when admin clicks approve/reject button
// handleAdminAction("REQUEST_DOC_ID", "approved"); // or "rejected"
