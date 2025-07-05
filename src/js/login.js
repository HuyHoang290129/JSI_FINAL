import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const loginForm = document.querySelector("#login-form");
const emailform = loginForm.querySelector("#email");
const passwordform = loginForm.querySelector("#password");



loginForm.addEventListener("submit", (event) =>{
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form

    const email = emailform.value;
    const password = passwordform.value;
    // Kiểm tra các trường có trống không
    if (!email || !password) {
        alert("Vui lòng điền đủ các trường");
        return;
    }
    // Đăng nhập với Firebase Auth
    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            // Lấy thông tin user từ Firestore
            const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js");
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const roleId = userData.role_id;
                if (roleId === 1) {
                    window.location.href = "admin.html";
                } else if (roleId === 2) {
                    window.location.href = "index.html";
                } else {
                    alert("Vai trò không hợp lệ!");
                }
            } else {
                alert("Không tìm thấy dữ liệu người dùng!");
            }
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert("Mật khẩu không đúng");
        });
});