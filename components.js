import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export class ComponentManager {
    static initCookieBanner() {
        const banner = document.getElementById("cookie-banner");
        const acceptBtn = document.getElementById("accept-cookie-btn");
        
        if (!localStorage.getItem("airwise_cookie_accepted")) {
            banner.classList.remove("hidden");
        }

        acceptBtn.addEventListener("click", () => {
            localStorage.setItem("airwise_cookie_accepted", "true");
            banner.classList.add("hidden");
        });
    }

    static async initFloatingContact() {
        const widget = document.getElementById("floating-contact-widget");
        const toggleBtn = document.getElementById("contact-toggle");
        const subMenu = document.getElementById("contact-sub-menu");
        
        try {
            // ตรวจสอบข้อมูลผู้ดูแลระบบจากฐานข้อมูล Firestore
            const querySnapshot = await getDocs(collection(db, "admin_contacts"));
            if (querySnapshot.empty) {
                widget.classList.add("hidden");
                return;
            }

            subMenu.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const item = document.createElement("a");
                item.className = "contact-item";
                item.href = data.url;
                item.target = "_blank";
                item.innerHTML = `<i class="${data.iconClass}"></i> <span>${data.name}</span>`;
                subMenu.appendChild(item);
            });

            widget.classList.remove("hidden");
            
            toggleBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                subMenu.classList.toggle("hidden");
            });

            document.addEventListener("click", () => subMenu.classList.add("hidden"));
        } catch (err) {
            console.error("Widget load failed:", err);
            widget.classList.add("hidden"); // ซ่อนหากเกิดข้อผิดพลาด ป้องกันหน้าพัง
        }
    }
}