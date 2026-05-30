// Chạy: node src/scripts/updateAdmin.js
// Đổi username và password admin theo ADMIN_USERNAME cũ trong .env

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Sửa các giá trị này trước khi chạy
const OLD_USERNAME = process.env.ADMIN_USERNAME;
const NEW_USERNAME = process.env.ADMIN_NEW_USERNAME || process.env.ADMIN_USERNAME;
const NEW_PASSWORD = process.env.ADMIN_NEW_PASSWORD || process.env.ADMIN_PASSWORD;
const NEW_NAME     = process.env.ADMIN_NEW_NAME;

if (!OLD_USERNAME) {
  console.error('✗ Thiếu ADMIN_USERNAME trong .env');
  process.exit(1);
}
if (!NEW_PASSWORD) {
  console.error('✗ Thiếu ADMIN_NEW_PASSWORD (hoặc ADMIN_PASSWORD) trong .env');
  process.exit(1);
}

async function run() {
  try {
    const [rows] = await db.query(
      'SELECT id FROM accounts WHERE username = ? AND role_id = 1',
      [OLD_USERNAME]
    );
    if (rows.length === 0) {
      console.error(`✗ Không tìm thấy admin "${OLD_USERNAME}".`);
      process.exit(1);
    }

    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);
    await db.query(
      `UPDATE accounts SET
        username  = ?,
        password  = ?,
        full_name = COALESCE(NULLIF(?, ''), full_name)
       WHERE id = ?`,
      [NEW_USERNAME, hashed, NEW_NAME || '', rows[0].id]
    );

    console.log('✓ Cập nhật admin thành công!');
    console.log(`  Username mới : ${NEW_USERNAME}`);
    process.exit(0);
  } catch (err) {
    console.error('✗ Lỗi:', err.message);
    process.exit(1);
  }
}

run();
