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

## 📁 Project Directory Structure

Lyfter/
│
├── backend/ # Backend (Node.js + Express + Sequelize)
│ ├── config/ # Database configuration
│ │ └── db.js
│ ├── controllers/ # Route handler logic
│ │ ├── rideController.js
│ │ └── userController.js
│ ├── middleware/ # Express middleware
│ │ ├── authenticate.js
│ │ └── upload.js
│ ├── models/ # Sequelize models organized by domain
│ │ ├── auth/
│ │ │ └── auth.js
│ │ ├── driver/
│ │ │ └── driver.js
│ │ ├── passenger/
│ │ │ └── passenger.js
│ │ ├── ride/
│ │ │ └── ride.js
│ │ └── user/
│ │ └── user.js
│ ├── routes/ # Route declarations
│ │ ├── rideRoutes.js
│ │ └── userRoutes.js
│ ├── .env # Environment configuration
│ ├── package.json
│ └── server.js # Entry point of the backend app
│
├── frontend/ # Frontend (React + Vite)
│ ├── src/
│ │ ├── assets/ # Static images/assets
│ │ ├── components/ # Reusable React components
│ │ │ ├── Dashboard.jsx
│ │ │ ├── Footer.jsx / Footer.css
│ │ │ ├── GoogleMapView.jsx
│ │ │ ├── Landing.jsx
│ │ │ ├── Login.jsx / LogoutButton.jsx / Register.jsx
│ │ │ ├── Navbar.jsx / Navbar.css
│ │ │ ├── Profile.jsx
│ │ │ ├── RideDetails.jsx
│ │ │ ├── ThemeToggle.jsx / ThemeToggle.css
│ │ ├── utils/ # Contexts and app-level logic
│ │ │ ├── App.jsx / App.css
│ │ │ ├── index.css
│ │ │ ├── main.jsx
│ │ │ ├── AuthContext.jsx
│ │ │ └── ThemeContext.jsx
│ ├── index.html # Root HTML template
│ ├── .env # Environment configuration
│ ├── package.json
│ ├── README.md # Vite + React Readme
│ └── vite.config.js # Vite bundler config
└── readme.md # this is what you are reading now.

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


