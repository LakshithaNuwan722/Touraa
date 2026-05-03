<div align="center">

# 🚗 Touraa - Car Rental Management System

**A complete and feature-rich car rental management system built with a modern tech stack.**

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

</div>

Touraa is a full-stack application designed to streamline the process of managing a car rental business. It features a powerful FastAPI backend for robust data management and a responsive React frontend for an intuitive user experience.

---

## ✨ Features

- **Admin Dashboard**: Centralized control panel for managing bookings, vehicles, and site content.
- **Vehicle Management**: Easily add, update, and remove cars from your fleet.
- **Booking System**: A simple and efficient booking process for customers.
- **Dynamic Packages**: Create and manage rental packages.
- **Image Gallery**: Showcase your fleet with a beautiful gallery.
- **User Authentication**: Secure login for administrators.
- **Unified Launcher**: A simple one-click launcher to start the entire system.

---

## 🛠️ Tech Stack

| Area      | Technology                                                              |
| --------- | ----------------------------------------------------------------------- |
| **Backend**   | [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org/) |
| **Frontend**  | [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| **Database**  | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |

---

## 🚀 Getting Started

### Prerequisites


- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 16+](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/downloads)

### Quick Start (Recommended)

The easiest way to get the system up and running.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/Car-Rental-Management-System-main.git
    cd Car-Rental-Management-System-main
    ```
2.  **Run the launcher:**
    -   On Windows, double-click `run.bat`.
    -   On macOS/Linux, run `python launcher.py`.
3.  Click the **🚀 START SYSTEM** button in the launcher window.

The launcher will automatically install all dependencies, set up the database, and start both the backend and frontend servers.

### Manual Setup

For developers who prefer to run the services separately.

#### Backend (FastAPI)

1.  **Navigate to the backend directory:**
    ```sh
    cd backend
    ```
2.  **Create a virtual environment and activate it:**
    ```sh
    python -m venv venv
    # On Windows
    venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```
3.  **Install dependencies:**
    ```sh
    pip install -r requirements.txt
    ```
4.  **Run the server:**
    ```sh
    uvicorn server:app --reload
    ```
    The backend will be available at `http://127.0.0.1:8000`.

#### Frontend (React)

1.  **Navigate to the frontend directory:**
    ```sh
    cd frontend
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Run the development server:**
    ```sh
    npm start
    ```
    The frontend will open automatically at `http://localhost:3000`.

---

## 🔑 Default Credentials

-   **Admin Email**: `admin@touraa.com`
-   **Admin Password**: `touraa_admin`

You can access the admin dashboard by navigating to the login page.

---

## ⚙️ Configuration

-   **Database**: The database connection can be configured in the `backend/.env` file. By default, it uses a local MongoDB Atlas database.
-   **API Port**: The backend port can be changed in `run.bat` or by modifying the `uvicorn` command.
-   **Frontend Port**: The frontend port can be changed in the `frontend/package.json` file.

---

## 📂 Project Structure

```
.
├── backend/         # FastAPI application
│   ├── server.py    # Main API logic
│   ├── database.py  # Database setup and models
│   └── ...
├── frontend/        # React application
│   ├── src/
│   │   ├── pages/   # Page components
│   │   ├── components/ # Reusable UI components
│   │   └── App.js   # Main app component
│   └── ...
├── launcher.py      # Main application launcher script
├── run.bat          # Windows launcher script
└── README.md
```

---

## 🚀 Deploy to GitHub

Follow these steps to push your project to a new GitHub repository.

1.  **Initialize a local Git repository:**
    Open your terminal, navigate to the project's root directory, and run:
    ```sh
    git init -b main
    ```

2.  **Add all files to the staging area:**
    ```sh
    git add .
    ```

3.  **Commit your files:**
    ```sh
    git commit -m "Initial commit: Add car rental management system"
    ```

4.  **Create a new repository on GitHub:**
    -   Go to [GitHub](https://github.com) and log in.
    -   Click the **+** icon in the top-right corner and select **New repository**.
    -   Give your repository a name (e.g., `car-rental-system`).
    -   Choose whether you want it to be public or private.
    -   Click **Create repository**.

5.  **Link your local repository to the remote one on GitHub:**
    Copy the command provided by GitHub under the "...or push an existing repository from the command line" section. It will look like this:
    ```sh
    git remote add origin https://github.com/your-username/your-repository-name.git
    ```
    Replace `your-username` and `your-repository-name` with your actual GitHub username and repository name.

6.  **Push your code to GitHub:**
    ```sh
    git push -u origin main
    ```
    This will upload your project to the GitHub repository. Now, your project is live on GitHub!


## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
