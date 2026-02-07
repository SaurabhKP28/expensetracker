## 💰 Expense Tracker – Full Stack Web Application

A secure and scalable expense tracking application built using modern web technologies, featuring authentication, premium subscriptions, CSV downloads, and a leaderboard system.

---

### 📌 Table of Contents

Overview

Features

Tech Stack

Project Structure

Installation

Environment Variables

Database Setup

Running the Application

API Endpoints

Premium Features

Future Enhancements

License

---

### 📖 Overview

The Expense Tracker Application helps users record, manage, and analyze their expenses efficiently.
It includes user authentication, premium membership via Cashfree payments, CSV export, and a leaderboard to compare spending among users.

---

### ✨ Features
🔐 Authentication

User Signup & Login

JWT-based authentication

Password encryption using bcrypt

---

### 💸 Expense Management

Add expenses

View all expenses

Delete expenses

Persistent storage using MySQL

---

### 📊 Leaderboard (Premium)

Displays users ranked by total expenses

Optimized database queries using Sequelize

---

### 📁 CSV Download (Premium)

Download expense data in CSV format

Useful for finance tracking and reports

---

### 💳 Payment Integration

Premium membership via Cashfree Payment Gateway

Secure order creation & payment verification

---

### 🛠 Tech Stack
Frontend

HTML

CSS

JavaScript

Backend

Node.js

Express.js

Database

MySQL

Sequelize ORM

Security & Payments

JWT (Authentication)

bcrypt (Password hashing)

Cashfree Payment Gateway

---

### 📂 Project Structure

```bash
Expense-Tracker/
│
├── controllers/
│   ├── user.js
│   ├── expense.js
│   ├── purchase.js
│   └── leaderboard.js
│
├── models/
│   ├── user.js
│   ├── expense.js
│   ├── order.js
│   └── download.js
│
├── routes/
│   ├── user.js
│   ├── expense.js
│   ├── purchase.js
│   └── leaderboard.js
│
├── middleware/
│   └── auth.js
│
├── public/
│   ├── css/
│   └── js/
│
├── views/
│
├── utils/
│
├── app.js
├── package.json
├── .env
└── README.md

```
### ⚙️ Installation
1️⃣ Clone the Repository
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker

---

### 2️⃣ Install Dependencies
npm install

---

### 🔑 Environment Variables

Create a .env file in the root directory:

PORT=3000

DB_NAME=expense_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost

JWT_SECRET=your_jwt_secret

CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key

---

### 🗄 Database Setup

Create a MySQL database

Update credentials in .env

Sequelize will automatically create tables when the server starts

---

### ▶️ Running the Application
Development Mode
npm run dev

Production Mode
npm start

---

### 📍 Server runs at:

http://localhost:3000

🔗 API Endpoints
👤 User Routes
POST   /user/signup
POST   /user/login

💸 Expense Routes
POST   /expense/add
GET    /expense/get-expenses
DELETE /expense/delete/:id

💳 Premium Routes
GET    /purchase/premium-membership
POST   /purchase/update-transaction-status

🏆 Leaderboard
GET    /premium/show-leaderboard

📁 Download CSV
GET    /expense/download

---

### 🌟 Premium Features

✔ CSV Expense Download
✔ Leaderboard Access
✔ Payment-verified Premium Membership

---

### 🚧 Future Enhancements

Expense analytics with charts

Monthly & yearly reports

Expense categories & filters

Email notifications

Responsive UI & mobile support

---

### 📄 License

This project is licensed under the MIT License.

---

### 👨‍💻 Author

Saurabh Kumar Pandey
Full Stack Developer
