# 🍕 Foodie Express — Frontend Client Application (Role-Based Architecture)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![FontAwesome](https://img.shields.io/badge/Font_Awesome-6.5.1-339AF0?style=flat&logo=fontawesome&logoColor=white)
![Responsive](https://img.shields.io/badge/Responsive-Mobile%20%26%20Desktop-success)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**Foodie Express Frontend** is organized into a modular **Role-Based Architecture** providing distinct workspaces for **Customers**, **Supervisors**, and **Administrators**, powered by shared core utilities and connected to the Spring Boot REST backend.

---

## 🌟 Architecture & Key Features

- **🛡️ Strict Role-Based Isolation:**
  - `/admin/` — Complete restaurant administration, menu management, supervisor order assignments, customer accounts, reservations, and analytics.
  - `/supervisor/` — High-efficiency dispatch workstation, driver/delivery tracking, and real-time status transitions (`CONFIRMED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
  - `/customer/` — Modern customer storefront, dynamic categorized menus, cart, checkout with multiple payment methods (COD, Card, UPI), table reservations, and live order tracking.
  - `/shared/` — Reusable, framework-agnostic utilities: `FoodieAPI` wrapper, `SharedAuth` session/guard management, `SharedStorage`, and `SharedUtils` notification/formatting engines.
- **⚡ Smart Root Router (`index.html`):** Automatically evaluates the logged-in session and routes users directly to their designated dashboard (`ROLE_ADMIN` ➔ `admin/dashboard.html`, `ROLE_SUPERVISOR` ➔ `supervisor/dashboard.html`, `ROLE_CUSTOMER` ➔ `customer/index.html`).
- **📱 Fully Responsive Design:** Clean mobile and desktop UX across all roles (320px+ mobile to 4K displays).
- **🎨 Premium Light Theme UI/UX:** Styled with role-isolated design systems, typography (*Plus Jakarta Sans*, *Inter*), micro-animations, and custom toast notifications.

---

## 📂 Project Directory Structure

```
Foodie-Express-Frontend/
├── index.html                        # Smart Root Router (Auto-detects role & redirects)
│
├── admin/                            # 👑 Admin Back-Office Workspace
│   ├── index.html                    # Admin Route Guard & Entry
│   ├── login.html                    # Dedicated Admin Sign-In
│   ├── dashboard.html                # Executive Analytics & Metrics Dashboard
│   ├── orders.html                   # All Orders Management & Supervisor Assignment
│   ├── order-details.html            # Order Deep-Dive & Item Breakdown
│   ├── menu-items.html               # Menu CRUD & Live In-Stock Switch
│   ├── categories.html               # Menu Categories Management
│   ├── customers.html                # Customer Accounts & Status Management
│   ├── payments.html                 # Payment Settlements & Transaction Audit
│   ├── reservations.html             # Table Reservations Management
│   ├── inquiries.html                # Customer Inquiries & Messages
│   ├── store-settings.html           # Restaurant Global Configuration
│   ├── css/
│   │   └── admin.css                 # Admin Isolated Stylesheet & Component System
│   └── js/
│       ├── admin.js                  # Admin Shell Controller & Sidebar State
│       ├── dashboard.js              # Dashboard KPI Metrics Engine
│       ├── orders.js                 # Orders Dispatch & Supervisor Modal Handler
│       ├── menu.js                   # Menu Management Logic
│       ├── categories.js             # Category Management Logic
│       ├── customers.js              # Customer Management Logic
│       ├── payments.js               # Payments Audit Logic
│       ├── reservations.js           # Reservation Approval Logic
│       ├── messages.js               # Inquiries Logic
│       └── settings.js               # Store Configuration Logic
│
├── supervisor/                       # 🚚 Supervisor Dispatch Workspace
│   ├── index.html                    # Supervisor Route Guard & Entry
│   ├── dashboard.html                # Operations Dashboard & KPI Cards
│   ├── assigned-orders.html          # Supervisor Assigned Orders Workstation
│   ├── order-details.html            # Delivery Order Details & Customer Contact
│   ├── profile.html                  # Supervisor Profile & Settings
│   ├── css/
│   │   └── supervisor.css            # Supervisor Isolated Design System
│   └── js/
│       └── supervisor.js             # Status Transition & Live Filter Controller
│
├── customer/                         # 🛍️ Customer Storefront Workspace
│   ├── index.html                    # Homepage (Hero, Specials, Categories, Featured)
│   ├── menu.html                     # Dynamic Menu Catalog with Search & Filter
│   ├── veg.html                      # Vegetarian Specialties Page
│   ├── nonveg.html                   # Non-Vegetarian Specialties Page
│   ├── indian.html                   # Indian Delicacies Page
│   ├── snacks.html                   # Snacks & Appetizers Page
│   ├── dessert.html                  # Desserts & Beverages Page
│   ├── cart.html                     # Interactive Shopping Cart
│   ├── payment.html                  # Multi-Method Checkout (COD, Card, UPI)
│   ├── success.html                  # Order Placed Confirmation Page
│   ├── orders.html                   # Order History & Real-Time Tracking
│   ├── order-details.html            # Detailed Invoice & Order Receipt
│   ├── reservations.html             # Dine-In Table Booking Form
│   ├── wishlist.html                 # Saved Favorites List
│   ├── profile.html                  # Customer Profile & Geolocation Address Autofill
│   ├── about.html                    # About Foodie Express
│   ├── contact.html                  # Contact Form & Help Desk
│   ├── login.html                    # Customer Sign-In
│   ├── signup.html                   # Customer Registration
│   ├── logout.html                   # Safe Sign-Out & Session Clearing
│   ├── css/
│   │   └── customer.css              # Customer Storefront Design System
│   └── js/
│       ├── customer.js               # Storefront Layout & Header Controller
│       ├── app.js                    # Global Helpers & Core Customer Scripts
│       ├── auth.js                   # Authentication & Session Handlers
│       ├── cart.js                   # Cart State & Price Calculation Engine
│       ├── menu.js                   # Menu Catalog Dynamic Fetch & Filter
│       ├── payment.js                # Checkout & Order Placement Engine
│       └── wishlist.js               # Wishlist State Management
│
├── shared/                           # 🔗 Shared Assets & Core Libraries
│   ├── js/
│   │   ├── api.js                    # FoodieAPI REST Client Wrapper
│   │   ├── auth.js                   # Universal SharedAuth (Guards, Session, Token)
│   │   ├── storage.js                # SharedStorage LocalStorage Wrapper
│   │   └── utils.js                  # SharedUtils (Toasts, Currency, Formatters)
│   ├── css/
│   │   ├── global.css                # Base Resets & Global Tokens
│   │   └── components.css            # Reusable UI Atoms (Buttons, Modals, Badges)
│   └── assets/images/                # Brand Logos & Shared Graphics
│
├── images/                           # Food Photography & Asset Catalog
├── vercel.json                       # Static Deployment Configuration
└── package.json                      # Project Metadata
```

---

## 🔄 Orders Management Workflow Across Roles

| Step | Customer (`customer/`) | Admin (`admin/`) | Supervisor (`supervisor/`) |
| :--- | :--- | :--- | :--- |
| **1. Placement** | Adds items to cart, selects COD/Card/UPI, and places order. Status: `PENDING`. | Receives notification in real-time orders list. | — |
| **2. Assignment** | Tracks live status on `customer/orders.html`. | Opens `admin/orders.html`, reviews order, and assigns to an active Supervisor. | Assigned order appears on `supervisor/assigned-orders.html`. |
| **3. Preparation** | Sees status update: `PREPARING`. | Monitors kitchen preparation metrics on dashboard. | Updates order state to `PREPARING` when kitchen begins cooking. |
| **4. Dispatch** | Sees delivery partner dispatched: `OUT_FOR_DELIVERY`. | Monitors live active transit count. | Updates status to `OUT_FOR_DELIVERY` upon driver pickup. |
| **5. Delivery** | Receives food and confirmation receipt. Status: `DELIVERED`. | Order transitions into completed history; revenue logged. | Marks order as `DELIVERED` at customer doorstep. |

---

## ⚙️ Configuration & Backend Connection

The frontend automatically resolves the backend API URL:
- **Local Development:** Defaults to `http://localhost:8080`
- **Live Deployment:** Auto-detects production API host
- **Manual Customization:** Set `localStorage.setItem('FOODIE_API_BASE_URL', 'https://your-api.com')` or modify `shared/js/api.js`.

---

## 🚀 Running the Application

You can serve the frontend with any HTTP server:

### Option 1: Python HTTP Server (Recommended)
```bash
cd Foodie-Express-Frontend
python -m http.server 3000
```
Open **`http://localhost:3000`** in your browser.

### Option 2: Node `serve`
```bash
npx serve .
```

### Option 3: VS Code Live Server
Right-click `index.html` at the project root and choose **"Open with Live Server"**.

---

## 👥 Role Testing Credentials

| Role | Email | Password | Target Entry Point |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@foodie.com` | `admin123` | `http://localhost:3000/admin/login.html` |
| **Supervisor** | `supervisor@foodie.com` | `super123` | `http://localhost:3000/customer/login.html` or `admin/login.html` |
| **Customer** | `john@example.com` | `password123` | `http://localhost:3000/customer/login.html` |

---

© 2026 Foodie Express. All rights reserved.
