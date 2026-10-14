# Student Register — MERN Stack Application

A clean, modern, beginner-friendly Full-Stack MERN (MongoDB Atlas, Express.js, React, Node.js) Student Registration and Record Management CRUD application with secure Admin Authentication, responsive UI, search filtering, and standalone Vercel deployment support.

---

## Table of Contents

1. [Project Overview & Folder Structure](#1-project-overview--folder-structure)
2. [Prerequisites](#2-prerequisites)
3. [How to Create a MongoDB Atlas Database & Database User](#3-how-to-create-a-mongodb-atlas-database--database-user)
4. [How to Configure `server/.env`](#4-how-to-configure-serverenv)
5. [How to Generate an Admin Bcrypt Password Hash](#5-how-to-generate-an-admin-bcrypt-password-hash)
6. [How to Run the Backend Locally](#6-how-to-run-the-backend-locally)
7. [How to Run the Frontend Locally](#7-how-to-run-the-frontend-locally)
8. [How to Configure the Frontend API URL](#8-how-to-configure-the-frontend-api-url)
9. [How to Deploy `server/` and `client/` as Separate Vercel Projects](#9-how-to-deploy-server-and-client-as-separate-vercel-projects)
10. [Environment Variables Reference for Vercel](#10-environment-variables-reference-for-vercel)
11. [How to Configure MongoDB Atlas Network Access Securely](#11-how-to-configure-mongodb-atlas-network-access-securely)
12. [How to Test the Application](#12-how-to-test-the-application)
13. [Common Troubleshooting Guide](#13-common-troubleshooting-guide)
14. [Security & Authentication Architecture Notes](#14-security--authentication-architecture-notes)

---

## 1. Project Overview & Folder Structure

This application provides a complete student register for colleges, schools, or training institutes.

### Features
- **Student CRUD**: Create, read (list), update, and delete student records (Name, Class, Roll Number, Address).
- **Unique Roll Number Constraint**: Enforced at both the Mongoose schema layer and controller validation logic with friendly duplicate notices.
- **Instant Search**: Real-time filter across student name, roll number, class, and address.
- **Admin Authentication**: Secure JWT-based admin login using bcrypt password verification. Credentials managed via environment variables (no hardcoded credentials).
- **Protected Routes**: Gated frontend dashboard with automatic redirection and session recovery; backend API endpoints protected via JWT verification middleware.
- **Serverless-Ready**: Mongoose connection pooling and caching optimized for Vercel serverless environments.
- **Responsive Dashboard**: Handcrafted plain CSS with KPI statistic cards, responsive table, modal dialogs, and toast notifications.

### Folder Structure

```
Register/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection with serverless connection caching
│   ├── controllers/
│   │   ├── authController.js     # Admin login and session verification logic
│   │   └── studentController.js  # Student CRUD operations and search logic
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token verification middleware
│   │   └── errorMiddleware.js    # Central error handler (CastError, duplicate key, validation)
│   ├── models/
│   │   └── Student.js            # Mongoose schema for Student records
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/login, /api/auth/me
│   │   └── studentRoutes.js      # /api/students CRUD routes (protected)
│   ├── utils/
│   │   └── generateHash.js       # CLI helper to generate bcrypt password hashes
│   ├── .env.example              # Server environment variable template
│   ├── index.js                  # Express application entrypoint & Vercel export
│   ├── package.json              # Server dependencies & scripts
│   └── vercel.json               # Vercel serverless function configuration
├── client/
│   ├── public/
│   │   └── favicon.svg           # Application favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx             # Success/Error/Warning notification banner
│   │   │   ├── DeleteConfirmModal.jsx # Confirmation dialog before deleting
│   │   │   ├── Navbar.jsx            # Top navbar with user badge and logout button
│   │   │   ├── ProtectedRoute.jsx    # Route guard redirecting unauthenticated users
│   │   │   ├── SearchFilter.jsx      # Search input with clear button
│   │   │   └── StudentFormModal.jsx  # Modal form for adding and editing students
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global auth state, login/logout methods
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx     # Main student registry dashboard with stats
│   │   │   ├── LoginPage.jsx         # Admin login page
│   │   │   └── NotFoundPage.jsx      # 404 Not Found fallback page
│   │   ├── services/
│   │   │   └── api.js                # Central Axios instance with JWT interceptors
│   │   ├── App.jsx                   # React Router routing configuration
│   │   ├── index.css                 # Plain responsive CSS design
│   │   └── main.jsx                  # React 18 DOM mount point
│   ├── .env.example              # Client environment variable template
│   ├── index.html                # Vite HTML template
│   ├── package.json              # Client dependencies & scripts
│   └── vite.config.js            # Vite configuration with local dev proxy
├── .gitignore                    # Git ignore file (node_modules, .env, dist)
└── README.md                     # Comprehensive documentation
```

---

## 2. Prerequisites

Before running or deploying the application, ensure you have:

- **Node.js**: Version 18 or higher (Node 20+ recommended). Check with `node -v`.
- **npm**: Version 9 or higher. Check with `npm -v`.
- **MongoDB Atlas Account**: Free Tier (M0) cluster on [mongodb.com](https://www.mongodb.com/atlas).
- **Vercel Account**: Free account on [vercel.com](https://vercel.com) (for deployment).

---

## 3. How to Create a MongoDB Atlas Database & Database User

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. **Create a Free Cluster**:
   - Click **Create** under Clusters.
   - Choose the **M0 Free** shared cluster tier.
   - Select your preferred cloud provider and region (e.g. AWS / us-east-1).
   - Click **Create Deployment**.
3. **Create Database User Credentials**:
   - Go to **Security** → **Database Access** in the left sidebar.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: e.g. `admin_user`.
   - Password: Click **Autogenerate Secure Password** or enter a password (save this safely!).
   - Built-in Role: **Read and write to any database** (`readWriteAnyDatabase`).
   - Click **Add User**.
4. **Obtain Connection String**:
   - Go to **Deployment** → **Database**.
   - Click **Connect** next to your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string. It resembles:
     ```
     mongodb+srv://admin_user:<db_password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<db_password>` with your database user's password.
   - Append the database name `student_register` before the `?` query string:
     ```
     mongodb+srv://admin_user:YourActualPassword@cluster0.xxxxx.mongodb.net/student_register?retryWrites=true&w=majority
     ```

---

## 4. How to Configure `server/.env`

Inside the `server/` directory, copy `.env.example` to create `.env`:

### PowerShell:
```powershell
Copy-Item server\.env.example server\.env
```

### Windows Command Prompt (CMD):
```cmd
copy server\.env.example server\.env
```

### Server Environment Variables:

```env
# MongoDB Atlas Connection URI
MONGO_URI=mongodb+srv://admin_user:YourActualPassword@cluster0.xxxxx.mongodb.net/student_register?retryWrites=true&w=majority

# JWT Secret Key (Use a long random string in production!)
JWT_SECRET=helloman

# Admin Login Username
ADMIN_USERNAME=admin

# Bcrypt Hash of the Admin Password (see Section 5 below)
ADMIN_PASSWORD_HASH=$2a$10$doDgUO8Dv6tAb0LvgAroQ.QxTqAolM6Ezy29gBt1Z/YYOnMg30wzK

# Allowed frontend URL for CORS (no trailing slash)
CLIENT_URL=http://localhost:5173

# Local server port
PORT=5000
```

> [!WARNING]
> `helloman` is a development-only JWT secret. Before deploying to production, replace it with a cryptographically secure random string (at least 32 characters long).
> Never commit your real `.env` file to Git!

---

## 5. How to Generate an Admin Bcrypt Password Hash

The project includes a built-in CLI utility `server/utils/generateHash.js` to easily generate a secure bcrypt password hash using 10 salt rounds.

### Command:

Navigate to `server` or run from project root:

#### PowerShell / CMD:
```powershell
cd server
node utils/generateHash.js your_secure_password
```

#### Example Output:
```text
--------------------------------------------------
Bcrypt Password Hash Generator
--------------------------------------------------
Hashing password: "your_secure_password"

Generated Hash:
$2a$10$7d3tU9sXGkM1sO28kYyN6uX5tQ...

Add this to your server/.env or Vercel environment variables:
ADMIN_PASSWORD_HASH=$2a$10$7d3tU9sXGkM1sO28kYyN6uX5tQ...
--------------------------------------------------
```

Copy the generated hash and set it as `ADMIN_PASSWORD_HASH` in `server/.env`.

> [!NOTE]
> The pre-configured default development credentials are:
> - **Username**: `admin`
> - **Password**: `admin123`
> (Bcrypt hash: `$2a$10$doDgUO8Dv6tAb0LvgAroQ.QxTqAolM6Ezy29gBt1Z/YYOnMg30wzK`)

---

## 6. How to Run the Backend Locally

1. Open a terminal in `server/`:
   ```powershell
   cd d:\Allvsfiles\Register\server
   ```
2. Install dependencies (if not already done):
   ```powershell
   npm install
   ```
3. Start the server:
   ```powershell
   npm start
   ```
   Or run in live-reload watch mode (Node.js 18+):
   ```powershell
   npm run dev
   ```
4. You should see:
   ```text
   [Server] Student Register backend running on http://localhost:5000
   [MongoDB] Connected to database: student_register
   ```
5. Test server health in a browser or terminal:
   - URL: `http://localhost:5000/api/health`
   - Response: `{"status":"ok","service":"student-register-api","uptime":...}`

---

## 7. How to Run the Frontend Locally

1. Open a second terminal in `client/`:
   ```powershell
   cd d:\Allvsfiles\Register\client
   ```
2. Install dependencies (if not already done):
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
4. Vite will display:
   ```text
   VITE v6.x.x  ready in 200 ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```
5. Open your browser and navigate to `http://localhost:5173`.
6. You will be redirected to `/login`. Sign in using:
   - **Username**: `admin`
   - **Password**: `admin123`

---

## 8. How to Configure the Frontend API URL

The frontend communicates with the backend via a centralized Axios instance configured in [`client/src/services/api.js`](file:///d:/Allvsfiles/Register/client/src/services/api.js).

### Configuration via `client/.env`:

Create or verify `client/.env`:

```env
# Local Development:
VITE_API_URL=http://localhost:5000
```

When building for production on Vercel, this variable will be set in the Vercel dashboard:
```env
VITE_API_URL=https://your-backend-project.vercel.app
```

> [!IMPORTANT]
> In Vite, all environment variables prefixed with `VITE_` are publicly embedded into the client-side JavaScript bundle during compilation (`npm run build`).
> **Never put private keys, MongoDB URIs, or password hashes into `client/.env`!**

---

## 9. How to Deploy `server/` and `client/` as Separate Vercel Projects

Deploying the backend and frontend as two distinct Vercel projects provides isolation, clear logging, and independent scaling.

### Step 9.1: Deploy the Backend (`server/`)

1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New** → **Project**.
3. Import your Git repository.
4. Set **Root Directory** to `server`.
5. Framework Preset: **Other**.
6. Build and Output Settings: Leave as default (no build command needed; `vercel.json` instructs Vercel to route requests to `index.js`).
7. Expand **Environment Variables** and add:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string (e.g. 32+ characters).
   - `ADMIN_USERNAME`: `admin` (or custom admin username).
   - `ADMIN_PASSWORD_HASH`: Your bcrypt hash generated in Step 5.
   - `CLIENT_URL`: Temporary placeholder (e.g. `http://localhost:5173`), which you will update in Step 9.3 once frontend is deployed.
8. Click **Deploy**.
9. Once deployed, copy your backend URL (e.g. `https://student-register-api.vercel.app`).
10. Test `https://student-register-api.vercel.app/api/health` in your browser.

### Step 9.2: Deploy the Frontend (`client/`)

1. In the Vercel Dashboard, click **Add New** → **Project**.
2. Import the **same** Git repository.
3. Set **Root Directory** to `client`.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build` (default).
6. Output Directory: `dist` (default).
7. Expand **Environment Variables** and add:
   - `VITE_API_URL`: The deployed backend URL from Step 9.1 (e.g. `https://student-register-api.vercel.app`, no trailing slash).
8. Click **Deploy**.
9. Once deployed, copy your frontend URL (e.g. `https://student-register-client.vercel.app`).

### Step 9.3: Link CORS between Backend and Frontend

1. Go back to your **Backend Project** in Vercel.
2. Navigate to **Settings** → **Environment Variables**.
3. Edit `CLIENT_URL` and set its value to your deployed frontend URL:
   ```
   CLIENT_URL=https://student-register-client.vercel.app
   ```
4. Go to **Deployments** tab on the backend project and click **Redeploy** to apply the updated `CLIENT_URL`.

---

## 10. Environment Variables Reference for Vercel

| Project | Variable Name | Purpose | Example Value | Public? |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** (`server`) | `MONGO_URI` | MongoDB Atlas Connection string | `mongodb+srv://...` | **No** (Secret) |
| **Backend** (`server`) | `JWT_SECRET` | Secret key used to sign & verify JWT tokens | `k9#mP$2vL@8xZ...` | **No** (Secret) |
| **Backend** (`server`) | `ADMIN_USERNAME` | Username for dashboard login | `admin` | **No** (Internal) |
| **Backend** (`server`) | `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password | `$2a$10$...` | **No** (Secret) |
| **Backend** (`server`) | `CLIENT_URL` | Allowed frontend origin for CORS | `https://your-app.vercel.app` | **No** (Internal) |
| **Frontend** (`client`) | `VITE_API_URL` | Base URL of deployed backend | `https://your-api.vercel.app` | **Yes** (Client bundle) |

---

## 11. How to Configure MongoDB Atlas Network Access Securely

In serverless platforms like Vercel, serverless function invocations originate from dynamic, rotating IP pools.

### Recommended Configuration:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/).
2. In the left navigation, under **Security**, click **Network Access**.
3. Click **Add IP Address**.
4. Choose **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Set Comment to: `Vercel Serverless Production`.
6. Click **Confirm**.

> [!NOTE]
> Setting `0.0.0.0/0` allows connections from serverless IPs worldwide. Because your database is strictly protected by username/password authentication with SHA-256 SCRAM and TLS encryption, allowing `0.0.0.0/0` is the standard, documented approach for serverless deployments on MongoDB Atlas.

---

## 12. How to Test the Application

### API Endpoints Overview

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System uptime & database connection status |
| `POST` | `/api/auth/login` | Public | Authenticate admin & issue JWT token |
| `GET` | `/api/auth/me` | Protected (JWT) | Verify active session & return admin user |
| `GET` | `/api/students` | Protected (JWT) | List students (supports `?search=term`) |
| `GET` | `/api/students/:id` | Protected (JWT) | Get single student details |
| `POST` | `/api/students` | Protected (JWT) | Register a new student record |
| `PUT` | `/api/students/:id` | Protected (JWT) | Update existing student record |
| `DELETE`| `/api/students/:id` | Protected (JWT) | Delete student record |

### Testing with PowerShell:

#### 1. Test Health Endpoint:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
```

#### 2. Test Admin Login:
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'

$token = $response.token
Write-Host "JWT Token received: $token"
```

#### 3. Test Create Student (Protected):
```powershell
$body = @{
  name = "John Doe"
  studentClass = "10th-A"
  rollNumber = "101"
  address = "123 College St"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/students" `
  -Method Post `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

#### 4. Test Fetch Students with Search:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/students?search=John" `
  -Method Get `
  -Headers @{ Authorization = "Bearer $token" }
```

---

## 13. Common Troubleshooting Guide

### 1. CORS Errors (`Cross-Origin Request Blocked`)
- **Symptom**: Browser console shows `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`.
- **Fix**:
  1. Check `CLIENT_URL` in `server/.env` or Vercel backend environment variables.
  2. Ensure it does **not** contain a trailing slash (e.g. use `https://my-app.vercel.app`, NOT `https://my-app.vercel.app/`).
  3. Ensure protocol matches (`https://` in production, `http://` in local development).
  4. Redeploy the backend after changing environment variables.

### 2. MongoDB Atlas Connection Errors (`querySrv ENOTFOUND` or `MongooseServerSelectionError`)
- **Symptom**: `Failed to connect to MongoDB Atlas` or `Server selection timed out`.
- **Fix**:
  1. Ensure your IP is whitelisted in Atlas (**Network Access** → `0.0.0.0/0`).
  2. Verify your database username and password in `MONGO_URI`. If your password has special characters like `@`, `#`, or `/`, URL-encode them (e.g. `@` becomes `%40`).
  3. Ensure your connection string includes a database name after the domain: `...mongodb.net/student_register?retryWrites=...`.

### 3. Duplicate Roll Number Errors (`400 Bad Request`)
- **Symptom**: `A student with Roll Number "..." already exists.`
- **Fix**: Roll numbers must be unique across all students. Enter a different roll number or update the existing student.

### 4. 404 Routes on Vercel Backend
- **Symptom**: Requests to `/api/...` return Vercel 404.
- **Fix**: Verify `server/vercel.json` is present and routes all requests (`/(.*)`) to `index.js`. Ensure the backend root directory in Vercel is set to `server`.

### 5. Failed Admin Login (`401 Invalid username or password`)
- **Symptom**: Login fails even with correct credentials.
- **Fix**:
  1. Run `node utils/generateHash.js your_password` inside `server/`.
  2. Copy the resulting hash to `ADMIN_PASSWORD_HASH` in `.env`.
  3. Restart the backend server.
  4. Ensure `ADMIN_USERNAME` in `.env` matches what you typed in the login form.

---

## 14. Security & Authentication Architecture Notes

### JWT Storage & Trade-Offs:
In this learning application, the JWT token is stored in the browser's `localStorage` for accessibility and straightforward client-side state handling.

**Trade-offs to understand:**
- **`localStorage`**:
  - *Pros*: Simple to implement; works across cross-origin backends (e.g. different Vercel domains) without complex cookie/CORS domain setup; accessible in client JavaScript.
  - *Cons*: Vulnerable to Cross-Site Scripting (XSS) attacks if malicious script injection is possible.
- **`httpOnly` Cookies** (Recommended for large-scale enterprise production):
  - *Pros*: Inaccessible to JavaScript, neutralizing XSS token theft.
  - *Cons*: Vulnerable to Cross-Site Request Forgery (CSRF) unless paired with CSRF tokens or `SameSite=Strict`; requires shared apex domain or complex reverse-proxy routing when backend and frontend are hosted on separate domains.

### Serverless Connection Reuse:
In [`server/config/db.js`](file:///d:/Allvsfiles/Register/server/config/db.js), MongoDB connections are cached in Node's global object (`global.mongoose`). In serverless environments like Vercel, warm lambdas reuse the established connection pool, preventing connection exhaustion and drastically reducing cold start latency.
