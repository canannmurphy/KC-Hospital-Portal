# KC-Hospital-Portal-short-description
A lightweight hospital portal with real-time patient updates, batch management, and a modular C++ backend using Crow.


# KC Hospital Portal-long-description
The **KC Hospital Portal** is a streamlined and efficient web-based system for managing patients in a hospital or clinic setting. This project combines a clean, responsive frontend with a modular C++ backend powered by the **Crow** framework, enabling real-time interaction and fast data handling.

## 🔍 Overview
KC Hospital Portal was built to simulate the core functionality of a patient coordination tool. Coordinators can track and manage patient records in batches, observe real-time updates, and interact with a responsive user interface designed to handle frequent and fast-changing data.

## ⚙️ Features
- **Real-time updates** using WebSockets to sync patient data without page reloads.
- **Batch cycling system** that allows coordinators to navigate through different groups of patients.
- **Dynamic form validation** for patient input fields, including constraints like SSN formatting.
- **Responsive frontend** using vanilla JavaScript for smooth, interactive behavior.
- **Authentication middleware** to protect sensitive routes.
- **CSV-based backend logic** for simulating patient record storage and retrieval.

## 🧱 Tech Stack
- **Backend**: C++ with the [Crow](https://github.com/CrowCpp/Crow) web framework
- **Frontend**: HTML, CSS, JavaScript (no frameworks)
- **Real-time Communication**: WebSockets
- **Data Handling**: Static CSV files, manually parsed

## 📂 Project Structure

```
KC-Hospital-Portal/
├── KCHospital-Backend/
│   ├── clinic/                  # Clinic-related logic
│   ├── data/                    # Static CSV files and seed data
│   ├── middlewares/            # Authentication and utility middleware
│   ├── reports/                # Report generation or tracking
│   ├── routes/                 # API route handlers
│   ├── utils/                  # Utility functions
│   ├── coordinators.h          # Header for coordinator data
│   ├── main.cpp                # Entry point of the backend app
│   ├── server.h                # Server configuration
│   └── websocketRegistry.h     # WebSocket management
│
├── KCHospital-Frontend/
│   ├── src/                    # Frontend logic, modular JS
│   ├── index.html              # Main HTML entry point
│   ├── portal.html             # Alternate or internal portal UI
│   ├── index.js                # JS controlling frontend behavior
│   ├── package.json            # Project dependencies
│   ├── vite.config.js          # Vite config for frontend dev server
│   └── node_modules/           # Installed packages
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- C++17 compatible compiler
- Crow (header-only library)
- Web browser

### Build & Run
1. Clone the repository
2. Build the backend using your preferred C++ build system
3. Run the server and open `index.html` from the `public/` folder

## 🧪 Future Plans
- Add persistent database support (e.g., SQLite or PostgreSQL)
- Refactor frontend using a modern JS framework (preferably react)
- Publish live for public demo access and include deployment instructions

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
