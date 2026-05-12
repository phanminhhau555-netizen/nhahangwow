const db = require('../config/db');

// LẤY TẤT CẢ MÓN ĂN
exports.getAllItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, c.name as category_name 
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// LẤY 1 MÓN ĂN
exports.getItemById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM menu_items WHERE id = ?', [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn!' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// THÊM MÓN ĂN
exports.createItem = async (req, res) => {
  const { name, description, price, category_id, image_url } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, category_id, image_url]
    );
    res.status(201).json({ 
      message: 'Thêm món ăn thành công!', 
      id: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// SỬA MÓN ĂN
exports.updateItem = async (req, res) => {
  const { name, description, price, category_id, image_url, is_visible } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE menu_items 
       SET name=?, description=?, price=?, category_id=?, image_url=?, is_visible=?
       WHERE id=?`,
      [name, description, price, category_id, image_url, is_visible, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn!' });
    }
    res.json({ message: 'Cập nhật món ăn thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// XÓA MÓN ĂN
exports.deleteItem = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM menu_items WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn!' });
    }
    res.json({ message: 'Xóa món ăn thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ẨN / HIỆN MÓN ĂN
exports.toggleVisibility = async (req, res) => {
  try {
    await db.query(
      'UPDATE menu_items SET is_visible = !is_visible WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Cập nhật trạng thái món ăn thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};