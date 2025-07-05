import { db } from "./firebase-config.js";
import { collection, getDocs, doc, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const productListDiv = document.querySelector(".row");
  if (!productListDiv) return;
  productListDiv.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "products"));
  const productsMap = {};
  querySnapshot.forEach((docSnap) => {
    const product = docSnap.data();
    const productId = docSnap.id;
    productsMap[productId] = product;
    const productCard = `
      <div class="col-4">
        <div class="px-2 product-card" style="border:1px solid #eee;border-radius:10px;padding:16px;margin-bottom:18px;background:#fff;box-shadow:0 2px 8px #0001;">
          <img src="${product.image}" alt="${product.name}" style="width:100%;max-width:180px;object-fit:cover;border-radius:8px;">
          <h5 style="margin:12px 0 6px 0;font-size:1.1rem;">${product.name}</h5>
          <p style="margin:0 0 6px 0;">Giá: <span style="color:#f4b400;font-weight:600;">${product.price}</span></p>
          <p style="margin:0 0 12px 0;">Loại: ${product.type}</p>
          <button class="btn btn-primary buy-btn" data-id="${productId}" style="width:20%;font-weight:500;">Buy</button>
          <div class="product-desc mt-2" id="desc-${productId}" style="display:none;background:#f8f9fa;border-radius:8px;padding:10px 12px;margin-top:10px;font-size:0.98rem;color:#333;"></div>
        </div>
      </div>
    `;
    productListDiv.innerHTML += productCard;
  });

  // Add event listeners for buy buttons
  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.preventDefault();
      const id = btn.getAttribute('data-id');
      // Chuyển hướng sang trang detail.html với id sản phẩm
      window.location.href = `detail.html?id=${id}`;
    };
  });

  // Xử lý submit form mua hàng (chỉ khi tồn tại buyForm)
  const buyForm = document.getElementById('buyForm');
  if (buyForm) {
    buyForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const id = document.getElementById('buyProductId').value;
      const name = document.getElementById('buyerName').value;
      const age = document.getElementById('buyerAge').value;
      const phone = document.getElementById('buyerPhone').value;
      const address = document.getElementById('buyerAddress').value;
      const product = productsMap[id];
      if (!product) return;
      // Tạo đơn hàng
      const order = {
        ...product,
        buyerName: name,
        buyerAge: age,
        buyerPhone: phone,
        buyerAddress: address,
        status: 'Chờ xác nhận từ admin',
        createdAt: new Date().toISOString()
      };
      // Lưu vào Firestore collection 'orders'
      try {
        await addDoc(collection(db, 'orders'), order);
      } catch (err) {
        alert('Lỗi khi lưu đơn hàng lên Firestore!');
        return;
      }
      // Lưu localStorage để tương thích giao diện cũ (có thể bỏ nếu chỉ dùng Firestore)
      let orders = JSON.parse(localStorage.getItem('orders')) || [];
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      // Đóng modal và chuyển sang trang order
      const buyModal = bootstrap.Modal.getInstance(document.getElementById('buyModal'));
      buyModal.hide();
      window.location.href = 'order.html';
    });
  }
});

// Hàm render sản phẩm theo type (lọc)
window.renderProductsByType = async function(type) {
  const productListDiv = document.querySelector(".row");
  if (!productListDiv) return;
  productListDiv.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "products"));
  let found = false;
  querySnapshot.forEach((docSnap) => {
    const product = docSnap.data();
    const productId = docSnap.id;
    if (!type || product.type === type) {
      found = true;
      const productCard = `
        <div class="col-4">
          <div class="px-2 product-card" style="border:1px solid #eee;border-radius:10px;padding:16px;margin-bottom:18px;background:#fff;box-shadow:0 2px 8px #0001;">
            <img src="${product.image}" alt="${product.name}" style="width:100%;max-width:180px;object-fit:cover;border-radius:8px;">
            <h5 style="margin:12px 0 6px 0;font-size:1.1rem;">${product.name}</h5>
            <p style="margin:0 0 6px 0;">Giá: <span style="color:#f4b400;font-weight:600;">${product.price}</span></p>
            <p style="margin:0 0 12px 0;">Loại: ${product.type}</p>
            <button class="btn btn-primary buy-btn" data-id="${productId}" style="width:20%;font-weight:500;">Buy</button>
            <div class="product-desc mt-2" id="desc-${productId}" style="display:none;background:#f8f9fa;border-radius:8px;padding:10px 12px;margin-top:10px;font-size:0.98rem;color:#333;"></div>
          </div>
        </div>
      `;
      productListDiv.innerHTML += productCard;
    }
  });
  if (!found) {
    productListDiv.innerHTML = '<div style="width:100%;text-align:center;color:#e74c3c;font-size:1.2rem;margin-top:32px;">Không có sản phẩm thuộc loại này.</div>';
  }
  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = btn.getAttribute('data-id');
      // Hiển thị modal nhập thông tin mua hàng
      const buyModal = new bootstrap.Modal(document.getElementById('buyModal'));
      document.getElementById('buyProductId').value = id;
      buyModal.show();
    });
  });
};
