const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoute');

const initDb = require('./config/dbInit');

// ─── App + HTTP server (Socket.io needs raw http.Server) ──
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    method: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach io to app so controllers can access it via req.app.get('io')
app.set('io', io);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Client joins a room when they authenticate
  // Rooms: 'role_admin', 'role_faculty', 'role_student', 'course_<id>'
  socket.on('join_room', (data) => {
    const { role, course_ids = [], department, semester, user_id } = data;

    // Join user-specific room for direct messaging updates
    if (user_id) socket.join(`user_${user_id}`);

    // Join role-based room (e.g. 'role_student')
    if (role) socket.join(`role_${role}`);

    // Join course-specific rooms (for course notices)
    course_ids.forEach(id => socket.join(`course_${id}`));

    // Join department-specific room
    if (department) {
      socket.join(`dept_${department}`);
      if (semester) {
        socket.join(`dept_${department}_sem_${semester}`);
      }
    }

    console.log(`  → User joined rooms: role_${role}, dept: ${department}, sem: ${semester}, courses: [${course_ids.join(', ')}]`);
  });

  // Client can leave a course room (e.g. after dropping a course)
  socket.on('leave_course', (course_id) => {
    socket.leave(`course_${course_id}`);
  });

  socket.on('send_message', (data) => {
    const { room, text, sender } = data;
    console.log(`💬 Msg in room ${room} from ${sender}: ${text}`);
    socket.to(room).emit('receive_message', {
      room,
      text,
      sender,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now() + Math.random()
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});


// ─── Security Middleware ───────────────────────────────────
app.use(helmet()); // Sets secure HTTP headers

// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// }));
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};
app.use(cors(corsOptions));


// ---------------------------------------------------------------------------
// // Rate limiting: 100 requests per 15 minutes per IP
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: { success: false, message: 'Too many requests, please try again later' },
// });
// app.use('/api/', limiter);

// // Stricter limit for auth endpoints
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message: { success: false, message: 'Too many login attempts, try again in 15 minutes' },
// });
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);
// ---------------------------------------------------------------------------
// General rate limit: 100 req / 15 min per IP
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,   //10
  message: { success: false, message: 'Too many requests. Try again later.' },
}));

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,  //15
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static Files & Uploads Directory ─────────────────────
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoute'));
app.use('/api/users',      require('./routes/usersRoutes'));
app.use('/api/courses',    require('./routes/coursesRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/grades',     require('./routes/gradesRoutes'));
app.use('/api/fees',       require('./routes/feesRoutes'));
app.use('/api/notices',    require('./routes/noticesRoutes'));
app.use('/api/reports',    require('./routes/reportsRoutes'));
app.use('/api/dashboard',  require('./routes/dashboardRoutes'));
app.use('/api/upload',     require('./routes/uploadRoutes'));
app.use('/api/student',    require('./routes/studentRoutes'));
app.use('/api/chat',       require('./routes/chatRoutes'));

// Also mount faculty course route at /api prefix
app.use('/api/faculty',    require('./routes/coursesRoutes'));


// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'EntitySYS API is running', 
    timestamp: new Date(), 
    socket_connections: io.engine.clientsCount, });
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` });
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
    // app.listen(PORT, () => {
    server.listen(PORT, () => {
      console.log(`🚀 EntitySYS server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
      console.log(`   Socket.io   : ready for real-time connections\n`);
    });
  } catch (err) {
    console.error('❌ Critical failure during server startup:', err);
    process.exit(1);
  }
};

startServer();