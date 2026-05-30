const db = require('../config/db');

// LẤY CẤU HÌNH
exports.getConfig = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM config LIMIT 1');
    if (rows.length === 0) {
      // Tạo row mặc định nếu chưa có
      await db.query(
        `INSERT INTO config (ten_quan, tax_rate, payment_methods, invoice_template)
         VALUES (?, ?, ?, ?)`,
        ['RESTO DELUXE', 10, 'tien_mat,chuyen_khoan', JSON.stringify({
          footer: 'Cảm ơn quý khách và hẹn gặp lại!',
          contact: '123 Đường Ẩm Thực, Quận 1, TP. HCM',
        })]
      );
      const [newRows] = await db.query('SELECT * FROM config LIMIT 1');
      return res.json(newRows[0]);
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// CẬP NHẬT CẤU HÌNH
exports.updateConfig = async (req, res) => {
  const { ten_quan, tax_rate, payment_methods, footer_text, contact_info } = req.body;
  try {
    const invoice_template = JSON.stringify({ footer: footer_text, contact: contact_info });

    await db.query(
      `UPDATE config SET
        ten_quan = ?,
        tax_rate = ?,
        payment_methods = ?,
        invoice_template = ?
       WHERE id = 1`,
      [ten_quan, tax_rate, payment_methods, invoice_template]
    );
    res.json({ message: 'Lưu cấu hình thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
