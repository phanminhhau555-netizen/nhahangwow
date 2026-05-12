const db = require('../config/db');

// TÍNH TIỀN & LẬP HÓA ĐƠN
exports.getInvoice = async (req, res) => {
  const order_id = req.params.id;
  try {
    // Lấy thông tin order
    const [order] = await db.query(
      'SELECT * FROM orders WHERE id=?', [order_id]
    );
    if (order.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy order!' });
    }

    // Lấy danh sách món
    const [items] = await db.query(`
      SELECT oi.*, m.name as mon_ten
      FROM order_items oi
      LEFT JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id=? AND oi.status != "huy"
    `, [order_id]);

    // Lấy cấu hình thuế
    const [config] = await db.query('SELECT * FROM config LIMIT 1');
    const tax_rate = config.length > 0 ? config[0].tax_rate : 0;

    const total_amount = order[0].total_amount || 0;
    const tax_amount = (total_amount * tax_rate) / 100;
    const final_amount = total_amount + tax_amount;

    res.json({
      order: order[0],
      items,
      total_amount,
      tax_rate,
      tax_amount,
      final_amount
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ÁP DỤNG KHUYẾN MÃI
exports.applyPromotion = async (req, res) => {
  const { code } = req.body;
  const order_id = req.params.id;
  try {
    // Kiểm tra mã khuyến mãi
    const [promo] = await db.query(`
      SELECT * FROM promotions 
      WHERE code=? AND is_active=1 
      AND valid_from <= CURDATE() 
      AND valid_to >= CURDATE()
    `, [code]);

    if (promo.length === 0) {
      return res.status(404).json({ message: 'Mã khuyến mãi không hợp lệ!' });
    }

    // Lấy tổng tiền order
    const [order] = await db.query(
      'SELECT total_amount FROM orders WHERE id=?', [order_id]
    );

    const total = order[0].total_amount;
    let discount = 0;

    if (promo[0].discount_percent) {
      discount = (total * promo[0].discount_percent) / 100;
    } else if (promo[0].discount_amount) {
      discount = promo[0].discount_amount;
    }

    // Cập nhật order
    await db.query(
      `UPDATE orders SET 
        promotion_id=?, 
        discount_amount=? 
       WHERE id=?`,
      [promo[0].id, discount, order_id]
    );

    res.json({ 
      message: 'Áp dụng khuyến mãi thành công!',
      discount_amount: discount
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// THANH TOÁN
exports.checkout = async (req, res) => {
  const { payment_method, customer_id } = req.body;
  const order_id = req.params.id;
  try {
    // Lấy thông tin order
    const [order] = await db.query(
      'SELECT * FROM orders WHERE id=?', [order_id]
    );
    if (order.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy order!' });
    }
    if (order[0].status === 'da_thanh_toan') {
      return res.status(400).json({ message: 'Order đã được thanh toán!' });
    }

    // Lấy thuế
    const [config] = await db.query('SELECT tax_rate FROM config LIMIT 1');
    const tax_rate = config.length > 0 ? config[0].tax_rate : 0;
    const total = order[0].total_amount || 0;
    const tax_amount = (total * tax_rate) / 100;
    const discount = order[0].discount_amount || 0;
    const final_amount = total + tax_amount - discount;

    // Cập nhật order thành đã thanh toán
    await db.query(`
      UPDATE orders SET 
        status="da_thanh_toan",
        payment_method=?,
        tax_amount=?,
        total_amount=?,
        customer_id=?,
        paid_at=NOW()
      WHERE id=?
    `, [payment_method, tax_amount, final_amount, customer_id || null, order_id]);

    // Giải phóng bàn
    await db.query(
      'UPDATE tables SET status="trong" WHERE id=?',
      [order[0].table_id]
    );

    // Cộng điểm khách hàng nếu có
    if (customer_id) {
      const points = Math.floor(final_amount / 10000);
      await db.query(
        'UPDATE customers SET points = points + ? WHERE id=?',
        [points, customer_id]
      );
    }

    // Tự động trừ kho nguyên liệu
    await deductInventory(order_id);

    res.json({ 
      message: 'Thanh toán thành công!',
      final_amount,
      payment_method
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// HỦY ORDER
exports.cancelOrder = async (req, res) => {
  const order_id = req.params.id;
  try {
    const [order] = await db.query(
      'SELECT * FROM orders WHERE id=?', [order_id]
    );
    if (order[0].status === 'da_thanh_toan') {
      return res.status(400).json({ message: 'Không thể hủy order đã thanh toán!' });
    }

    await db.query(
      'UPDATE orders SET status="huy" WHERE id=?', [order_id]
    );
    await db.query(
      'UPDATE tables SET status="trong" WHERE id=?',
      [order[0].table_id]
    );

    res.json({ message: 'Hủy order thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// HÀM TỰ ĐỘNG TRỪ KHO (dùng nội bộ)
async function deductInventory(order_id) {
  const [items] = await db.query(
    'SELECT * FROM order_items WHERE order_id=? AND status="hoan_thanh"',
    [order_id]
  );
  for (const item of items) {
    const [recipes] = await db.query(
      'SELECT * FROM recipes WHERE menu_item_id=?',
      [item.menu_item_id]
    );
    for (const recipe of recipes) {
      await db.query(
        'UPDATE ingredients SET quantity = quantity - ? WHERE id=?',
        [recipe.amount * item.quantity, recipe.ingredient_id]
      );
    }
  }
}