import { auth, googleProvider, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export class AuthManager {
    static getCurrentUser() {
        return auth.currentUser;
    }

    static isAdminMode() {
        return localStorage.getItem("airwise_admin_logged") === "true";
    }

    static validatePassword(password) {
        // เงื่อนไข: อักษรตัวใหญ่อย่างน้อย 1, อักษรพิเศษอย่างน้อย 1 และยาวกว่า 8 ตัวอักษร
        const regex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,}$/;
        return regex.test(password);
    }

    static async registerUser(email, password) {
        if (!email.includes("@gmail.com")) {
            throw new Error("ระบบรองรับเฉพาะที่อยู่อีเมล @gmail.com เท่านั้น");
        }
        if (!this.validatePassword(password)) {
            throw new Error("รหัสผ่านไม่ปลอดภัยพอ! ต้องมีพิมพ์ใหญ่ ตัวเลข และอักษรพิเศษอย่างน้อย 1 ตัว");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // บันทึกโปรไฟล์สมาชิกลง Cloud Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email, role: "member", createdAt: new Date().toISOString()
        });
        return userCredential.user;
    }

    static async loginUser(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    }

    static async loginWithGoogle() {
        const result = await signInWithPopup(auth, googleProvider);
        await setDoc(doc(db, "users", result.user.uid), {
            email: result.user.email, name: result.user.displayName, role: "member"
        }, { merge: true });
        return result.user;
    }

    static loginAdmin(username, password) {
        if (username === "pmproject" && password === "pmadmin123") {
            localStorage.setItem("airwise_admin_logged", "true");
            return true;
        }
        return false;
    }

    static async logoutAll() {
        await signOut(auth);
        localStorage.removeItem("airwise_admin_logged");
    }
}