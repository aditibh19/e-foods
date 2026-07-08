# 🍔 e-Foods – Full Stack Food Ordering & Delivery Platform

A modern full-stack food ordering and delivery platform built using **React, TypeScript, Express.js, PostgreSQL, and Drizzle ORM**. The application enables users to browse restaurants, explore menus, add items to their cart, place orders, and manage their profiles through a responsive and user-friendly interface. An admin dashboard is also provided for managing restaurants, menus, and customer orders.

---

## 🌐 Live Demo

**Frontend:** https://e-foods-efoods.vercel.app/

**Backend API:** https://e-foods.onrender.com

---

## ✨ Features

### 👤 Customer Features

- Secure User Registration & Login
- JWT Authentication
- Browse Restaurants
- Explore Restaurant Menus
- Search Food Items
- Shopping Cart Management
- Place Orders
- View Order History
- User Profile Management
- Fully Responsive UI

### 🛠️ Admin Features

- Admin Dashboard
- Restaurant Management
- Menu Management
- Order Management
- Protected Admin Routes

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- React Query
- Tailwind CSS

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication

### Database

- PostgreSQL
- Drizzle ORM

### Tools & Technologies

- pnpm Workspace
- OpenAPI
- Zod Validation
- Git
- GitHub
- Vercel
- Render

---

## 📂 Project Structure

```text
efoods/
│
├── artifacts/
│   ├── api-server/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middlewares/
│   │   │   ├── controllers/
│   │   │   └── services/
│   │
│   └── efoods/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── router.tsx
│       │   └── App.tsx
│
├── lib/
│   ├── db/
│   ├── api-spec/
│   ├── api-client-react/
│   └── api-zod/
│
├── scripts/
│   └── src/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## ⚙️ Installation

### Prerequisites

- Node.js (v18 or above)
- pnpm
- PostgreSQL

### Clone the Repository

```bash
git clone https://github.com/aditibh19/efoods.git
cd efoods
```

### Install Dependencies

```bash
pnpm install
```

### Configure Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL=postgresql://username:password@localhost:5432/efoods

SESSION_SECRET=your-secret-key
```

### Push Database Schema

```bash
pnpm --filter @workspace/db run push
```

### Seed Database

```bash
pnpm --filter @workspace/scripts run seed
```

---

## ▶️ Running the Application

### Start Backend

```bash
pnpm --filter @workspace/api-server run dev
```

Backend:

```
http://localhost:8080
```

### Start Frontend

```bash
pnpm --filter @workspace/efoods run dev
```

Frontend:

```
http://localhost:5173
```

---

## 📦 Available Scripts

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Seed sample data
pnpm --filter @workspace/scripts run seed

# Run backend
pnpm --filter @workspace/api-server run dev

# Run frontend
pnpm --filter @workspace/efoods run dev

# Type checking
pnpm run typecheck

# Type checking libraries
pnpm run typecheck:libs

# Build workspace
pnpm run build
```

---

## 🔐 Authentication

The application uses **JSON Web Token (JWT)** based authentication for secure user authorization.

Protected routes include:

- User Profile
- Cart
- Checkout
- Orders
- Admin Dashboard

---

## 🗄️ Database

The application uses **PostgreSQL** with **Drizzle ORM** for efficient and type-safe database management.

Database entities include:

- Users
- Restaurants
- Menu Items
- Orders
- Order Items
- User Profiles

---

## 📌 API Endpoints

| Method | Endpoint | Description |
|----------|------------------------|------------------------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | User login |
| GET | `/restaurants` | Get all restaurants |
| GET | `/restaurants/:id` | Get restaurant details |
| GET | `/menu/:restaurantId` | Get restaurant menu |
| POST | `/cart` | Add item to cart |
| GET | `/orders` | Get user orders |
| POST | `/orders` | Place a new order |

---

## 🚀 Key Highlights

- Full Stack Web Application
- Responsive User Interface
- JWT Authentication
- RESTful API Architecture
- PostgreSQL Database
- Drizzle ORM
- OpenAPI Integration
- TypeScript
- React Query
- Modular Project Structure
- Clean & Scalable Codebase

---


## 👩‍💻 Author

**Aditi Bhalla**

- GitHub: https://github.com/aditibh19
- LinkedIn: https://www.linkedin.com/in/aditibh19/

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

