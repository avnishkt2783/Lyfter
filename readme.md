# 🚗 Lyfter

A full-stack ride-sharing platform that allows users to request and offer rides, with real-time maps, light/dark mode, and secure authentication.

---

## ✅ Project Tasks {COMPLETED}

### 🔧 Work in progress...

- [ ] Clean Code & Deploy
- [ ] Report + PPT + Video PPT

---

### ☑️ Completed tasks
- [x] Favicon for LYFTER, remove VITE logo.
- [x] LYFTER per alphabet vehicle symbol. (stylised banner for marketing)
- [x] Check Group for ERRORS and BUGS provided by our Expert Testers.
- [x] Landing Page & About Page.
- [x] Regex For all pages. any element. deep search.
- [x] Admin Manage page to manage admins. static superuser or based on some otp login.
- [x] loading animation for better UI/UX wherever required.
- [x] BUG: Start End Address of Passenger/Driver - Addresses on yourRequestedRides.
- [x] BUG: Profile Page - Missing Gender Info, Role Badge ??
- [x] BUG: token expired error when logout or backend delete. something like that.
- [x] BUG: Reverse Lyfter Logic - Number of seats is not filtered in backend logic.
- [x] Reverse Lyfter Logic
- [x] making code work and seamlessly for the codes we want to do. 
- [x] CSS and BS, pathing for all codes from arobh and simran. 
- [x] Page reload checking for newly added pages.
- [x] Merge all Codes - (isVerified Badge, OfferRide Dropdown of your vehicles, vehicle information.).
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
│   │   ├── adminController.js
│   │   ├── driverController.js
│   │   ├── statsController.js
│   │   └── vehicleController.js
│   ├── middleware/
│   │   ├── authenticate.js         # Auth middleware
│   │   └── upload.js               # Image upload handler
│   │   ├── isAdmin.js
│   ├── models/                     # Sequelize models (by domain)
│   │   ├── auth/
│   │   │   └── auth.js
│   │   ├── driver/
│   │   │   └── driver.js
│   │   │   └── vehicle.js
│   │   ├── OTPVerification/
│   │   │   └── OTPVerification.js
│   │   ├── passenger/
│   │   │   └── passenger.js
│   │   ├── ride/
│   │   │   ├── driverRide.js   
│   │   │   └── passengerRide.js
│   │   │   └── passengerRideDriverRide.js
│   │   └── user/
│   │       └── user.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── rideRoutes.js
│   │   ├── stats.js
│   │   ├── userRoutes.js
│   │   └── vehicleRoutes.js
│   ├── utils/
│   │   ├── ensureAdmin.js
│   │   └── sendMail.js
│   ├── .env                        # Environment variables
│   ├── package.json
│   └── server.js                   # Entry point for backend
├── frontend/                       # Frontend (React + Vite)
│   ├── public/
│   │   ├── arobh.jpg
│   │   ├── avnish.jpg
│   │   ├── carpool_waze.gif
│   │   ├── default.jpg
│   │   ├── Lyfter_Banner_1.png
│   │   ├── Lyfter_Banner_2.png
│   │   ├── Lyfter_Banner_3.png
│   │   ├── lyfter_favicon_black.png
│   │   ├── lyfter_favicon_white.png
│   │   ├── lyfter_text.svg
│   │   ├── lyfter_text_black.png
│   │   ├── lyfter_text_white.png
│   │   └── simran.jpg
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── AadhaarDriversList.jsx
│   │   │   ├── About.css
│   │   │   ├── About.jsx
│   │   │   ├── AddVehicleForm.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BecomeDriverForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DriverPage.jsx
│   │   │   ├── Footer.css
│   │   │   ├── Footer.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── GoogleMapView.jsx
│   │   │   ├── Landing.css
│   │   │   ├── Landing.jsx
│   │   │   ├── LandingStats.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── LogoutButton.jsx
│   │   │   ├── ManageAdmins.jsx
│   │   │   ├── MatchingRides.jsx
│   │   │   ├── Navbar.css
│   │   │   ├── Navbar.jsx
│   │   │   ├── OfferRideDetails.jsx
│   │   │   ├── PendingDriversList.css
│   │   │   ├── PendingDriversList.jsx
│   │   │   ├── Profile.css
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── RequestRideDetails.jsx
│   │   │   ├── ThemeToggle.css
│   │   │   ├── ThemeToggle.jsx
│   │   │   ├── YourOfferedRides.css
│   │   │   ├── YourOfferedRides.jsx
│   │   │   └── YourRequestedRides.jsx
│   │   ├── utils/
│   │   │   ├── MapStyles.jsx
│   │   │   ├── Regex.jsx
│   │   │   └── RequireAuth.jsx
│   │   ├── AdminRoute.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── AuthContext.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── ThemeContext.jsx
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
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