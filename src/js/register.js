import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const registerForm = document.querySelector("#register-form");

registerForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form

    let email = registerForm.querySelector(".inp-email").value;
    let password = registerForm.querySelector(".inp-pwd").value;
    let age = registerForm.querySelector(".inp-age")?.value;
    let gender = registerForm.querySelector(".inp-gender")?.value;
    let birthday = registerForm.querySelector(".inp-birthday")?.value;
    let role_id = 2; // Mặc định là quyền của guest. (1: Admin, 2: Guest)

    // Kiểm tra các trường trống
    if (!email || !password || !age || !gender || !birthday) {
        alert("Vui lòng điền đủ các trường");
        return;
    }

    // Tạo tài khoản với Firebase Auth
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            let userData = {
                email,
                password, // Lưu mật khẩu nếu muốn (không khuyến khích lưu plain text)
                age,
                gender,
                birthday,
                role_id,
                balance: 0, // Số dư mặc định
            };
            // Lưu user với id là uid
            import("https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js").then(({ setDoc, doc }) => {
                setDoc(doc(db, "users", userCredential.user.uid), userData)
                    .then(() => {
                        alert("Đăng ký thành công");
                        window.location.href = "login.html";
                    })
                    .catch((error) => {
                        alert("Đăng ký thất bại: " + error.message);
                        console.error("Lỗi Firestore:", error);
                    });
            });
        })
        .catch((error) => {
            alert("Đăng ký thất bại: " + error.message);
            console.error("Lỗi Auth:", error);
        });
});