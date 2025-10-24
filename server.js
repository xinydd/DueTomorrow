require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const sosRoutes = require('./routes/sos');
const reportRoutes = require('./routes/reports');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const aiAnalysisRoutes = require('./routes/ai-analysis');

// Import middleware
const { generalLimiter } = require('./middleware/rateLimiter');

// Import Socket.IO service
const { setupSocketIO } = require('./services/socketService');

// Import simulation service
const simulationService = require('./services/simulationService');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://duetomorrow-1.onrender.com'] // Replace with your frontend domain
      : [
          'http://localhost:3000', 
          'http://localhost:3001', 
          'http://localhost:5173',
          'http://192.168.1.205:3000',
          'http://192.168.1.205:5173',
          'null'
        ], // Allow local file access and mobile connections
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store io instance in app for use in routes
app.set('io', io);

// Setup Socket.IO
setupSocketIO(io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://duetomorrow-1.onrender.com'] // Replace with your frontend domain
    : [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'http://localhost:5173', 
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://192.168.1.205:3000',
        'http://192.168.1.205:5173',
        'null'
      ], // Allow local file access and mobile connections
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set('trust proxy', 1);

// Demo accounts for testing without MongoDB
const { users, createDemoAccounts } = require('./create-demo-accounts.js');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-safety');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\n💡 To fix this issue:');
    console.log('1. Start MongoDB locally: mongod');
    console.log('2. Or use MongoDB Atlas (cloud): Update MONGODB_URI in .env');
    console.log('3. Or run without MongoDB for testing (API will still work)\n');
    
    // Create demo accounts for testing without MongoDB
    console.log('🎓 Setting up demo accounts for testing...');
    await createDemoAccounts();
    console.log('⚠️  Server running with demo accounts (no database)');
  }
};

// Connect to MongoDB
connectDB();

// Optionally create demo accounts on startup (default true in development)
const enableDemoAccounts = (
  process.env.DEMO_ACCOUNTS === 'true' ||
  (process.env.NODE_ENV !== 'production' && process.env.DEMO_ACCOUNTS !== 'false')
);
if (enableDemoAccounts) {
  (async () => {
    try {
      await createDemoAccounts();
      console.log('✅ Demo accounts enabled');
    } catch (e) {
      console.log('⚠️ Failed to initialize demo accounts:', e.message);
    }
  })();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'HeySafe! API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', aiAnalysisRoutes);

// Socket.IO connection status endpoint
app.get('/api/status', (req, res) => {
  const { getConnectedUsersCount } = require('./services/socketService');
  const connectedUsers = getConnectedUsersCount();
  
  res.json({
    success: true,
    data: {
      server: 'online',
      socketIO: 'connected',
      connectedUsers,
      timestamp: new Date().toISOString()
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;
    
  res.status(error.status || 500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  
  // Stop simulation service
  simulationService.stopSimulation();
  
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 HeySafe! API server running on port ${PORT}`);
  console.log(`📡 Socket.IO server is ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Status check: http://localhost:${PORT}/api/status`);
  
  // Initialize simulation service
  simulationService.initialize(io);
});

module.exports = { app, server, io };
