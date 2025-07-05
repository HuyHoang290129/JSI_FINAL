import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Hiển thị email và mật khẩu người dùng
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const container = document.querySelector('.profile-container');
      let html = `<h1 class="profile-title">Thông tin cá nhân</h1>`;
      html += '<div style="margin-bottom:24px;text-align:center;">';
      html += `<span style='display:inline-block;width:64px;height:64px;background:#e3f2fd;border-radius:50%;line-height:64px;font-size:2.2rem;color:#2563eb;margin-bottom:8px;'>`;
      html += `${userData.usernameForm ? userData.usernameForm[0].toUpperCase() : (userData.email ? userData.email[0].toUpperCase() : '?')}</span><br>`;
      html += `<span style='font-weight:600;color:#2563eb;'>${userData.usernameForm || userData.email}</span>`;
      html += '</div>';
      html += '<div style="margin-bottom:18px;">';
      html += `<div class="profile-info"><span class="profile-label">Email:</span> <span class="profile-value">${userData.email || user.email}</span></div>`;
      html += `<div class="profile-info"><span class="profile-label">Mật khẩu:</span> <span class="profile-value">${userData.password ? userData.password : '(Không thể hiển thị)'}</span></div>`;
      html += `<div class="profile-info"><span class="profile-label">Độ tuổi:</span> <span class="profile-value">${userData.age ? userData.age : '(Chưa cập nhật)'}</span></div>`;
      html += `<div class="profile-info"><span class="profile-label">Giới tính:</span> <span class="profile-value">${userData.gender ? userData.gender : '(Chưa cập nhật)'}</span></div>`;
      html += `<div class="profile-info"><span class="profile-label">Ngày sinh:</span> <span class="profile-value">${userData.birthday ? userData.birthday : '(Chưa cập nhật)'}</span></div>`;
      html += '</div>';
      html += `<button onclick=\"window.location.href='login.html'\" class=\"btn btn-primary\" style=\"width:100%;margin-top:18px;\">Về trang chủ</button>`;
      container.innerHTML = html;
    } else {
      alert("Không tìm thấy dữ liệu người dùng!");
    }
  } else {
    window.location.href = "login.html";
  }
});