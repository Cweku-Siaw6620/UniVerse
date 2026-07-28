# 🌍 UniVerse

> **Your Digital Frontier for Commerce**

UniVerse is a university-focused multi-vendor e-commerce platform built to empower student entrepreneurs and small businesses by providing them with an affordable digital storefront. The platform enables users to create stores, upload products, manage their inventory, subscribe to premium plans, and connect with customers through a secure and modern marketplace.

---

## 🚀 Project Title

**UniVerse – Student Marketplace & Digital Storefront Platform**

---

## 🌐 Demo Link

**Live Website:** https://universeweb.co

---

## 📑 Table of Contents

- Business Understanding
- Data Understanding
- Screenshots of Results
- Technologies
- Setup
- Approach
- Features
- Future Improvements
- Status
- Credits

---

# 📖 Business Understanding

Many student entrepreneurs rely heavily on WhatsApp, Instagram, and Facebook to advertise their products. While these platforms provide visibility, they lack proper product organization, inventory management, business analytics, and dedicated online storefronts.

UniVerse solves this problem by providing students and small businesses with their own digital stores where customers can browse products, contact vendors, and discover businesses within a centralized marketplace.

### Objectives

- Promote student entrepreneurship.
- Give vendors professional online stores.
- Improve product discoverability.
- Increase trust through student verification.
- Provide business insights and analytics.
- Create a scalable commerce platform for universities.

---

# 📊 Data Understanding

UniVerse manages several core data models.

### Users

- Google Authentication
- Profile Information
- Student Verification
- Subscription Status
- User Roles

### Stores

- Store Name
- Store Description
- Category
- Logo
- Banner
- Subscription Plan
- Analytics

### Products

- Product Name
- Price
- Images
- Category
- Stock
- Description

### Analytics

- Store Views
- Product Views
- WhatsApp Clicks
- Customer Engagement

### Verification

- Student ID Images
- Verification Status
- University
- Expiration Date

MongoDB is used as the primary database with Mongoose for schema modeling.

---

# 📷 Screenshots of Visualizations / Results

> *(Replace these placeholders with actual screenshots.)*

### Homepage

![Homepage](screenshots/homepage.png)

---

### Store Page

![Store](screenshots/store.png)

---

### Product Details

![Product](screenshots/product.png)

---

### Dashboard

![Dashboard](screenshots/dashboard.png)

---

### Student Verification

![Verification](screenshots/verification.png)

---

# 💻 Technologies

## Frontend

- HTML5
- CSS3
- JavaScript (ES6)

## Backend

- Node.js
- Express.js

## Database

- MongoDB Atlas
- Mongoose

## Authentication

- Google OAuth 2.0

## Cloud Services

- Cloudinary
- Vercel
- Netlify

## Payments

- Paystack

## Other Tools

- Nodemailer
- Git
- GitHub
- VS Code

---

# ⚙️ Setup

Clone the repository.

```bash
git clone https://github.com/yourusername/universe.git
```

Navigate into the project.

```bash
cd universe
```

Install dependencies.

```bash
npm install
```

Create a `.env` file.

```env
PORT=
MONGODB_URI=
GOOGLE_CLIENT_ID=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Run the server.

```bash
npm start
```

or

```bash
npm run dev
```

---

# 🏗️ Approach

The platform follows a modular full-stack architecture.

```
Frontend
      │
      ▼
Express API
      │
      ▼
MongoDB Atlas
```

### Authentication

- Google OAuth Login
- User Profile Completion
- Session Management

### Marketplace

- Product Listings
- Store Pages
- Categories
- Search
- Recommendations

### Store Management

- Store Creation
- Product Management
- Analytics Dashboard
- Subscription Plans

### Verification

- Student ID Upload
- Admin Approval
- Verification Badge

### Payments

- Premium Subscription
- Paystack Integration
- Webhook Verification

---

# ✨ Features

- Google Sign-In
- Student Verification
- Multi-Vendor Marketplace
- Product Search
- Store Pages
- Store Analytics
- Product Analytics
- WhatsApp Contact Integration
- Premium Store Plans
- Featured Stores
- Recommended Products
- Product Sharing
- Secure Image Uploads
- Responsive Design
- User Manual
- Admin Verification System

---

# 🔮 Future Improvements

- AI Product Recommendations
- AI Customer Support
- Order Management
- Shopping Cart
- Secure Checkout
- Customer Reviews
- Mobile Application
- Push Notifications
- Real-Time Messaging
- Multi-language Support
- Load Balancing
- Microservice Architecture
- Redis Caching
- Docker Deployment
- Kubernetes Scaling

---

# 📈 Status

🟢 **Active Development**

Current Version:
**v1.0**

Completed:

- User Authentication
- Student Verification
- Store Management
- Product Listings
- Premium Subscriptions
- Analytics Dashboard

Currently Working On:

- UI Improvements
- Portfolio Integration
- Marketing
- Performance Optimization

---

# 🙏 Credits

**Developed by**

**Kelvin Ashong**

Computer Science Student | Frontend Developer | Full-Stack Developer

---

### Special Thanks

- MongoDB Atlas
- Vercel
- Netlify
- Paystack
- Cloudinary
- Google OAuth
- OpenAI

---

## 📄 License

This project is licensed under the MIT License.

---

### 🌟 UniVerse

**Empowering Student Entrepreneurs Through Digital Commerce**