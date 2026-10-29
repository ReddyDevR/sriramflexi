# Sri Ramu Digital — Flex & Offset Printing Press
## Enterprise Real-Time Notification & Communication System (MERN Stack)

A production-grade, commercial web application for **Sri Ramu Digital — Flex & Offset Printing**, featuring a centralized, multi-channel real-time notification and communication engine connecting customers with the factory pressroom and Admin command center.

---

### 🌟 Key Highlights & Architectural Overview

1. **Centralized Backend Notification Dispatcher (`notificationDispatcher.js`)**:
   - Asynchronous decoupled queue: main order and payment transactions complete in milliseconds; notifications process safely in the background.
   - Channel Matrix:
     - `IN_APP`: In-app notification center with unread badge counter, category filters, and direct action triggers.
     - `WEB_PUSH`: Device-level push notifications powered by VAPID (`web-push`) with multi-device tracking.
     - `EMAIL`: Brevo (Sendinblue) transactional emails with responsive branded HTML templates and template variable interpolation.
     - `REAL_TIME_ADMIN`: Instant WebSocket events via Socket.IO directly to the Admin command desk.
     - `SOUND_ALERT_FOR_ADMIN`: Browser-compatible Web Audio API synthesized chimes for orders, payments, and urgent requests.
   - Idempotency & Duplicate Prevention: Unique `idempotencyKey` prevents duplicate emails or notifications from accidental page refreshes.

2. **25 Structured Event Types**:
   - `WELCOME`, `ORDER_CREATED`, `ORDER_ACCEPTED`, `ORDER_UPDATED`, `ORDER_CANCELLED`, `ORDER_REJECTED`, `ORDER_COMPLETED`, `PAYMENT_SUBMITTED`, `PAYMENT_VERIFIED`, `PAYMENT_REJECTED`, `QUOTATION_CREATED`, `QUOTATION_UPDATED`, `QUOTATION_ACCEPTED`, `CUSTOMER_REQUEST`, `DESIGN_UPDATE`, `PRINTING_STARTED`, `PRINTING_COMPLETED`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `REFUND`, `COUPON`, `OFFER`, `SUPPORT`, `SYSTEM`, `ADMIN_ALERT`.

3. **Brevo Transactional Email Integration**:
   - Reusable template system with dynamic variables:
     `{{customerName}}`, `{{orderId}}`, `{{orderDate}}`, `{{orderStatus}}`, `{{paymentStatus}}`, `{{paymentAmount}}`, `{{paymentMode}}`, `{{transactionId}}`, `{{serviceName}}`, `{{subtotal}}`, `{{discount}}`, `{{totalAmount}}`, `{{couponCode}}`, `{{quotationAmount}}`, `{{businessName}}`, `{{businessPhone}}`, `{{businessEmail}}`, `{{businessAddress}}`, `{{orderLink}}`.
   - Admin Email Log Inspector with full rendered HTML preview.
   - Graceful fallback: If `BREVO_API_KEY` is not yet configured, the system logs the full simulated email transaction with live HTML preview without breaking checkout.

4. **Web Push (VAPID) Notifications**:
   - Full Service Worker (`sw.js`) support for desktop and mobile PWA browsers.
   - Multi-device support per customer with automatic pruning of expired endpoints (410/404).

5. **Admin Sound System & Autoplay Compliance**:
   - Pure Web Audio API synthesized tones (no 404s, no external media lag):
     - **New Order Alert**: Upbeat 4-note ascending fanfare (C5 -> E5 -> G5 -> C6).
     - **Payment Alert**: Crisp cash register chime (E6 -> G#6).
     - **Request / Cancellation Alert**: Urgent attention chime (A5 -> F5 -> A5).
   - Prominent Mute/Unmute toggle and Test Sound controls.

6. **Dynamic Browser Tab Title Alerts**:
   - Tab title flashes alert when backgrounded (e.g. `(3) New Orders — Sri Ramu Digital`).

7. **Interactive 20-Scenario Verification Suite**:
   - Built directly into the Admin dashboard (`VerificationSuiteModal.jsx`), allowing one-click automated testing of all 20 required customer and admin communication scenarios.

---

### 📂 Project Structure

```
sri-ramu-digital/
├── backend/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection with persistent embedded JSON fallback
│   │   └── store.js                  # Persistent JSON datastore & models
│   ├── controllers/
│   │   ├── authController.js         # Customer & Admin registration, login, preferences
│   │   ├── orderController.js        # Order creation, status progression, cancellation
│   │   ├── paymentController.js      # Payment submission, UTR verification, rejection
│   │   ├── productController.js      # Products catalog & custom price calculator
│   │   ├── requestController.js      # Custom quotation & support tickets
│   │   ├── notificationController.js # In-app notifications & Web Push subscription
│   │   └── adminNotificationController.js # Delivery logs, Brevo inspector, settings, test suite
│   ├── services/
│   │   ├── notificationDispatcher.js # Centralized multi-channel dispatcher & queue
│   │   ├── brevoEmailService.js      # Brevo REST API v3 transactional email service
│   │   ├── webPushService.js         # Web Push VAPID service
│   │   └── socketService.js          # Socket.IO room broadcaster & live counters
│   ├── routes/                       # Express API endpoints
│   ├── data/seedData.js              # Initial seed products, admin & customer users
│   ├── .env                          # Backend configuration
│   └── server.js                     # Main server entrypoint
│
└── frontend/
    ├── public/
    │   ├── images/                   # High-res SVG product graphics (Flex, Vinyl, Offset, Cards, etc.)
    │   ├── sw.js                     # Service Worker for Web Push & PWA
    │   └── manifest.json             # PWA Web App Manifest
    ├── src/
    │   ├── components/               # Navbar, NotificationDrawer, Timeline, PriceCalculator, PaymentModal
    │   ├── context/                  # AuthContext, SocketContext, NotificationContext
    │   ├── pages/                    # Customer & Admin views
    │   ├── utils/                    # Web Audio synth sound alerts & tab title manager
    │   ├── App.jsx                   # Main layout & router
    │   └── main.jsx
    └── index.html
```

---

### 🚀 How to Run the Application

#### 1. Start the Backend Server:
```bash
cd C:\Users\mahes\.gemini\antigravity\scratch\sri-ramu-digital\backend
node server.js
```
The server will run on `http://localhost:5000` with real-time Socket.IO and VAPID Web Push active.

#### 2. Start the Frontend Application:
```bash
cd C:\Users\mahes\.gemini\antigravity\scratch\sri-ramu-digital\frontend
npm run dev
# or: node ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5173
```
Open `http://localhost:5173` in your browser.

---

### 🧪 Pre-configured Credentials

- **Admin Account**:
  - Email: `admin@sriramuprinting.com`
  - Password: `admin123`
- **Customer Account**:
  - Email: `maheswar@gmail.com`
  - Password: `customer123`
*(Use the quick role switcher in the top navigation bar to seamlessly toggle between Customer and Admin views).*
