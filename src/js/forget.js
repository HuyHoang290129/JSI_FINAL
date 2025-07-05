 import { auth } from "./src/js/firebase-config.js";
        import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
        const forgotForm = document.getElementById('forgot-form');
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            try {
                await sendPasswordResetEmail(auth, email);
                alert('Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.');
            } catch (error) {
                alert('Không gửi được email. Vui lòng kiểm tra lại email hoặc thử lại sau.');
            }
        });