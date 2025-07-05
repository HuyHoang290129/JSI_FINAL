// Lấy sản phẩm ngẫu nhiên từ Firestore và hiển thị ở Hot Sale
// Để tránh lỗi import, chỉ import Firestore nếu file được nhúng với type="module"
// Nếu không, hãy tạo file riêng cho Firestore hoặc nhúng script Firestore trực tiếp trong HTML với type="module"

// Nếu bạn không thể dùng import ở đây, hãy chuyển phần lấy hot sale từ Firestore sang file mới (ví dụ: hot-sale-firestore.js) và nhúng nó với <script type="module"> trong index.html

// XÓA hoặc COMMENT các dòng import này nếu bạn không dùng type="module" ở index.html
import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";


// Lấy sản phẩm ngẫu nhiên từ Firestore và hiển thị ở Hot Sale
async function showHotSaleFromFirestore() {
    const hotSaleDiv = document.querySelector('.hot-sale-row');
    if (!hotSaleDiv) return;
    const querySnapshot = await getDocs(collection(db, "products"));
    const allProducts = [];
    querySnapshot.forEach(docSnap => {
        const p = docSnap.data();
        p.id = docSnap.id;
        allProducts.push(p);
    });
    hotSaleDiv.innerHTML = ""; // Xóa sản phẩm cũ trước khi render mới
    // Nếu không có sản phẩm thì hiển thị thông báo
    if (allProducts.length === 0) {
        hotSaleDiv.innerHTML = '<div style="width:100%;text-align:center;color:#e74c3c;font-size:1.2rem;margin-top:32px;">Không có sản phẩm để hiển thị.</div>';
        return;
    }
    // Nếu chỉ có 1 hoặc 2 sản phẩm thì chỉ hiển thị bấy nhiêu
    const count = Math.min(3, allProducts.length);
    const shuffled = allProducts.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const randomProducts = shuffled.slice(0, 3);
    // Debug: log ra số lượng và dữ liệu sản phẩm lấy được
    console.log('Số sản phẩm lấy được:', allProducts.length, allProducts);
    randomProducts.forEach(product => {
        console.log('Render sản phẩm:', product); // Debug từng sản phẩm
        const hotCard = `
            <div class="col-4">
                <div class="px-2 product-card" style="border:1px solid #eee;border-radius:10px;padding:16px;margin-bottom:18px;background:#fff;box-shadow:0 2px 8px #0001;">
                    <img src="${product.image}" alt="${product.name}" style="width:100%;max-width:180px;object-fit:cover;border-radius:8px;">
                    <h5 style="margin:12px 0 6px 0;font-size:1.1rem;">${product.name}</h5>
                    <p style="margin:0 0 6px 0;">Giá: <span style="color:#f4b400;font-weight:600;">${product.price}</span></p>
                    <button class="btn btn-primary hot-buy-btn" data-id="${product.id}">Mua</button>
                </div>
            </div>
        `;
        hotSaleDiv.innerHTML += hotCard;
    });
    // Gán sự kiện click cho nút Mua
    document.querySelectorAll('.hot-buy-btn').forEach(btn => {
        btn.onclick = function() {
            const id = btn.getAttribute('data-id');
            window.location.href = `detail.html?id=${id}`;
        };
    });
}

// Gọi hàm sau khi DOMContentLoaded
window.addEventListener('DOMContentLoaded', showHotSaleFromFirestore);
