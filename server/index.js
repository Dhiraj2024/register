const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file (if present)
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ==========================================
// 1. CORS Configuration
// ==========================================
const clientUrl = process.env.CLIENT_URL;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // If CLIENT_URL is defined, check if origin matches or is a local dev URL
    if (clientUrl) {
      const normalizedClient = clientUrl.replace(/\/$/, '');
      const allowedOrigins = [
        normalizedClient,
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
      ];

      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
    }

    // Permissive fallback during local development
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ==========================================
// 2. Request Parsing Middleware
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. Database Connection Middleware
// ==========================================
// Connects or reuses cached Mongoose connection in Vercel serverless environment
app.use(async (req, res, next) => {
  // Allow health check and root info without DB connection
  if (req.path === '/api/health' || req.path === '/') {
    return next();
  }

  if (req.path.startsWith('/api/')) {
    try {
      await connectDB();
      return next();
    } catch (error) {
      console.error('[MongoDB Error in request pipeline]:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to MongoDB Atlas. Please check your MONGO_URI and Atlas Network Access whitelist.',
        error: process.env.NODE_ENV === 'production' ? undefined : error.message,
      });
    }
  }

  next();
});

// ==========================================
// 4. Base & Health Check Routes
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Register API is online and functional.',
    healthCheck: '/api/health',
    endpoints: {
      auth: [
        'POST /api/auth/signup',
        'POST /api/auth/login',
        'GET /api/auth/me',
      ],
      students: [
        'GET /api/students',
        'GET /api/students/:id',
        'POST /api/students',
        'PUT /api/students/:id',
        'DELETE /api/students/:id',
      ],
    },
  });
});

app.get('/api/health', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    service: 'student-register-api',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatusMap[mongoose.connection.readyState] || 'unknown',
  });
});

// ==========================================
// 5. API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// ==========================================
// 6. Error Handling Middleware
// ==========================================
app.use(notFoundHandler);
app.use(errorHandler);

// ==========================================
// 7. Local Server Execution
// ==========================================
// When running locally, start Express listener.
// In Vercel serverless execution, the exported app handles requests.
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    console.log(`[Server] Student Register backend running on http://localhost:${PORT}`);
    if (process.env.MONGO_URI) {
      try {
        await connectDB();
      } catch (err) {
        console.error('[Server] Warning: Initial MongoDB connection could not be established:', err.message);
      }
    } else {
      console.warn('[Server] Notice: MONGO_URI is not set. Configure it in server/.env before calling database endpoints.');
    }
  });
}

// Export Express app for Vercel serverless deployment
module.exports = app;
