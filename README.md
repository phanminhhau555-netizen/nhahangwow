# Restaurant Fullstack Project

## Tech Stack
- Frontend: ReactJS + Vite + TailwindCSS
- Backend: Node.js + Express + MySQL + Sequelize + JWT

---

## Project Setup
```bash

cd restaurant-project

npm install express dotenv cors bcryptjs jsonwebtoken

npm install mysql2 sequelize

--Nho tai MySQL de chay schema.sql

PORT=5000 
DB_HOST= //localhost 
DB_NAME= //database_name 
DB_USER= //root 
DB_PASSWORD= //mk_cua_ban

--De start backend su dung:
+ node src/app.js 

--frontend

cd restaurant-frontend

npm install -D tailwindcss@3 postcss autoprefixer

npm install axios react-router-dom

npm run dev