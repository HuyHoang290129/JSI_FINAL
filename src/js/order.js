// Hiển thị sản phẩm đã mua từ localStorage (orders)
document.addEventListener('DOMContentLoaded', function() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const container = document.createElement('div');
  container.className = 'container my-5';
  if (orders.length === 0) {
    container.innerHTML = '<h3 style="text-align:center;color:#e74c3c;">Chưa có sản phẩm nào trong đơn hàng!</h3>';
  } else {
    container.innerHTML = '<h3 class="mb-4" style="text-align:center;">Sản phẩm đã mua</h3>';
    const row = document.createElement('div');
    row.className = 'row';
    orders.forEach((product, idx) => {
      const col = document.createElement('div');
      col.className = 'col-4';
      let status = product.status || 'Chờ xác nhận từ admin';
      let badgeClass = status === 'Đã xác nhận' ? 'bg-success' : 'bg-warning text-dark';
      col.innerHTML = `
        <div class="px-2 product-card" style="border:1px solid #eee;border-radius:10px;padding:16px;margin-bottom:18px;background:#fff;box-shadow:0 2px 8px #0001;">
          <img src="${product.image}" alt="${product.name}" style="width:100%;max-width:180px;object-fit:cover;border-radius:8px;">
          <h5 style="margin:12px 0 6px 0;font-size:1.1rem;">${product.name}</h5>
          <p style="margin:0 0 6px 0;">Giá: <span style="color:#f4b400;font-weight:600;">${product.price}</span></p>
          <p style="margin:0 0 12px 0;">Loại: ${product.type}</p>
          <div class="product-desc mt-2" style="background:#f8f9fa;border-radius:8px;padding:10px 12px;margin-top:10px;font-size:0.98rem;color:#333;">${product.description || ''}</div>
          <div class="mt-3 text-center">
            <span class="badge ${badgeClass}">${status}</span>
          </div>
          <div class="mt-3 text-center">
            <button class="btn btn-info btn-sm view-invoice-btn" data-idx="${idx}">Xem thêm</button>
          </div>
        </div>
      `;
      row.appendChild(col);
    });
    container.appendChild(row);
  }
  document.body.appendChild(container);

  // Thêm modal hóa đơn vào cuối body nếu chưa có
  if (!document.getElementById('invoiceModal')) {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="modal fade" id="invoiceModal" tabindex="-1" aria-labelledby="invoiceModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="invoiceModalLabel">Chi tiết hóa đơn</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="invoiceModalBody"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Gắn sự kiện cho nút Xem thêm
  document.querySelectorAll('.view-invoice-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = btn.getAttribute('data-idx');
      const order = orders[idx];
      let html = `<ul class="list-group">
        <li class="list-group-item"><b>Tên người mua:</b> ${order.buyerName || ''}</li>
        <li class="list-group-item"><b>Tuổi:</b> ${order.buyerAge || ''}</li>
        <li class="list-group-item"><b>Số điện thoại:</b> ${order.buyerPhone || ''}</li>
        <li class="list-group-item"><b>Địa chỉ:</b> ${order.buyerAddress || ''}</li>
        <li class="list-group-item"><b>Tên sản phẩm:</b> ${order.name}</li>
        <li class="list-group-item"><b>Giá:</b> <span style='color:#f4b400;font-weight:600;'>${order.price}</span></li>
        <li class="list-group-item"><b>Loại:</b> ${order.type}</li>
        <li class="list-group-item"><b>Mô tả:</b> ${order.description || ''}</li>
        <li class="list-group-item"><b>Trạng thái:</b> ${order.status || 'Chờ xác nhận từ admin'}</li>
      </ul>`;
      document.getElementById('invoiceModalBody').innerHTML = html;
      const modal = new bootstrap.Modal(document.getElementById('invoiceModal'));
      modal.show();
    });
  });
});
