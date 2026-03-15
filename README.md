 E-Commerce REST API

A full-featured e-commerce backend built with Node.js, TypeScript, Express, PostgreSQL, and Prisma ORM.


## 🚀 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: JWT + bcryptjs



## 📁 Project Structure


src/
├── config/
│   └── db.ts              # Prisma client
├── controllers/
│   ├── authController.ts
│   ├── categoryController.ts
│   ├── productController.ts
│   ├── cartController.ts
│   ├── orderController.ts
│   └── reviewController.ts
├── middleware/
│   ├── authMiddleware.ts  # protect + authorize
│   └── errorMiddleware.ts # notFound + errorHandler
├── routes/
│   ├── authRoutes.ts
│   ├── categoryRoutes.ts
│   ├── productRoutes.ts
│   ├── cartRoutes.ts
│   └── orderRoutes.ts
└── server.ts


---

## ⚙️ Setup

### 1. Clone the repo

```bash
git clone https://github.com/yashkaushik12e/ecommerce-backend.git
cd ecommerce-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root:

```env
DATABASE_URL="your_neon_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
PORT=5000
```

### 4. Run migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the server

```bash
# Development
npm run dev

# Production
npm run build
npm start


## 📌 API Endpoints

### Health Check
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/health` | Public |

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |

### Categories
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/categories` | Public |
| POST | `/api/categories` | Admin |

### Products
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Seller / Admin |
| PUT | `/api/products/:id` | Seller / Admin |
| DELETE | `/api/products/:id` | Seller / Admin |
| GET | `/api/products/:id/reviews` | Public |
| POST | `/api/products/:id/reviews` | Authenticated |

### Cart
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/cart` | Authenticated |
| POST | `/api/cart/items` | Authenticated |
| PUT | `/api/cart/items/:id` | Authenticated |
| DELETE | `/api/cart/items/:id` | Authenticated |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/orders` | Authenticated |
| GET | `/api/orders` | Authenticated |
| GET | `/api/orders/:id` | Authenticated |
| PUT | `/api/orders/:id/status` | Admin / Seller |


## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:


Authorization: Bearer <your_token>


## 👥 User Roles

| Role | Permissions |
|------|-------------|
| `BUYER` | Browse, cart, orders, reviews |
| `SELLER` | + Create/manage own products |
| `ADMIN` | + Full access to everything |


## 🗄️ Data Models

User → Cart → CartItems → Products
User → Orders → OrderItems → Products
User → Products (as seller)
User → Reviews → Products
Category → Products
```

---

## 🧪 Key Features

- ✅ JWT Authentication with role-based access
- ✅ Password hashing with bcryptjs
- ✅ Product search, filter, and pagination
- ✅ Cart with computed total amount
- ✅ Order management with status lifecycle
- ✅ Stock management with auto status update
- ✅ Database transactions for order creation
- ✅ Reviews restricted to verified buyers
- ✅ Global error handling
