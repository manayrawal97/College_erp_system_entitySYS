const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoute');

const initDb = require('./config/dbInit');

const app = express();

// ─── Security Middleware ───────────────────────────────────
app.use(helmet()); // Sets secure HTTP headers

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
}));

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, try again in 15 minutes' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
// Week 2: add users, courses, attendance, grades, fees, notices routes here

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EntitySYS API is running', timestamp: new Date() });
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const pool = require('./config/db.config');

const startServer = async () => {
  try {
    // 1. Initialize Database
    await initDb();

    // 2. Test Pool Connection
    const connection = await pool.getConnection();
    console.log('✅ Database connection pool ready');
    connection.release();

    // 3. Start Listening
    app.listen(PORT, () => {
      console.log(`🚀 EntitySYS server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Critical failure during server startup:', err);
    process.exit(1);
  }
};

startServer();


// const express = require('express');
// const cors = require('cors');
// const authMiddleware = require('./middleware/authMiddleware');
// const dotenv = require('dotenv');

// dotenv.config();

// const { connectDB } = require('./config/db.config');
// const initDb = require('./config/dbInit');
// // const errorHandler = require('./middleware/errorHandler');
// connectDB();
// initDb();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
// }));


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });



