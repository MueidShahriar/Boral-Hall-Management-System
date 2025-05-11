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
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
const firestore = getFirestore(app);

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

function isValidRoomNumber(roomNumber) {
  const room = parseInt(roomNumber);
  return (
    (room >= 102 && room <= 117) ||
    (room >= 202 && room <= 217) ||
    (room >= 302 && room <= 317) ||
    (room >= 402 && room <= 417) ||
    (room >= 502 && room <= 517) ||
    (room >= 602 && room <= 617)
  );
}

async function createNewRoom(roomNumber) {
  const roomRef = doc(firestore, "room", roomNumber);
  
  await setDoc(roomRef, {
    created: serverTimestamp(),
    roomNumber: roomNumber
  });
  
  const memberCollectionRef = collection(roomRef, "members");
  
  for (let i = 1; i <= 6; i++) {
    const seatRef = doc(memberCollectionRef, `seat${i}`);
    await setDoc(seatRef, {
      isEmpty: true,
      lastUpdated: serverTimestamp()
    });
  }
}

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
    const roomRef = doc(firestore, "room", room);
    const roomSnapshot = await getDoc(roomRef);
    
    if (!roomSnapshot.exists()) {
      if (!isValidRoomNumber(room)) {
        alert(`Room ${room} is not a valid room number. Please enter a valid room number.`);
        return;
      }
      
      await createNewRoom(room);
    }
    
    let seatAssigned = false;
    let assignedSeat = "";
    
    for (let i = 1; i <= 6; i++) {
      const seatRef = doc(roomRef, `members/seat${i}`);
      const seatSnapshot = await getDoc(seatRef);
      
      if (!seatSnapshot.exists() || seatSnapshot.data().isEmpty === true) {
        assignedSeat = `seat${i}`;
        
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
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
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
      seat: assignedSeat,
      dob: dob,
      role: "member",
      id: studentID
    });
    
    alert(`Registered successfully! Welcome ${name}!`);
    signUpForm.reset();
    signInContainer.style.display = "block";
    signUpContainer.style.display = "none";
    
  } catch (error) {
    console.error("Registration error:", error);
    alert("Error during registration: " + error.message);
  }
});

const signInForm = document.getElementById("signInForm");
signInForm.addEventListener("submit", function(e) {
  e.preventDefault();
  
  const studentId = document.getElementById('loginStudentId').value;
  const password = document.getElementById('loginPassword').value;

  const dbRef = ref(database);
  get(child(dbRef, `users/${studentId}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const email = snapshot.val().email;
        const role = snapshot.val().role;

        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            sessionStorage.removeItem("loggedOut");
            sessionStorage.setItem("userId", studentId);
            
            if (role === 'admin') {
              window.location.href = `AdminDashboard.html?id=${studentId}`;
            } else {
              window.location.href = `StudentDashboard.html?id=${studentId}`;
            }
          })
          .catch((error) => {
            console.error("Authentication error:", error);
            alert("Authentication Error: " + error.message);
          });
      } else {
        alert("Student ID not found in the database.");
      }
    })
    .catch((error) => {
      console.error("Database error:", error);
      alert("Database Error: " + error.message);
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