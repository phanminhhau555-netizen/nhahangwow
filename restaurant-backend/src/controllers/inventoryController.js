const db = require('../config/db');

// LẤY TẤT CẢ NGUYÊN LIỆU
exports.getAllIngredients = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM ingredients ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// LẤY NGUYÊN LIỆU SẮP HẾT
exports.getLowStock = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM ingredients WHERE quantity <= min_quantity'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// THÊM NGUYÊN LIỆU MỚI
exports.createIngredient = async (req, res) => {
  const { name, unit, quantity, min_quantity } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO ingredients (name, unit, quantity, min_quantity) 
       VALUES (?, ?, ?, ?)`,
      [name, unit, quantity || 0, min_quantity || 0]
    );
    res.status(201).json({ 
      message: 'Thêm nguyên liệu thành công!', 
      id: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// SỬA NGUYÊN LIỆU
exports.updateIngredient = async (req, res) => {
  const { name, unit, min_quantity } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE ingredients SET name=?, unit=?, min_quantity=? WHERE id=?`,
      [name, unit, min_quantity, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nguyên liệu!' });
    }
    res.json({ message: 'Cập nhật nguyên liệu thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// XÓA NGUYÊN LIỆU
exports.deleteIngredient = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM ingredients WHERE id=?', [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nguyên liệu!' });
    }
    res.json({ message: 'Xóa nguyên liệu thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// NHẬP KHO
exports.importStock = async (req, res) => {
  const { ingredient_id, quantity, note } = req.body;
  try {
    // Cập nhật số lượng tồn kho
    await db.query(
      'UPDATE ingredients SET quantity = quantity + ? WHERE id=?',
      [quantity, ingredient_id]
    );

    // Ghi log nhập kho
    await db.query(
      `INSERT INTO inventory_logs 
        (ingredient_id, type, quantity, note, account_id) 
       VALUES (?, "nhap", ?, ?, ?)`,
      [ingredient_id, quantity, note || null, req.user.id]
    );

    res.json({ message: 'Nhập kho thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// XUẤT KHO THỦ CÔNG
exports.exportStock = async (req, res) => {
  const { ingredient_id, quantity, note } = req.body;
  try {
    // Kiểm tra tồn kho đủ không
    const [ingredient] = await db.query(
      'SELECT * FROM ingredients WHERE id=?', [ingredient_id]
    );
    if (ingredient.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nguyên liệu!' });
    }
    if (ingredient[0].quantity < quantity) {
      return res.status(400).json({ message: 'Tồn kho không đủ!' });
    }

    // Trừ tồn kho
    await db.query(
      'UPDATE ingredients SET quantity = quantity - ? WHERE id=?',
      [quantity, ingredient_id]
    );

    // Ghi log xuất kho
    await db.query(
      `INSERT INTO inventory_logs 
        (ingredient_id, type, quantity, note, account_id) 
       VALUES (?, "xuat", ?, ?, ?)`,
      [ingredient_id, quantity, note || null, req.user.id]
    );

    res.json({ message: 'Xuất kho thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// XEM LỊCH SỬ NHẬP/XUẤT KHO
exports.getInventoryLogs = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT il.*, i.name as ingredient_name, a.full_name as account_name
      FROM inventory_logs il
      LEFT JOIN ingredients i ON il.ingredient_id = i.id
      LEFT JOIN accounts a ON il.account_id = a.id
      ORDER BY il.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// XEM CÔNG THỨC MÓN ĂN
exports.getRecipes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, m.name as mon_ten, i.name as ingredient_name, i.unit
      FROM recipes r
      LEFT JOIN menu_items m ON r.menu_item_id = m.id
      LEFT JOIN ingredients i ON r.ingredient_id = i.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// THÊM CÔNG THỨC MÓN ĂN
exports.createRecipe = async (req, res) => {
  const { menu_item_id, ingredient_id, amount } = req.body;
  try {
    await db.query(
      `INSERT INTO recipes (menu_item_id, ingredient_id, amount) 
       VALUES (?, ?, ?)`,
      [menu_item_id, ingredient_id, amount]
    );
    res.status(201).json({ message: 'Thêm công thức thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};