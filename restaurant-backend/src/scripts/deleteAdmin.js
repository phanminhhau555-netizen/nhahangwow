// Chạy: node src/scripts/deleteAdmin.js
// Xóa admin theo username trong .env

require('dotenv').config();
const db = require('../config/db');

const USERNAME = process.env.ADMIN_USERNAME;

if (!USERNAME) {
  console.error('✗ Thiếu ADMIN_USERNAME trong .env');
  process.exit(1);
}

async function run() {
  try {
    const [rows] = await db.query(
      'SELECT id FROM accounts WHERE username = ? AND role_id = 1',
      [USERNAME]
    );
    if (rows.length === 0) {
      console.log(`✓ Không tìm thấy admin "${USERNAME}".`);
      process.exit(0);
    }

    const id = rows[0].id;
    await db.query('UPDATE orders SET account_id = NULL WHERE account_id = ?', [id]);
    await db.query('UPDATE inventory_logs SET account_id = NULL WHERE account_id = ?', [id]);
    await db.query('DELETE FROM accounts WHERE id = ?', [id]);

    console.log(`✓ Đã xóa admin "${USERNAME}".`);
    process.exit(0);
  } catch (err) {
    console.error('✗ Lỗi:', err.message);
    process.exit(1);
  }
}

run();
