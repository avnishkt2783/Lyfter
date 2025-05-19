# 🚗 Lyfter

A full-stack ride-sharing platform that allows users to request and offer rides, with real-time maps, light/dark mode, and secure authentication.

---

## ✅ Project Tasks

### 🔧 Work in progress...

- [ ] Merge all Codes - (isVerified Badge, OfferRide Dropdown of your vehicles, vehicle information.).
- [ ] Landing Page & About Page.
- [ ] Page reload checking for newly added pages.
- [ ] Reverse Lyfter Logic
- [ ] Regex For all pages. any element. deep search.
- [ ] Clean Code & Deploy
- [ ] Report + PPT + Video PPT
- [ ] Favicon for LYFTER, remove VITE logo.
- [ ] LYFTER per alphabet vehicle symbol. (stylised banner for marketing)

---

### ☑️ Completed tasks
- [x] Admin panel for driver verification and system management.
- [x] Driver UI and functionality.
- [x] Ride booking system.
- [x] Consistent UI & UX Building.
- [x] Forgot password functionality and OTP Verification through email. DRIVER VERIFICATION PENDING, onSuccess -> MAIL REPLY.
- [x] Automatically delete old image when a new profile image is uploaded. (Cloudinary Implemented)
- [x] Matching Logic: map path matching, subset testing, distance comparison.
- [x] Addition of Auto marking of location route in Google Maps.
- [x] Google Maps Extra buttons removal.
- [x] Google Maps light and dark theme toggle.
- [x] On dashboard, create two buttons for **Request a Ride** and **Offer a Ride** and add functionality.
- [x] Store the theme of user and show appropriate theme on load.
- [x] Google Maps bug (multiple clicks on "select on map" creates duplicate pins) FIX.
- [x] Hamburger Closed Right Alignment, and Light-Dark toggle position fix.
- [x] Google Maps: Remove `alert('something')`.

---

### ⏳ Work currently dropped
- [x] Rating and review system.
- [x] Live tracking of rides.
- [x] Notifications and messaging between driver and passenger.
- [x] Payment integration.

---
📁 **Project Directory Structure**
```
Lyfter/
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
│   │   │   ├── driverRide.js   
│   │   │   └── passengerRide.js
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
│   │   │   ├── MatchingRides.jsx
│   │   │   ├── Navbar.jsx / Navbar.css
│   │   │   ├── OfferRideDetails.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── RequestRideDetails.jsx
│   │   │   ├── ThemeToggle.jsx / ThemeToggle.css
│   │   └── utils/                  # Contexts and global logic
│   │       ├── App.jsx / App.css
│   │       ├── AuthContext.jsx
│   │       ├── index.css
│   │       ├── main.jsx
│   │       └── ThemeContext.jsx
│   ├── .env
│   ├── index.html                  # Root HTML
│   ├── package.json
│   ├── README.md
│   └── vite.config.js              # Vite bundler config
└── README.md                       # This file
```
---

## ⚙️ Technologies Used { UPDATE REQUIRED }

- **Frontend:** React, Vite, Bootstrap, React Router
- **Backend:** Node.js, Express, Sequelize, JWT
- **Database:** MySQL / PostgreSQL (via Sequelize)
- **Maps:** Google Maps JavaScript API
- **Cloud Services:** [To be integrated — image hosting, payments, etc.]

---
| Name               | GitHub                                                                                                                                              | LinkedIn                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Arobh Kumar**    | [![GitHub](https://img.shields.io/badge/@Arobh-181717?style=for-the-badge\&logo=github\&logoColor=white)](https://github.com/Arobh)                 | [![LinkedIn](https://img.shields.io/badge/arobh-0A66C2?style=for-the-badge\&logo=linkedin\&logoColor=white)](https://linkedin.com/in/arobh)                    |
| **Avnish Kumar**   | [![GitHub](https://img.shields.io/badge/@avnishkt2783-181717?style=for-the-badge\&logo=github\&logoColor=white)](https://github.com/avnishkt2783)   | [![LinkedIn](https://img.shields.io/badge/avnishkt2783-0A66C2?style=for-the-badge\&logo=linkedin\&logoColor=white)](https://linkedin.com/in/avnishkt2783)      |
| **Simran Sahiwal** | [![GitHub](https://img.shields.io/badge/@simransahiwal-181717?style=for-the-badge\&logo=github\&logoColor=white)](https://github.com/simransahiwal) | [![LinkedIn](https://img.shields.io/badge/simran--sahiwal-0A66C2?style=for-the-badge\&logo=linkedin\&logoColor=white)](https://linkedin.com/in/simran-sahiwal) |

---