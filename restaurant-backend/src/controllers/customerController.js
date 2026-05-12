const db = require('../config/db');

// LẤY TẤT CẢ KHÁCH HÀNG
exports.getAllCustomers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// TÌM KIẾM KHÁCH HÀNG THEO SĐT
exports.searchCustomer = async (req, res) => {
  const { phone } = req.query;
  try {
    const [rows] = await db.query(
      'SELECT * FROM customers WHERE phone LIKE ?',
      [`%${phone}%`]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng!' });
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// LẤY 1 KHÁCH HÀNG + LỊCH SỬ GIAO DỊCH
exports.getCustomerById = async (req, res) => {
  try {
    const [customer] = await db.query(
      'SELECT * FROM customers WHERE id=?', [req.params.id]
    );
    if (customer.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng!' });
    }

    // Lịch sử giao dịch
    const [orders] = await db.query(`
      SELECT 
        o.id, o.total_amount, o.payment_method,
        o.paid_at, t.name as table_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE o.customer_id = ? AND o.status = "da_thanh_toan"
      ORDER BY o.paid_at DESC
    `, [req.params.id]);

    res.json({
      ...customer[0],
      lich_su_giao_dich: orders,
      tong_giao_dich: orders.length,
      tong_chi_tieu: orders.reduce((sum, o) => sum + o.total_amount, 0)
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// THÊM KHÁCH HÀNG MỚI
exports.createCustomer = async (req, res) => {
  const { full_name, phone, email } = req.body;
  try {
    // Kiểm tra SĐT đã tồn tại chưa
    const [existing] = await db.query(
      'SELECT id FROM customers WHERE phone=?', [phone]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại!' });
    }

    const [result] = await db.query(
      `INSERT INTO customers (full_name, phone, email) VALUES (?, ?, ?)`,
      [full_name, phone, email || null]
    );
    res.status(201).json({ 
      message: 'Thêm khách hàng thành công!',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// SỬA KHÁCH HÀNG
exports.updateCustomer = async (req, res) => {
  const { full_name, phone, email } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE customers SET full_name=?, phone=?, email=? WHERE id=?`,
      [full_name, phone, email || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng!' });
    }
    res.json({ message: 'Cập nhật khách hàng thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// XÓA KHÁCH HÀNG
exports.deleteCustomer = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM customers WHERE id=?', [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng!' });
    }
    res.json({ message: 'Xóa khách hàng thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// CỘNG ĐIỂM THỦ CÔNG
exports.addPoints = async (req, res) => {
  const { points, note } = req.body;
  try {
    await db.query(
      'UPDATE customers SET points = points + ? WHERE id=?',
      [points, req.params.id]
    );

    // Cập nhật hạng thành viên
    await updateMembership(req.params.id);

    res.json({ message: `Đã cộng ${points} điểm thành công!` });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ĐỔI ĐIỂM LẤY ƯU ĐÃI
exports.redeemPoints = async (req, res) => {
  const { points } = req.body;
  try {
    const [customer] = await db.query(
      'SELECT * FROM customers WHERE id=?', [req.params.id]
    );
    if (customer.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng!' });
    }
    if (customer[0].points < points) {
      return res.status(400).json({ message: 'Điểm không đủ để đổi!' });
    }

    // Trừ điểm
    await db.query(
      'UPDATE customers SET points = points - ? WHERE id=?',
      [points, req.params.id]
    );

    // Tính tiền giảm (100 điểm = 10,000đ)
    const discount = (points / 100) * 10000;

    res.json({ 
      message: 'Đổi điểm thành công!',
      diem_da_dung: points,
      tien_giam: discount
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// HÀM CẬP NHẬT HẠNG THÀNH VIÊN (dùng nội bộ)
async function updateMembership(customer_id) {
  const [customer] = await db.query(
    'SELECT points FROM customers WHERE id=?', [customer_id]
  );
  const points = customer[0].points;
  let membership = 'thuong';

  if (points >= 5000) membership = 'vang';
  else if (points >= 2000) membership = 'bac';

  await db.query(
    'UPDATE customers SET membership=? WHERE id=?',
    [membership, customer_id]
  );
}