# 📚 LibraryOS — Full-Stack Library Management System

A professional, SaaS-ready Library Management System built with a modern stack. It features role-based access control, a real-time catalog, automated email reminders, and a comprehensive dashboard.

## 🚀 Key Features

-   **Authentication & Security**: JWT-based auth in HttpOnly cookies, password encryption with Bcrypt, and "Forgot Password" flow.
-   **Catalog System**: Fast search-as-you-type, 30+ pre-seeded books, and role-based actions (Issue/Manage).
-   **Reminder System**: 
    -   **Manual**: Admins can send return reminders with a single click (bell icon).
    -   **Automatic**: A daily cron job (8 AM) sends notifications to users whose books are due in 2 days.
-   **Dark Mode**: Full dark/light theme support using Tailwind CSS.
-   **Responsive Design**: Mobile-first UI that works on all devices.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS, Lucide-React, Axios.
-   **Backend**: Node.js, Express, Nodemailer, Node-Cron, Joi.
-   **Database**: MongoDB (Mongoose).

## 📂 Project Structure

-   `frontend/`: React frontend (Vite)
-   `backend/`: Node.js/Express API
-   `brain/`: Project status and implementation artifacts (task list, walkthrough, etc.)

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js installed
- MongoDB running locally or on Atlas

### 2. Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` from the template provided in the walkthrough.
4. `npm run dev`

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### 4. Admin Setup
- Register an account.
- Manually change your role to `admin` in the MongoDB `users` collection to gain full control.

## 🛡️ Security Note
The `.env` file and `node_modules` are ignored via `.gitignore` to keep your API keys and credentials secure.
