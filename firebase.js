import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAehlBWLnXkspSiPbzM7ggL5RPnQKhGFD4",
  authDomain: "dust-project-f5e16.firebaseapp.com",
  projectId: "dust-project-f5e16",
  storageBucket: "dust-project-f5e16.firebasestorage.app",
  messagingSenderId: "1080173178977",
  appId: "1:1080173178977:web:60bdd7a58e4fba7db33a20",
  measurementId: "G-9MTNFCPRVF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// สามารถ Export ไปใช้ในไฟล์อื่นได้ในอนาคต
export { app };
// ==========================================
// ส่วนต่อท้ายไฟล์ js/firebase.js (เปิดใช้งาน Auth & Database)
// ==========================================
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ส่งออกตัวแปรและคำสั่งไปยัง Window Object เพื่อเชื่อมเข้ากับระบบปุ่มกดหลักใน app.js
window.fbAuth = auth;
window.fbDb = db;
window.fbGoogleProvider = googleProvider;
window.fbSignInWithPopup = signInWithPopup;
window.fbSignInWithEmail = signInWithEmailAndPassword;
window.fbCreateUserWithEmail = createUserWithEmailAndPassword;
window.fbSignOut = signOut;
window.fbOnAuthStateChanged = onAuthStateChanged;
window.fbDoc = doc;
window.fbSetDoc = setDoc;
window.fbGetDoc = getDoc;