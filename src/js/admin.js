import { auth, db } from "./firebase-config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Check admin authentication
onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      getDoc(doc(db, "users", uid)).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const roleId = userData.role_id;
            if (roleId === 1){
              document.getElementById("adminName").textContent =
                "Xin chào, " + (userData.usernameForm || userData.email);
            } else {
              alert("Bạn không có quyền truy cập trang này.");
              signOut(auth).then(() => {
                window.location.href = "index.html";
              });
            }
         } else {
            alert("Không tìm thấy dữ liệu người dùng.");
            window.location.href = "login.html";
          }
        })
        .catch((error) => {
          console.error("Lỗi truy vấn Firestore:", error);
          window.location.href = "login.html";
        });
    } else {
      window.location.href = "login.html";
    }
  });


// Logout
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};

// Product CRUD
async function showProducts() {
  const productList = document.getElementById("productList");
  if (!productList) return;
  productList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "products"));
  // Gom nhóm sản phẩm theo type
  const grouped = {};
  querySnapshot.forEach((docSnap) => {
    const product = docSnap.data();
    const type = product.type || 'Khác';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push({ ...product, id: docSnap.id });
  });
  // Hiển thị từng nhóm theo type
  Object.keys(grouped).forEach(type => {
    const typeRow = document.createElement("tr");
    typeRow.innerHTML = `<td colspan='5' style='background:#e3f2fd;font-weight:700;color:#2563eb;text-align:left;font-size:1.1rem;'>${type}</td>`;
    productList.appendChild(typeRow);
    grouped[type].forEach(product => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.type}</td>
        <td><img src="${product.image}" alt="${product.name}" style="width:60px;"></td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')">Xóa</button>
          <button class="btn btn-secondary btn-sm" onclick="editProductPrompt('${product.id}', '${product.name}', '${product.price}', '${product.type}', '${product.image}', '${product.description || ''}')">Sửa</button>
        </td>
      `;
      productList.appendChild(row);
    });
  });
}

window.deleteProduct = async function(id) {
  if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
    await deleteDoc(doc(db, "products", id));
    showProducts();
  }
};

window.editProductPrompt = function(id, oldName, oldPrice, oldType, oldImage, oldDescription = "") {
  // Tạo form sửa sản phẩm động
  const editFormHtml = `
    <div id="editProductModal" class="modal" style="display:block;position:fixed;z-index:9999;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);">
      <div style="background:#fff;padding:32px 24px;border-radius:12px;max-width:400px;margin:60px auto;position:relative;">
        <h4 style="margin-bottom:18px;">Sửa sản phẩm</h4>
        <form id="editProductForm">
          <div class="mb-3">
            <label class="form-label">Tên sản phẩm</label>
            <input type="text" class="form-control" id="editName" value="${oldName}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Giá</label>
            <input type="number" class="form-control" id="editPrice" value="${oldPrice}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Loại</label>
            <input type="text" class="form-control" id="editType" value="${oldType}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Giới thiệu sản phẩm</label>
            <textarea class="form-control" id="editDescription" rows="2">${oldDescription}</textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Ảnh (URL hoặc chọn mới)</label>
            <input type="text" class="form-control" id="editImageUrl" value="${oldImage}">
            <input type="file" class="form-control mt-2" id="editImageFile">
            <img src="${oldImage}" alt="Ảnh sản phẩm" style="width:60px;margin-top:8px;">
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" id="cancelEditBtn">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  `;
  // Thêm modal vào body
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = editFormHtml;
  document.body.appendChild(modalDiv);

  // Đóng modal
  modalDiv.querySelector('#cancelEditBtn').onclick = function() {
    document.body.removeChild(modalDiv);
  };

  // Xử lý submit form sửa
  modalDiv.querySelector('#editProductForm').onsubmit = async function(e) {
    e.preventDefault();
    const newName = modalDiv.querySelector('#editName').value;
    const newPrice = modalDiv.querySelector('#editPrice').value;
    const newType = modalDiv.querySelector('#editType').value;
    const newDescription = modalDiv.querySelector('#editDescription').value;
    let newImage = modalDiv.querySelector('#editImageUrl').value;
    const fileInput = modalDiv.querySelector('#editImageFile');
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = async function(ev) {
        newImage = ev.target.result;
        await updateDoc(doc(db, "products", id), {
          name: newName,
          price: newPrice,
          type: newType,
          image: newImage,
          description: newDescription
        });
        document.body.removeChild(modalDiv);
        showProducts();
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      await updateDoc(doc(db, "products", id), {
        name: newName,
        price: newPrice,
        type: newType,
        image: newImage,
        description: newDescription
      });
      document.body.removeChild(modalDiv);
      showProducts();
    }
  };
};

// Thêm sản phẩm (Add Product) - CSS và mô tả
// Nếu tồn tại form cũ thì không render lại form mới (tránh ghi đè form gốc của bạn)
function renderAddProductForm() {
  const addBtn = document.querySelector('.addButton');
  if (addBtn) {
    addBtn.onclick = async function(e) {
      e.preventDefault();
      const productName = document.getElementById('productName')?.value;
      const productPrice = document.getElementById('productPrice')?.value;
      const productType = document.getElementById('productType')?.value;
      const productDescription = document.getElementById('productDescription')?.value || '';
      const productImage = document.getElementById('productImage')?.files[0];
      if (!productName || !productPrice || !productType || !productImage) {
        alert("Vui lòng điền đầy đủ thông tin sản phẩm!");
        return;
      }
      const reader = new FileReader();
      reader.onload = async function(e) {
        await addDoc(collection(db, "products"), {
          name: productName,
          price: productPrice,
          type: productType,
          image: e.target.result,
          description: productDescription
        });
        showProducts();
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productType').value = '';
        document.getElementById('productImage').value = '';
        if(document.getElementById('productDescription')) document.getElementById('productDescription').value = '';
      };
      reader.readAsDataURL(productImage);
    };
  }
}

function resetForm() {
  document.getElementById('productName').value = "";
  document.getElementById('productPrice').value = "";
  document.getElementById('productType').value = "";
  document.getElementById('productImage').value = "";
  if(document.getElementById('productDescription')) document.getElementById('productDescription').value = "";
}
function showOrder() {
    const container = document.getElementById('orderList');
    container.innerHTML = '';
  
    db.collection('orders').orderBy('createdAt', 'desc').get()
      .then(snapshot => {
        if (snapshot.empty) {
          container.innerHTML = '<p>Chưa có hóa đơn nào.</p>';
          return;
        }
        let index = 1

        snapshot.forEach(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate().toLocaleString() || 'Không rõ';
          const total = data.total?.toLocaleString() || 0;
          const items = data.items || [];
            let itemsHtml = '';
          items.forEach(item => {
            itemsHtml += `<li>${item.name} - SL: ${item.quantity} x ${item.price.toLocaleString()}đ</li>`;
          });
  
          const invoiceHTML = `
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">Hóa đơn - ${index++}</h5>
                <p><strong>Ngày:</strong> ${createdAt}</p>
                <ul>${itemsHtml}</ul>
                <p><strong>Tổng tiền:</strong> ${total}đ</p>
              </div>
            </div>
          `;
          container.innerHTML += invoiceHTML;
        });
      })
      .catch(error => {
        console.error('Lỗi khi tải hóa đơn:', error);
        container.innerHTML = '<p class="text-danger">Không thể tải hóa đơn.</p>';
      });
}


