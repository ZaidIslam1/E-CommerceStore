# 🛍️ E-Commerce Store

A full-stack e-commerce application built with modern web technologies, featuring user authentication, product management, shopping cart functionality, payment processing, and comprehensive analytics.

![E-Commerce Store](./frontend/public/screenshot-for-readme.png)

## 🚀 Live Demo

**🌐 [Live Application](https://e-commercestore-icdh.onrender.com)**

## 📋 Table of Contents

-   [Features](#-features)
-   [Tech Stack](#-tech-stack)
-   [Architecture](#-architecture)
-   [Installation](#-installation)
-   [Environment Variables](#-environment-variables)
-   [Usage](#-usage)
-   [API Endpoints](#-api-endpoints)
-   [Screenshots](#-screenshots)
-   [Contributing](#-contributing)
-   [License](#-license)

## ✨ Features

### 🔐 Authentication & Authorization

-   **JWT-based authentication** with access and refresh tokens
-   **Role-based access control** (Admin/User)
-   **Secure password hashing** using bcryptjs
-   **Cookie-based session management**

### 🛒 Shopping Experience

-   **Product catalog** with category filtering
-   **Featured products carousel** with responsive navigation
-   **Shopping cart** with real-time updates
-   **Quantity management** with add/remove functionality
-   **Responsive design** optimized for all devices

### 💳 Payment System

-   **Stripe integration** for secure payment processing
-   **Coupon system** with validation and automatic application
-   **Order management** with duplicate prevention
-   **Receipt generation** with order confirmation

### 👨‍💼 Admin Dashboard

-   **Product management** (Create, Read, Update, Delete)
-   **Analytics dashboard** with sales metrics
-   **User management** and order tracking
-   **Featured product toggles**

### 📊 Analytics & Insights

-   **Real-time sales analytics** with interactive charts
-   **Revenue tracking** with daily breakdown
-   **User and product statistics**
-   **Visual data representation** using Recharts

### 🎟️ Coupon System

-   **Dynamic coupon generation** for loyal customers
-   **Percentage-based discounts**
-   **Expiration date management**
-   **One-time use validation**

## 🛠️ Tech Stack

### Frontend

-   **React 19** - Modern UI library with latest features
-   **Vite** - Fast build tool and development server
-   **Tailwind CSS** - Utility-first CSS framework
-   **Framer Motion** - Smooth animations and transitions
-   **Zustand** - Lightweight state management
-   **React Router** - Client-side routing
-   **Recharts** - Interactive data visualization
-   **React Hot Toast** - Beautiful notifications
-   **Lucide React** - Modern icon library

### Backend

-   **Node.js** - JavaScript runtime environment
-   **Express.js** - Fast, minimalist web framework
-   **MongoDB** - NoSQL database with Mongoose ODM
-   **Redis** - In-memory caching for performance
-   **JWT** - Secure token-based authentication
-   **Cloudinary** - Image upload and management
-   **Stripe** - Payment processing integration

### Development & Deployment

-   **ESLint** - Code linting and formatting
-   **Nodemon** - Development server with hot reload
-   **Render** - Cloud platform for deployment
-   **Git** - Version control system

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React Client  │◄──►│  Express API    │◄──►│   MongoDB       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Tailwind CSS  │    │   Redis Cache   │    │   Cloudinary    │
│   Framer Motion │    │   JWT Auth      │    │   Image Storage │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │                 │
                       │ Stripe Payments │
                       │                 │
                       └─────────────────┘
```

## 🚀 Installation

### Prerequisites

-   Node.js (v18 or higher)
-   MongoDB database
-   Redis instance
-   Stripe account
-   Cloudinary account

### Clone the Repository

```bash
git clone https://github.com/ZaidIslam1/E-CommerceStore.git
cd E-CommerceStore
```

### Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm install --prefix frontend
```

### Build the Application

```bash
npm run build
```

### Start the Application

```bash
# Development mode (frontend and backend separately)
npm run dev

# Production mode (built application)
npm start
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# Redis Cache
REDIS_URL=your_redis_connection_string

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Client URL
CLIENT_URL=http://localhost:5001
```

## 📖 Usage

### For Users

1. **Browse Products** - Explore different product categories
2. **Add to Cart** - Select products and manage quantities
3. **Apply Coupons** - Use discount codes during checkout
4. **Secure Checkout** - Complete purchases with Stripe
5. **Track Orders** - View order history and status

### For Admins

1. **Dashboard Access** - Navigate to admin panel
2. **Manage Products** - Add, edit, or remove products
3. **View Analytics** - Monitor sales and user metrics
4. **Feature Products** - Promote products on homepage

## 🔌 API Endpoints

### Authentication

```
POST /api/auth/signup     - Register new user
POST /api/auth/login      - User login
POST /api/auth/logout     - User logout
POST /api/auth/refresh    - Refresh access token
GET  /api/auth/profile    - Get user profile
```

### Products

```
GET    /api/products              - Get all products (Admin)
GET    /api/products/featured     - Get featured products
GET    /api/products/category/:id - Get products by category
POST   /api/products/create       - Create product (Admin)
PATCH  /api/products/:id          - Toggle featured status (Admin)
DELETE /api/products/:id          - Delete product (Admin)
```

### Cart

```
GET    /api/cart          - Get cart items
POST   /api/cart/add      - Add item to cart
PUT    /api/cart/:id      - Update item quantity
DELETE /api/cart          - Remove item from cart
DELETE /api/cart/clear    - Clear entire cart
```

### Payments

```
POST /api/payment/create-checkout-session - Create Stripe session
POST /api/payment/checkout-success        - Handle successful payment
```

### Coupons

```
GET  /api/coupon          - Get user coupons
POST /api/coupon/validate - Validate coupon code
```

### Analytics

```
GET /api/analytics - Get sales analytics (Admin)
```

## 📱 Key Features Showcase

### 🎯 Modern UI/UX

-   **Responsive Design** with Tailwind CSS
-   **Smooth Animations** using Framer Motion
-   **Interactive Elements** with hover effects
-   **Loading States** and error handling

### 🔒 Security Features

-   **JWT Authentication** with refresh tokens
-   **Password Hashing** with bcryptjs
-   **Input Validation** and sanitization
-   **CORS Protection** and secure headers

### ⚡ Performance Optimizations

-   **Redis Caching** for frequently accessed data
-   **Image Optimization** with Cloudinary
-   **Code Splitting** with Vite
-   **Lazy Loading** for better performance

### 💼 Business Logic

-   **Inventory Management** with stock tracking
-   **Dynamic Pricing** with coupon integration
-   **Order Processing** with payment confirmation
-   **Analytics Dashboard** for business insights

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Zaid Islam**

-   GitHub: [@ZaidIslam1](https://github.com/ZaidIslam1)


## 🙏 Acknowledgments

-   **React Team** for the amazing UI library
-   **Stripe** for secure payment processing
-   **MongoDB** for flexible database solutions
-   **Tailwind CSS** for rapid UI development
-   **Render** for seamless deployment

---

⭐ Star this repository if you found it helpful!
