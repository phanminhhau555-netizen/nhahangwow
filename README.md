# NhaHangWow

Đồ án môn **SE104 – Nhập môn Công nghệ Phần mềm** · Trường Đại học Công nghệ Thông tin (UIT)

Hệ thống quản lý nhà hàng fullstack hỗ trợ 3 vai trò: Admin, Nhân viên phục vụ và Bếp.

## Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, React Router, Axios
- **Backend:** Node.js, Express.js, JWT
- **Database:** MySQL 8
- **Realtime:** Socket.IO

## Cài đặt

```bash
# 1. Import database
mysql -u root -p < schema.sql

# 2. Backend
cd restaurant-backend
npm install
node src/scripts/seedAdmin.js
node src/app.js

# 3. Frontend
cd restaurant-frontend
npm install
npm run dev
```

## .env

```env
PORT=8000
DB_HOST=localhost
DB_NAME=nhahangwow
DB_USER=root
DB_PASSWORD=
JWT_SECRET=
ADMIN_USERNAME=admin
ADMIN_PASSWORD=
```