function showSection(sectionId) {
    const productsDiv = document.getElementById('products');
    const ordersDiv = document.getElementById('orders');
    const customersDiv = document.getElementById('customers');
    if (productsDiv) productsDiv.style.display = 'none';
    if (ordersDiv) ordersDiv.style.display = 'none';
    if (customersDiv) customersDiv.style.display = 'none';

    const sectionDiv = document.getElementById(sectionId);
    if (sectionDiv) {
        sectionDiv.style.display = 'block';
    } else {
        // Nếu không có section này thì không làm gì cả
        return;
    }

    if (sectionId === 'orders') {
        showOrder();
    }
    else if (sectionId === 'products') {
        renderAddProductForm();
        showProducts();
    }
    else{
        showCustomer();
    }
}

// Hiển thị giao diện sản phẩm
const productSection = document.querySelector(".productSection");
if (productSection) {
  productSection.addEventListener("click", () => {
    showSection("products");
  });
}

// Hiển thị giao diện hóa đơn
const orderSection = document.querySelector(".orderSection");
if (orderSection) {
  orderSection.addEventListener("click", () => {
    showSection("orders");
  });
}

const customerSection = document.querySelector(".customerSection");
if (customerSection) {
  customerSection.addEventListener("click", () => {
    showSection("customers");
  });
}

// Hiển thị giao diện admin
window.addEventListener("DOMContentLoaded", function () {
    showSection("products");
});

