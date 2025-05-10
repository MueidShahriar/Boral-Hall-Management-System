import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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
const auth = getAuth(app);
const database = getDatabase(app);

const signInButton = document.getElementById("signInButton");
const signUpButton = document.getElementById("signUpButton");
const signInContainer = document.getElementById("signIn");
const signUpContainer = document.getElementById("signup");

signInButton.addEventListener("click", () => {
  signInContainer.style.display = "block";
  signUpContainer.style.display = "none";
});

signUpButton.addEventListener("click", () => {
  signInContainer.style.display = "none";
  signUpContainer.style.display = "block";
});

// Add this import at the top of your file:
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Initialize Firestore
const firestore = getFirestore(app);

// Function to check if a room number is valid
function isValidRoomNumber(roomNumber) {
  // Convert room number to integer for comparison
  const room = parseInt(roomNumber);
  
  // Check if room is in any of the valid ranges
  return (
    (room >= 102 && room <= 117) ||
    (room >= 202 && room <= 217) ||
    (room >= 302 && room <= 317) ||
    (room >= 402 && room <= 417) ||
    (room >= 502 && room <= 517) ||
    (room >= 602 && room <= 617)
  );
}

// Function to create a new room with empty seats
async function createNewRoom(roomNumber) {
  const roomRef = doc(firestore, "room", roomNumber);
  
  // Create room document with timestamp
  await setDoc(roomRef, {
    created: serverTimestamp(),
    roomNumber: roomNumber
  });
  
  // Create 6 seats in the member collection of this room
  const memberCollectionRef = collection(roomRef, "members");
  
  for (let i = 1; i <= 6; i++) {
    const seatRef = doc(memberCollectionRef, `seat${i}`);
    await setDoc(seatRef, {
      isEmpty: true,
      lastUpdated: serverTimestamp()
    });
  }
  
  console.log(`Created new room ${roomNumber} with 6 empty seats`);
}

// In the signUpForm submit event listener, update the registration process
const signUpForm = document.getElementById("signUpForm");
signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const studentID = document.getElementById("studentID").value;
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("cPassword").value;
  const email = document.getElementById("email").value;
  const address = document.getElementById("address").value;
  const fatherName = document.getElementById("fatherName").value;
  const motherName = document.getElementById("motherName").value;
  const phone = document.getElementById("phone").value;
  const department = document.getElementById("department").value;
  const batch = document.getElementById("batch").value;
  const room = document.getElementById("room").value;
  const dob = document.getElementById("dob").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    // First check if the room exists
    const roomRef = doc(firestore, "room", room);
    const roomSnapshot = await getDoc(roomRef);
    
    // If room doesn't exist, check if it's a valid room number
    if (!roomSnapshot.exists()) {
      if (!isValidRoomNumber(room)) {
        alert(`Room ${room} is not a valid room number. Please enter a valid room number.`);
        return;
      }
      
      // Create the new room with empty seats
      await createNewRoom(room);
      console.log(`Room ${room} created successfully.`);
    }
    
    // Check for available seats in the room
    let seatAssigned = false;
    let assignedSeat = "";
    
    // Try each seat from seat1 to seat6
    for (let i = 1; i <= 6; i++) {
      const seatRef = doc(roomRef, `members/seat${i}`);
      const seatSnapshot = await getDoc(seatRef);
      
      // If the seat document doesn't exist or isEmpty is true, we can assign this seat
      if (!seatSnapshot.exists() || seatSnapshot.data().isEmpty === true) {
        assignedSeat = `seat${i}`;
        
        // Update the seat with student information
        await setDoc(seatRef, {
          id: studentID,
          name: name,
          batch: batch,
          department: department,
          isEmpty: false,
          lastUpdated: serverTimestamp()
        });
        
        seatAssigned = true;
        break;
      }
    }
    
    if (!seatAssigned) {
      alert(`Room ${room} is full. Please select a different room.`);
      return;
    }
    
    // Continue with user registration in Authentication and Realtime Database
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save user data to Realtime Database
    await set(ref(database, `users/${studentID}`), {
      name: name,
      email: email,
      address: address,
      father_Name: fatherName,
      mother_Name: motherName,
      phone: phone,
      department: department,
      batch: batch,
      room: room,
      seat: assignedSeat,  // Add the assigned seat information
      dob: dob,
      role: "member",
      id: studentID
    });
    
    alert(`Registered successfully! You have been assigned to Room ${room}, ${assignedSeat}.`);
    signUpForm.reset();
    signInContainer.style.display = "block";
    signUpContainer.style.display = "none";
    
  } catch (error) {
    console.error("Registration error:", error);
    alert("Error during registration: " + error.message);
  }
});

// The rest of your code remains the same

const signInForm = document.getElementById("signInForm");
signInForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const dbRef = ref(database);
      
      // Get all users from the database
      get(child(dbRef, "users"))
        .then((snapshot) => {
          if (snapshot.exists()) {
            let foundUser = null;
            let studentId = null;
            
            // Find the user with the matching email
            snapshot.forEach((childSnapshot) => {
              const userData = childSnapshot.val();
              if (userData.email === email) {
                foundUser = userData;
                studentId = childSnapshot.key; // This is the student ID (used as the key in the database)
                return true;
              }
            });
            
            if (foundUser) {
              // Store the studentId in session storage for possible use by other pages
              sessionStorage.setItem("userId", studentId);
              
              // Redirect based on role, including the ID as a URL parameter
              if (foundUser.role === "admin") {
                window.location.href = `AdminDashboard.html?id=${studentId}`;
              } else {
                window.location.href = `StudentDashboard.html?id=${studentId}`;
              }
            } else {
              alert("User data not found in database!");
            }
          } else {
            alert("No user data available in database!");
          }
          signInForm.reset();
        })
        .catch((error) => {
          alert("Error accessing user data: " + error.message);
        });
    })
    .catch((error) => {
      alert("Login Error: " + error.message);
    });
});

document.querySelectorAll('.toggle-password').forEach(toggle => {
  toggle.addEventListener('click', function () {
    const input = this.closest('.input-group').querySelector('input');
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
  });
});