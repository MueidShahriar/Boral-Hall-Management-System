import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
// Add this to your imports at the top
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

const signUpForm = document.getElementById("signUpForm");
signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const fName = document.getElementById("fName").value;
  const lName = document.getElementById("lName").value;
  const studentID = document.getElementById("studentID").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("cPassword").value;
  const phone = document.getElementById("phone").value;
  const dob = document.getElementById("dob").value;
  const address = document.getElementById("address").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      set(ref(database, `users/${studentID}`), {
        firstName: fName,
        lastName: lName,
        studentID: studentID,
        email: email,
        phone: phone,
        dob: dob,
        address: address,
        role: "member"
      }).then(() => {
        alert("Registered successfully and data saved!");
        signUpForm.reset();
        signInContainer.style.display = "block";
        signUpContainer.style.display = "none";
      }).catch((error) => {
        alert("Error saving data: " + error.message);
      });
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

const signInForm = document.getElementById("signInForm");
signInForm.addEventListener("submit", (e) => {
  e.preventDefault();

 
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      
      // Search for the user in the database to check role
      const dbRef = ref(database);
      
      // Query the entire users collection
      get(child(dbRef, "users"))
        .then((snapshot) => {
          if (snapshot.exists()) {
            let foundUser = null;
            let userId = null;
            
            // Iterate through all users to find the one with matching email
            snapshot.forEach((childSnapshot) => {
              const userData = childSnapshot.val();
              if (userData.email === email) {
                foundUser = userData;
                userId = childSnapshot.key;
                return true; // Break the forEach loop
              }
            });
            
            if (foundUser) {
              // Store user ID in session storage for later use
              sessionStorage.setItem("userId", userId);
              
              // Check role and redirect accordingly
              if (foundUser.role === "admin") {
                alert("Admin login successful!");
                window.location.href = "AdminDashboard.html";
              } else {
                // Default role is member
                alert("Login successful!");
                window.location.href = "StudentDashboard.html";
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
