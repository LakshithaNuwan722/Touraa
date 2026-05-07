# 🚗 Touraa - Tour Management & Car Rental System

Touraa is a professional, full-stack tour management and car rental system. It provides an end-to-end solution for car rental businesses, featuring a robust FastAPI backend and a modern, responsive React frontend. The system is designed to handle everything from vehicle management and booking processing to an administrative dashboard for real-time monitoring and control.

---

## ✨ Key Features

- **Admin Dashboard**: Real-time stats and control panel for bookings, vehicles, and gallery management.
- **Vehicle Management**: Full CRUD operations for vehicle fleet, including pricing and features.
- **Advanced Booking System**: Supports both point-to-point transfers and multi-day tour rentals with automated cost calculation.
- **Dynamic Tour Packages**: Manage and showcase curated tour packages with highlights and destination details.
- **Image Gallery & Uploads**: Integrated gallery system with administrative image upload capabilities.
- **Secure Authentication**: JWT-based secure login for both users and administrators.
- **Interactive Map Integration**: Location-based distance calculation using coordinates (simulated/haversine).
- **Unified System Launcher**: Simplified one-click start for the entire development environment.

---

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python 3.10+), Motor (Async MongoDB Driver)
- **Frontend**: React 18, Tailwind CSS, Shadcn/UI, Lucide Icons
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing
- **Styling**: Tailwind CSS for responsive and modern UI

---

## 📂 Project Structure

```text
.
├── backend/                # FastAPI application
│   ├── server.py           # Main API logic and route definitions
│   ├── database.py         # Database connection and model schemas
│   ├── uploads/            # Directory for uploaded vehicle and gallery images
│   └── .env                # Backend configuration (DB URL, JWT Secret)
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components (Shared/Layout/Common)
│   │   ├── pages/          # Individual screen components (Admin/Public)
│   │   ├── context/        # React Context for Auth and Global State
│   │   └── services/       # API service layers
│   └── tailwind.config.js  # Styling configuration
├── launcher.py             # Cross-platform application launcher
├── run.bat                 # Windows-specific startup script
└── seed_admin.py           # Script to initialize administrative users
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: User/Admin login
- `POST /api/admin/login`: Dedicated admin login
- `GET /api/auth/me`: Get current authenticated user details

### Cars
- `GET /api/cars`: List all available vehicles
- `GET /api/cars/{id}`: Get details of a specific vehicle
- `POST /api/admin/cars`: Add a new vehicle (Admin only)
- `PUT /api/admin/cars/{id}`: Update vehicle details (Admin only)
- `DELETE /api/admin/cars/{id}`: Remove a vehicle (Admin only)

### Bookings
- `POST /api/bookings`: Create a new reservation
- `GET /api/bookings/user`: Get bookings for the authenticated user
- `GET /api/admin/bookings`: List all system bookings (Admin only)
- `PUT /api/admin/bookings/{id}/status`: Update booking status (Admin only)
- `DELETE /api/admin/bookings/{id}`: Remove a booking (Admin only)

### Packages & Gallery
- `GET /api/packages`: List all tour packages
- `GET /api/galleries`: List all gallery albums
- `POST /api/admin/packages`: Create tour package (Admin only)
- `POST /api/admin/galleries`: Create gallery album (Admin only)
- `POST /api/upload`: Upload image files (Admin only)

### Administrative Stats
- `GET /api/admin/stats`: Fetch dashboard KPIs and recent activity (Admin only)

