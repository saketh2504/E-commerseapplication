# 🛒 E-Commerce Application

![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow)

A full-stack **E-Commerce Web Application** built using **React**, **FastAPI**, and **MongoDB**. It provides a seamless online shopping experience with secure authentication, product management, shopping cart functionality, and an admin dashboard.

---

## 🚀 Live Demo

* **Frontend:** https://e-commerseapplication.vercel.app
* **Backend:** https://ecommerse-backend-gffh.onrender.com

---

## 📑 Table of Contents

* Features
* Tech Stack
* Project Structure
* Installation
* Screenshots
* API Overview
* Deployment
* Future Enhancements
* Author

---

## ✨ Features

### 👤 User Features

* 🔐 Secure User Registration & Login (JWT Authentication)
* 🛍️ Browse Products by Categories
* 🔎 Search & Filter Products
* 🛒 Add/Remove Products from Cart
* 💳 Checkout & Place Orders
* 📦 View Order History
* 👤 Manage User Profile
* 📱 Fully Responsive User Interface

### 👨‍💼 Admin Features

* ➕ Add New Products
* ✏️ Update Existing Products
* ❌ Delete Products
* 📊 Manage Product Inventory

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Tailwind CSS
* Axios

### Backend

* FastAPI
* Python
* JWT Authentication
* Pydantic

### Database

* MongoDB Atlas

---

## 📂 Project Structure

```text
E-commerseapplication/
│
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
│
├── assets/
│   └── screenshots/
│
├── README.md
└── .gitignore
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/saketh2504/E-commerseapplication.git

cd E-commerseapplication
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn server:app --reload
```

### Frontend Setup

```bash
cd frontend

npm install

npm start
```

---

## 📸 Screenshots

> Replace these images after uploading your screenshots to the `assets/screenshots` folder.

### 🏠 Home Page

![Home](assets/screenshots/home.png)

---

### 🛍️ Products Page

![Products](assets/screenshots/products.png)

---

### 📦 Product Details

![Product Details](assets/screenshots/product-details.png)

---

### 🛒 Shopping Cart

![Cart](assets/screenshots/cart.png)

---

### 💳 Checkout

![Checkout](assets/screenshots/checkout.png)

---

### 👨‍💼 Admin Dashboard

![Admin Dashboard](assets/screenshots/admin-dashboard.png)

---

## 📡 API Overview

The backend exposes RESTful APIs for:

* Authentication
* Product Management
* Shopping Cart
* Orders
* User Management

---

## ☁️ Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

## 🔮 Future Enhancements

* 💳 Online Payment Gateway Integration
* ❤️ Wishlist Feature
* ⭐ Product Reviews & Ratings
* 📧 Email Notifications
* 🚚 Order Tracking
* 📦 Inventory Management
* 📈 Sales Analytics Dashboard

---

## 👨‍💻 Author

**Saketh Anumari**

* **GitHub:** https://github.com/saketh2504
* **LinkedIn:** https://www.linkedin.com/in/saketh-anumari-ba85a42bb/

---

## ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub. It helps others discover the project and supports my work.
