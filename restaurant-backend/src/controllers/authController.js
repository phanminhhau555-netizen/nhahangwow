const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ĐĂNG KÝ
exports.register = async (req, res) => {
  const { username, password, full_name, role_id } = req.body;
  if (Number(role_id) === 1) {
    return res.status(403).json({ message: 'Không thể tạo tài khoản admin!' });
  }
  try {
    // Kiểm tra username đã tồn tại chưa
    const [existing] = await db.query(
      'SELECT id FROM accounts WHERE username = ?', [username]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username đã tồn tại!' });
    }

    // Mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu vào database
    await db.query(
      'INSERT INTO accounts (username, password, full_name, role_id) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, full_name, role_id]
    );

    res.status(201).json({ message: 'Tạo tài khoản thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ĐĂNG NHẬP
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Tìm tài khoản
    const [rows] = await db.query(
      'SELECT * FROM accounts WHERE username = ? AND is_active = 1', [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
    }

    const account = rows[0];

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Sai mật khẩu!' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: account.id, role_id: account.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: account.id,
        username: account.username,
        full_name: account.full_name,
        role_id: account.role_id
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
exports.getRoles = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM roles');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
exports.getAccounts = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, full_name, role_id, is_active FROM accounts'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await db.query('UPDATE orders SET account_id = NULL WHERE account_id = ?', [req.params.id]);
    await db.query('UPDATE inventory_logs SET account_id = NULL WHERE account_id = ?', [req.params.id]);

    const [result] = await db.query('DELETE FROM accounts WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });
    }
    res.json({ message: 'Xóa tài khoản thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};