// ========== ORDER MANAGEMENT ========== //
function loadOrders() {
  const invoiceList = document.getElementById('invoiceList');
  if (!invoiceList) return;
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  if (orders.length === 0) {
    invoiceList.innerHTML = '<div class="alert alert-info">Chưa có đơn hàng nào.</div>';
    return;
  }
  let html = '<div class="mb-2 text-end"><button class="btn btn-danger btn-sm" id="deleteAllOrdersBtn">Xóa toàn bộ hóa đơn</button></div>';
  html += '<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>Tên sản phẩm</th><th>Giá</th><th>Loại</th><th>Ảnh</th><th>Mô tả</th><th>Trạng thái</th><th>Hành động</th></tr></thead><tbody>';
  orders.forEach((order, idx) => {
    html += `<tr>
      <td>${order.name}</td>
      <td>${order.price}</td>
      <td>${order.type}</td>
      <td><img src="${order.image}" alt="${order.name}" style="width:60px;"></td>
      <td>${order.description || ''}</td>
      <td><span class="badge ${order.status === 'Đã xác nhận' ? 'bg-success' : 'bg-warning text-dark'}">${order.status || 'Chờ xác nhận từ admin'}</span></td>
      <td>
        ${order.status === 'Đã xác nhận' ? '' : `<button class="btn btn-success btn-sm" onclick="confirmOrder(${idx})">Xác nhận</button>`}
        <button class="btn btn-danger btn-sm ms-1" onclick="deleteOrder(${idx})">Xóa</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  invoiceList.innerHTML = html;

  // Gắn sự kiện xóa toàn bộ hóa đơn
  const deleteBtn = document.getElementById('deleteAllOrdersBtn');
  if (deleteBtn) {
    deleteBtn.onclick = function() {
      if (confirm('Bạn có chắc chắn muốn xóa toàn bộ hóa đơn?')) {
        localStorage.removeItem('orders');
        loadOrders();
      }
    };
  }
}

// Xác nhận đơn hàng
window.confirmOrder = async function(idx) {
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  if (!orders[idx]) return;
  // Nếu chưa có firestoreId, tìm trên Firestore và lưu lại
  if (!orders[idx].firestoreId) {
    // Tìm đơn hàng trên Firestore trùng thông tin
    const qSnap = await getDocs(collection(db, 'orders'));
    let foundId = null;
    qSnap.forEach(docSnap => {
      const d = docSnap.data();
      if (
        d.name === orders[idx].name &&
        d.price === orders[idx].price &&
        d.type === orders[idx].type &&
        d.image === orders[idx].image &&
        (d.description || '') === (orders[idx].description || '') &&
        (d.status === orders[idx].status || d.status === 'Chờ xác nhận từ admin')
      ) {
        foundId = docSnap.id;
      }
    });
    if (foundId) {
      orders[idx].firestoreId = foundId;
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }
  orders[idx].status = 'Đã xác nhận';
  localStorage.setItem('orders', JSON.stringify(orders));
  // Nếu có id Firestore, cập nhật luôn trên Firestore
  try {
    if (orders[idx].firestoreId) {
      await updateDoc(doc(db, 'orders', orders[idx].firestoreId), { status: 'Đã xác nhận' });
    }
  } catch (e) {
    // Nếu chưa có firestoreId, có thể cần đồng bộ lại
    console.error('Lỗi cập nhật trạng thái đơn hàng trên Firestore:', e);
  }
  loadOrders();
}

// Xóa đơn hàng
window.deleteOrder = async function(idx) {
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  if (!orders[idx]) return;
  if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
    // Xóa trên Firestore nếu có firestoreId
    try {
      if (orders[idx].firestoreId) {
        await deleteDoc(doc(db, 'orders', orders[idx].firestoreId));
      } else {
        // Nếu chưa có firestoreId, thử tìm trên Firestore
        const qSnap = await getDocs(collection(db, 'orders'));
        qSnap.forEach(docSnap => {
          const d = docSnap.data();
          if (
            d.name === orders[idx].name &&
            d.price === orders[idx].price &&
            d.type === orders[idx].type &&
            d.image === orders[idx].image &&
            (d.description || '') === (orders[idx].description || '')
          ) {
            deleteDoc(doc(db, 'orders', docSnap.id));
          }
        });
      }
    } catch (e) {
      console.error('Lỗi xóa đơn hàng trên Firestore:', e);
    }
    // Xóa local
    orders.splice(idx, 1);
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrders();
  }
}

// Call loadOrders and showCommentsAdmin on page load
window.addEventListener('DOMContentLoaded', function() {
  loadOrders();
  showCommentsAdmin();
});
async function showCommentsAdmin() {
  const commentAdminList = document.getElementById('commentAdminList');
  if (!commentAdminList) return;
  commentAdminList.innerHTML = '<div>Đang tải bình luận...</div>';
  const qSnap = await getDocs(collection(db, 'comments'));
  if (qSnap.empty) {
    commentAdminList.innerHTML = '<div class="alert alert-info">Chưa có bình luận nào.</div>';
    return;
  }
  let html = '<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>Email</th><th>Sản phẩm</th><th>Nội dung</th><th>Thời gian</th><th>Phản hồi</th><th>Hành động</th></tr></thead><tbody>';
  qSnap.forEach(docSnap => {
    const c = docSnap.data();
    html += `<tr>
      <td>${c.name}</td>
      <td>${c.productId || ''}</td>
      <td>${c.content}</td>
      <td>${c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</td>
      <td>
        <div>${c.reply ? `<b>Admin:</b> ${c.reply}` : '<i>Chưa phản hồi</i>'}</div>
        <input type="text" class="form-control form-control-sm mt-1" placeholder="Nhập phản hồi..." value="${c.reply || ''}" id="reply-${docSnap.id}">
      </td>
      <td><button class="btn btn-primary btn-sm" onclick="replyCommentAdmin('${docSnap.id}')">Gửi phản hồi</button></td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  commentAdminList.innerHTML = html;
}

async function replyCommentAdmin(commentId) {
  const input = document.getElementById('reply-' + commentId);
  if (!input) return;
  const reply = input.value.trim();
  await updateDoc(doc(db, 'comments', commentId), { reply });
  showCommentsAdmin();
}
window.replyCommentAdmin = replyCommentAdmin;


