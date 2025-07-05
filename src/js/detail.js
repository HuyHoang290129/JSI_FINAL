import { db } from "./firebase-config.js";
import { doc, getDoc, addDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// Lấy id sản phẩm từ query string
function getProductIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// --- UI đẹp và hiệu ứng mượt khi hiển thị chi tiết sản phẩm ---
function smoothShowDetail(html) {
  const container = document.getElementById('product-detail-container');
  if (!container) return;
  container.style.opacity = 0;
  container.innerHTML = html;
  setTimeout(() => {
    container.style.transition = 'opacity 0.5s';
    container.style.opacity = 1;
  }, 50);
}

async function renderProductDetail() {
  const productId = getProductIdFromQuery();
  const container = document.getElementById('product-detail-container');
  if (!productId || !container) {
    smoothShowDetail('<h2 style="color:red;text-align:center;">Không tìm thấy sản phẩm!</h2>');
    return;
  }
  const docRef = doc(db, "products", productId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const product = docSnap.data();
    const html = `
      <div class="detail-card shadow-lg animate__animated animate__fadeInUp" style="max-width:520px;margin:40px auto 32px auto;background:linear-gradient(135deg,#f8fafc 60%,#e0e7ef 100%);border-radius:18px;box-shadow:0 4px 24px #0002;padding:36px 28px;">
        <img src="${product.image}" alt="${product.name}" style="width:100%;max-width:240px;display:block;margin:0 auto 22px auto;border-radius:14px;box-shadow:0 2px 12px #0001;">
        <h2 style="text-align:center;font-size:2.1rem;font-weight:800;color:#222;letter-spacing:1px;">${product.name}</h2>
        <p style="text-align:center;font-size:1.18rem;color:#f4b400;font-weight:700;margin:8px 0 2px 0;">Giá: ${product.price}</p>
        <p style="text-align:center;font-size:1.08rem;color:#2563eb;margin-bottom:10px;">Loại: ${product.type}</p>
        <hr style="margin:18px 0;">
        <div style="margin-top:10px;font-size:1.08rem;line-height:1.7;color:#333;">
          <b>Giới thiệu sản phẩm:</b><br>
          <span>${product.description ? product.description : '<i>Không có mô tả sản phẩm</i>'}</span>
        </div>
        <div style="text-align:center;margin-top:32px;display:flex;gap:16px;justify-content:center;">
          <a href="product.html" class="btn btn-secondary" style="border-radius:8px;padding:8px 32px;font-weight:600;font-size:1.1rem;">Quay lại</a>
          <button id="buyNowBtn" class="btn btn-warning" style="border-radius:8px;padding:8px 32px;font-weight:600;font-size:1.1rem;background:#f4b400;color:#222;">Mua ngay</button>
        </div>
      </div>
      <div id="orderModal" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.4);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:#fff;border-radius:16px;max-width:400px;width:90vw;padding:28px 20px;box-shadow:0 4px 32px #0003;position:relative;margin:auto;top:10vh;">
          <button id="closeOrderModal" style="position:absolute;top:10px;right:16px;font-size:1.5rem;background:none;border:none;">&times;</button>
          <form id="orderForm">
            <h4 style="text-align:center;margin-bottom:18px;">Thông tin đặt hàng</h4>
            <div class="mb-3">
              <label for="buyerName" class="form-label">Tên</label>
              <input type="text" class="form-control" id="buyerName" required>
            </div>
            <div class="mb-3">
              <label for="buyerAge" class="form-label">Tuổi</label>
              <input type="number" class="form-control" id="buyerAge" required>
            </div>
            <div class="mb-3">
              <label for="buyerPhone" class="form-label">Số điện thoại</label>
              <input type="tel" class="form-control" id="buyerPhone" required>
            </div>
            <div class="mb-3">
              <label for="buyerAddress" class="form-label">Địa chỉ</label>
              <input type="text" class="form-control" id="buyerAddress" required>
            </div>
            <button type="submit" class="btn btn-success w-100">Xác nhận đặt hàng</button>
          </form>
        </div>
      </div>
      <!-- COMMENT SECTION START -->
      <div class="comment-section" style="max-width:520px;margin:0 auto 40px auto;background:#fffbe7;border-radius:14px;box-shadow:0 2px 12px #f4b40033;padding:24px 18px 18px 18px;">
        <h4 style="color:#f4b400;font-weight:700;margin-bottom:16px;">Bình luận sản phẩm</h4>
        <form id="commentForm" style="display:flex;gap:10px;margin-bottom:18px;">
          <input type="text" id="commentContent" class="form-control" placeholder="Nhập bình luận..." required>
          <button class="btn btn-warning" type="submit" style="color:#222;font-weight:600;">Gửi</button>
        </form>
        <div id="commentList"></div>
      </div>
      <!-- COMMENT SECTION END -->
    `;
    smoothShowDetail(html);
    // Thêm sự kiện cho nút Mua ngay và xử lý modal form
    setTimeout(() => {
      const buyBtn = document.getElementById('buyNowBtn');
      const orderModal = document.getElementById('orderModal');
      const closeOrderModal = document.getElementById('closeOrderModal');
      const orderForm = document.getElementById('orderForm');
      if (buyBtn && orderModal && orderForm) {
        buyBtn.onclick = function() {
          orderModal.style.display = 'flex';
        };
        closeOrderModal.onclick = function() {
          orderModal.style.display = 'none';
        };
        orderModal.onclick = function(e) {
          if (e.target === orderModal) orderModal.style.display = 'none';
        };
        orderForm.onsubmit = async function(e) {
          e.preventDefault();
          const name = document.getElementById('buyerName').value;
          const age = document.getElementById('buyerAge').value;
          const phone = document.getElementById('buyerPhone').value;
          const address = document.getElementById('buyerAddress').value;
          // Lưu đơn hàng vào localStorage
          let orders = JSON.parse(localStorage.getItem('orders')) || [];
          const orderData = {
            id: productId,
            name: product.name,
            price: product.price,
            type: product.type,
            image: product.image,
            description: product.description || '',
            buyerName: name,
            buyerAge: age,
            buyerPhone: phone,
            buyerAddress: address,
            createdAt: new Date().toISOString(),
            status: 'Chờ xác nhận từ admin'
          };
          orders.push(orderData);
          localStorage.setItem('orders', JSON.stringify(orders));
          // Lưu đơn hàng vào Firestore
          try {
            await addDoc(collection(db, 'orders'), orderData);
          } catch (err) {
            alert('Lỗi khi lưu đơn hàng lên Firestore!');
          }
          alert('Đặt hàng thành công!');
          window.location.href = 'order.html';
        };
      }
    }, 100);
    // XỬ LÝ COMMENT FIRESTORE
    setTimeout(() => {
      const commentForm = document.getElementById('commentForm');
      const commentList = document.getElementById('commentList');
      if (!commentForm || !commentList) return;
      // Hiển thị comment
      async function loadComments() {
        commentList.innerHTML = '<div style="color:#888;">Đang tải bình luận...</div>';
        // Lấy tất cả comment của sản phẩm này từ collection 'comments'
        const qSnap = await getDocs(collection(db, 'comments'));
        const comments = [];
        qSnap.forEach(docSnap => {
          const c = docSnap.data();
          if (c.productId === productId) comments.push({ ...c, id: docSnap.id });
        });
        if (comments.length === 0) {
          commentList.innerHTML = '<div style="color:#aaa;">Chưa có bình luận nào.</div>';
          return;
        }
        // Sắp xếp mới nhất lên đầu
        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        let html = '';
        comments.forEach(c => {
          html += `<div style=\"background:#fffde4;border-radius:8px;padding:10px 14px;margin-bottom:10px;box-shadow:0 1px 4px #f4b40022;position:relative;\">
            <b style=\"color:#f4b400;\">${c.name}</b> <span style=\"color:#888;font-size:0.95em;\">${new Date(c.createdAt).toLocaleString()}</span><br>
            <span style=\"color:#222;\">${c.content}</span>
            ${c.reply ? `<div style=\"margin-top:8px;padding:8px 12px;background:#fff3cd;border-left:4px solid #f4b400;border-radius:6px;\"><b style=\"color:#d48806;\">Admin phản hồi:</b> <span style=\"color:#b26b00;\">${c.reply}</span></div>` : ''}
            <button class=\"btn btn-sm btn-danger delete-comment-btn\" data-id=\"${c.id}\" style=\"position:absolute;top:8px;right:8px;padding:2px 8px;font-size:0.95em;\">Xóa</button>
          </div>`;
        });
        commentList.innerHTML = html;
        // Gán sự kiện xóa
        document.querySelectorAll('.delete-comment-btn').forEach(btn => {
          btn.onclick = async function() {
            if (confirm('Bạn có chắc muốn xóa bình luận này?')) {
              await deleteComment(btn.getAttribute('data-id'));
              loadComments();
            }
          };
        });
      }
      // Hàm xóa comment
      async function deleteComment(commentId) {
        await import('https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js').then(({ deleteDoc, doc }) => {
          return deleteDoc(doc(db, 'comments', commentId));
        });
      }
      loadComments();
      // Gửi comment
      commentForm.onsubmit = async function(e) {
        e.preventDefault();
        // Lấy email tài khoản đang đăng nhập từ Firebase Auth
        let email = '';
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (user && user.email) email = user.email;
        } catch {}
        if (!email) {
          alert('Bạn cần đăng nhập để bình luận!');
          return;
        }
        const content = document.getElementById('commentContent').value.trim();
        if (!content) return;
        await addDoc(collection(db, 'comments'), {
          name: email,
          content,
          productId,
          createdAt: new Date().toISOString()
        });
        commentForm.reset();
        loadComments();
      };
    }, 200);
    return;
  }
  // Nếu không có Firestore, thử lấy từ localStorage (MockAPI)
  const product = JSON.parse(localStorage.getItem('product'));
  if (product && (product.id == productId || product.id == +productId)) {
    const html = `
      <div class="detail-card shadow-lg animate__animated animate__fadeInUp" style="max-width:520px;margin:40px auto 32px auto;background:linear-gradient(135deg,#f8fafc 60%,#e0e7ef 100%);border-radius:18px;box-shadow:0 4px 24px #0002;padding:36px 28px;">
        <img src="/SPcuoikhoa/img/${product.image}" alt="${product.title}" style="width:100%;max-width:240px;display:block;margin:0 auto 22px auto;border-radius:14px;box-shadow:0 2px 12px #0001;">
        <h2 style="text-align:center;font-size:2.1rem;font-weight:800;color:#222;letter-spacing:1px;">${product.title}</h2>
        <p style="text-align:center;font-size:1.18rem;color:#f4b400;font-weight:700;margin:8px 0 2px 0;">Giá: ${product.Price}</p>
        <p style="text-align:center;font-size:1.08rem;color:#2563eb;margin-bottom:10px;">Loại: ${product.Type || product.type || ''}</p>
        <hr style="margin:18px 0;">
        <div style="margin-top:10px;font-size:1.08rem;line-height:1.7;color:#333;">
          <b>Giới thiệu sản phẩm:</b><br>
          <span>${product.description ? product.description : '<i>Không có mô tả sản phẩm</i>'}</span>
        </div>
        <div style="text-align:center;margin-top:32px;display:flex;gap:16px;justify-content:center;">
          <a href="product.html" class="btn btn-secondary" style="border-radius:8px;padding:8px 32px;font-weight:600;font-size:1.1rem;">Quay lại</a>
          <button id="buyNowBtn" class="btn btn-warning" style="border-radius:8px;padding:8px 32px;font-weight:600;font-size:1.1rem;background:#f4b400;color:#222;">Mua ngay</button>
        </div>
      </div>
      <div id="orderModal" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.4);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:#fff;border-radius:16px;max-width:400px;width:90vw;padding:28px 20px;box-shadow:0 4px 32px #0003;position:relative;margin:auto;top:10vh;">
          <button id="closeOrderModal" style="position:absolute;top:10px;right:16px;font-size:1.5rem;background:none;border:none;">&times;</button>
          <form id="orderForm">
            <h4 style="text-align:center;margin-bottom:18px;">Thông tin đặt hàng</h4>
            <div class="mb-3">
              <label for="buyerName" class="form-label">Tên</label>
              <input type="text" class="form-control" id="buyerName" required>
            </div>
            <div class="mb-3">
              <label for="buyerAge" class="form-label">Tuổi</label>
              <input type="number" class="form-control" id="buyerAge" required>
            </div>
            <div class="mb-3">
              <label for="buyerPhone" class="form-label">Số điện thoại</label>
              <input type="tel" class="form-control" id="buyerPhone" required>
            </div>
            <div class="mb-3">
              <label for="buyerAddress" class="form-label">Địa chỉ</label>
              <input type="text" class="form-control" id="buyerAddress" required>
            </div>
            <button type="submit" class="btn btn-success w-100">Xác nhận đặt hàng</button>
          </form>
        </div>
      </div>
      <!-- COMMENT SECTION START -->
      <div class="comment-section" style="max-width:520px;margin:0 auto 40px auto;background:#fffbe7;border-radius:14px;box-shadow:0 2px 12px #f4b40033;padding:24px 18px 18px 18px;">
        <h4 style="color:#f4b400;font-weight:700;margin-bottom:16px;">Bình luận sản phẩm</h4>
        <form id="commentForm" style="display:flex;gap:10px;margin-bottom:18px;">
          <input type="text" id="commentContent" class="form-control" placeholder="Nhập bình luận..." required>
          <button class="btn btn-warning" type="submit" style="color:#222;font-weight:600;">Gửi</button>
        </form>
        <div id="commentList"></div>
      </div>
      <!-- COMMENT SECTION END -->
    `;
    smoothShowDetail(html);
    // Thêm sự kiện cho nút Mua ngay và xử lý modal form
    setTimeout(() => {
      const buyBtn = document.getElementById('buyNowBtn');
      const orderModal = document.getElementById('orderModal');
      const closeOrderModal = document.getElementById('closeOrderModal');
      const orderForm = document.getElementById('orderForm');
      if (buyBtn && orderModal && orderForm) {
        buyBtn.onclick = function() {
          orderModal.style.display = 'flex';
        };
        closeOrderModal.onclick = function() {
          orderModal.style.display = 'none';
        };
        orderModal.onclick = function(e) {
          if (e.target === orderModal) orderModal.style.display = 'none';
        };
        orderForm.onsubmit = async function(e) {
          e.preventDefault();
          const name = document.getElementById('buyerName').value;
          const age = document.getElementById('buyerAge').value;
          const phone = document.getElementById('buyerPhone').value;
          const address = document.getElementById('buyerAddress').value;
          // Lưu đơn hàng vào localStorage
          let orders = JSON.parse(localStorage.getItem('orders')) || [];
          const orderData = {
            id: productId,
            name: product.name,
            price: product.price,
            type: product.type,
            image: product.image,
            description: product.description || '',
            buyerName: name,
            buyerAge: age,
            buyerPhone: phone,
            buyerAddress: address,
            createdAt: new Date().toISOString(),
            status: 'Chờ xác nhận từ admin'
          };
          orders.push(orderData);
          localStorage.setItem('orders', JSON.stringify(orders));
          // Lưu đơn hàng vào Firestore
          try {
            await addDoc(collection(db, 'orders'), orderData);
          } catch (err) {
            alert('Lỗi khi lưu đơn hàng lên Firestore!');
          }
          alert('Đặt hàng thành công!');
          window.location.href = 'order.html';
        };
      }
    }, 100);
    // XỬ LÝ COMMENT FIRESTORE
    setTimeout(() => {
      const commentForm = document.getElementById('commentForm');
      const commentList = document.getElementById('commentList');
      if (!commentForm || !commentList) return;
      // Hiển thị comment
      async function loadComments() {
        commentList.innerHTML = '<div style="color:#888;">Đang tải bình luận...</div>';
        // Lấy tất cả comment của sản phẩm này từ collection 'comments'
        const qSnap = await getDocs(collection(db, 'comments'));
        const comments = [];
        qSnap.forEach(docSnap => {
          const c = docSnap.data();
          if (c.productId === productId) comments.push({ ...c, id: docSnap.id });
        });
        if (comments.length === 0) {
          commentList.innerHTML = '<div style="color:#aaa;">Chưa có bình luận nào.</div>';
          return;
        }
        // Sắp xếp mới nhất lên đầu
        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        let html = '';
        comments.forEach(c => {
          html += `<div style=\"background:#fffde4;border-radius:8px;padding:10px 14px;margin-bottom:10px;box-shadow:0 1px 4px #f4b40022;position:relative;\">
            <b style=\"color:#f4b400;\">${c.name}</b> <span style=\"color:#888;font-size:0.95em;\">${new Date(c.createdAt).toLocaleString()}</span><br>
            <span style=\"color:#222;\">${c.content}</span>
            ${c.reply ? `<div style=\"margin-top:8px;padding:8px 12px;background:#fff3cd;border-left:4px solid #f4b400;border-radius:6px;\"><b style=\"color:#d48806;\">Admin phản hồi:</b> <span style=\"color:#b26b00;\">${c.reply}</span></div>` : ''}
            <button class=\"btn btn-sm btn-danger delete-comment-btn\" data-id=\"${c.id}\" style=\"position:absolute;top:8px;right:8px;padding:2px 8px;font-size:0.95em;\">Xóa</button>
          </div>`;
        });
        commentList.innerHTML = html;
        // Gán sự kiện xóa
        document.querySelectorAll('.delete-comment-btn').forEach(btn => {
          btn.onclick = async function() {
            if (confirm('Bạn có chắc muốn xóa bình luận này?')) {
              await deleteComment(btn.getAttribute('data-id'));
              loadComments();
            }
          };
        });
      }
      // Hàm xóa comment
      async function deleteComment(commentId) {
        await import('https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js').then(({ deleteDoc, doc }) => {
          return deleteDoc(doc(db, 'comments', commentId));
        });
      }
      loadComments();
      // Gửi comment
      commentForm.onsubmit = async function(e) {
        e.preventDefault();
        // Lấy email tài khoản đang đăng nhập từ Firebase Auth
        let email = '';
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (user && user.email) email = user.email;
        } catch {}
        if (!email) {
          alert('Bạn cần đăng nhập để bình luận!');
          return;
        }
        const content = document.getElementById('commentContent').value.trim();
        if (!content) return;
        await addDoc(collection(db, 'comments'), {
          name: email,
          content,
          productId,
          createdAt: new Date().toISOString()
        });
        commentForm.reset();
        loadComments();
      };
    }, 200);
    return;
  }
  smoothShowDetail('<h2 style="color:red;text-align:center;">Không tìm thấy sản phẩm!</h2>');
}

// Gọi khi DOM ready
window.addEventListener('DOMContentLoaded', renderProductDetail);