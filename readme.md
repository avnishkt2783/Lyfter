# 🚗 Lyfter

A full-stack ride-sharing platform that allows users to request and offer rides, with real-time maps, light/dark mode, and secure authentication.

---

## ✅ Project Tasks

### 🔧 Work in progress...

- [ ] Google Maps Extra buttons removal.
- [ ] Google Maps light and dark theme toggle.
- [ ] On dashboard, create two buttons for **Request a Ride** and **Offer a Ride** and add functionality.
- [ ] Matching Logic: map path matching, subset testing, distance comparison.
- [ ] Driver UI and functionality.
- [ ] Ride booking system.
- [ ] Notifications and messaging between driver and passenger.
- [ ] Live tracking of rides.
- [ ] Payment integration.
- [ ] Rating and review system.

---

### ⏳ Work to be done *later*

- [ ] Admin panel for driver verification and system management.
- [ ] Forgot password functionality.
- [ ] Automatically delete old image when a new profile image is uploaded.

---

### ☑️ Completed tasks
- [x] Store the theme of user and show appropriate theme on load.
- [x] Google Maps bug (multiple clicks on "select on map" creates duplicate pins) FIX.
- [x] Hamburger Closed Right Alignment, and Light-Dark toggle position fix.
- [x] Google Maps: Remove `alert('something')`.

---

📁 **Project Directory Structure**

`Lyfter/
├── backend/                        # Backend (Node.js + Express + Sequelize)
│   ├── config/
│   │   └── db.js                   # Database configuration
│   ├── controllers/
│   │   ├── rideController.js       # Ride-related logic
│   │   └── userController.js       # User-related logic
│   ├── middleware/
│   │   ├── authenticate.js         # Auth middleware
│   │   └── upload.js               # Image upload handler
│   ├── models/                     # Sequelize models (by domain)
│   │   ├── auth/
│   │   │   └── auth.js
│   │   ├── driver/
│   │   │   └── driver.js
│   │   ├── passenger/
│   │   │   └── passenger.js
│   │   ├── ride/
│   │   │   └── ride.js
│   │   └── user/
│   │       └── user.js
│   ├── routes/
│   │   ├── rideRoutes.js
│   │   └── userRoutes.js
│   ├── .env                        # Environment variables
│   ├── package.json
│   └── server.js                   # Entry point for backend
├── frontend/                       # Frontend (React + Vite)
│   ├── src/
│   │   ├── assets/                 # Static assets
│   │   ├── components/             # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Footer.jsx / Footer.css
│   │   │   ├── GoogleMapView.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx / LogoutButton.jsx / Register.jsx
│   │   │   ├── Navbar.jsx / Navbar.css
│   │   │   ├── Profile.jsx
│   │   │   ├── RideDetails.jsx
│   │   │   ├── ThemeToggle.jsx / ThemeToggle.css
│   │   ├── utils/                  # Contexts and global logic
│   │   │   ├── App.jsx / App.css
│   │   │   ├── index.css
│   │   │   ├── main.jsx
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   ├── index.html                  # Root HTML
│   ├── .env
│   ├── package.json
│   ├── README.md
│   └── vite.config.js              # Vite bundler config
└── README.md                       # This file`


---

## ⚙️ Technologies Used

- **Frontend:** React, Vite, Bootstrap, React Router
- **Backend:** Node.js, Express, Sequelize, JWT
- **Database:** MySQL / PostgreSQL (via Sequelize)
- **Maps:** Google Maps JavaScript API
- **Cloud Services:** [To be integrated — image hosting, payments, etc.]

---
### 👥 Project Partners

Meet the amazing team behind **Lyfter**:

| Name           | GitHub                                         | LinkedIn                                                   |
|----------------|------------------------------------------------|------------------------------------------------------------|
| Arobh Kumar    | [@Arobh](https://github.com/Arobh)             | [linkedin.com/in/arobh](https://linkedin.com/in/arobh)     |
| Avnish Kumar   | [@avnishkt2783](https://github.com/avnishkt2783) | [linkedin.com/in/avnishkt2783](https://linkedin.com/in/avnishkt2783) |
| Simran Sahiwal | [@simransahiwal](https://github.com/simransahiwal) | [linkedin.com/in/simran-sahiwal](https://linkedin.com/in/simran-sahiwal) |


