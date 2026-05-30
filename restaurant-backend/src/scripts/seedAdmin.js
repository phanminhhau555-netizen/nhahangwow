// Chạy 1 lần: node src/scripts/seedAdmin.js
// Tạo tài khoản admin đầu tiên

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const ADMIN = {
  username:  process.env.ADMIN_USERNAME || 'admin',
  password:  process.env.ADMIN_PASSWORD,
  full_name: process.env.ADMIN_NAME || 'Super Admin',
  role_id:   1,
};

if (!ADMIN.password) {
  console.error('✗ Thiếu ADMIN_PASSWORD trong .env');
  process.exit(1);
}

async function seed() {
  try {
    const [existing] = await db.query(
      'SELECT id FROM accounts WHERE role_id = 1 LIMIT 1'
    );
    if (existing.length > 0) {
      console.log('✓ Admin đã tồn tại, bỏ qua.');
      process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN.password, 10);
    await db.query(
      'INSERT INTO accounts (username, password, full_name, role_id) VALUES (?, ?, ?, ?)',
      [ADMIN.username, hashed, ADMIN.full_name, ADMIN.role_id]
    );

    console.log('✓ Tạo admin thành công!');
    console.log(`  Username : ${ADMIN.username}`);
    console.log(`  Password : ${ADMIN.password}`);
    process.exit(0);
  } catch (err) {
    console.error('✗ Lỗi:', err.message);
    process.exit(1);
  }
}

seed();
