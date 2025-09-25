const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store connected users by role for efficient broadcasting
const connectedUsers = {
  students: new Set(),
  staff: new Set(),
  security: new Set(),
  guardianAngels: new Set() // Combined staff + security
};

const setupSocketIO = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userName} (${socket.userRole}) - Socket ID: ${socket.id}`);

    // Add user to appropriate role-based rooms
    connectedUsers[socket.userRole].add(socket.id);
    
    // Add Guardian Angels (staff + security) to special room
    if (['staff', 'security'].includes(socket.userRole)) {
      connectedUsers.guardianAngels.add(socket.id);
      socket.join('guardian-angels');
      
      // Also join individual Guardian Angel room for targeted notifications
      socket.join(`guardian-${socket.userId}`);
    }

    // Join user-specific room for direct notifications
    socket.join(`user-${socket.userId}`);

    // Handle location updates from users
    socket.on('locationUpdate', async (data) => {
      try {
        const { lat, lng } = data;
        
        if (lat && lng) {
          // Update user location in database
          await User.findByIdAndUpdate(socket.userId, {
            location: { lat, lng }
          });
          
          socket.broadcast.to('guardian-angels').emit('userLocationUpdate', {
            userId: socket.userId,
            userName: socket.userName,
            userRole: socket.userRole,
            location: { lat, lng },
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle Guardian Angel status updates
    socket.on('guardianStatus', (data) => {
      const { status, location } = data; // status: 'available', 'busy', 'offline'
      
      socket.broadcast.to('guardian-angels').emit('guardianStatusUpdate', {
        userId: socket.userId,
        userName: socket.userName,
        status,
        location,
        timestamp: new Date()
      });
    });

    // Handle chat messages (for coordination between Guardian Angels)
    socket.on('guardianChat', (data) => {
      const { message, alertId } = data;
      
      // Only Guardian Angels can send chat messages
      if (!['staff', 'security'].includes(socket.userRole)) {
        return socket.emit('error', { message: 'Unauthorized' });
      }
      
      socket.broadcast.to('guardian-angels').emit('guardianChatMessage', {
        from: {
          userId: socket.userId,
          userName: socket.userName,
          role: socket.userRole
        },
        message,
        alertId,
        timestamp: new Date()
      });
    });

    // Handle emergency acknowledgment from Guardian Angels
    socket.on('acknowledgeEmergency', (data) => {
      const { alertId, userId } = data;
      
      // Only Guardian Angels can acknowledge emergencies
      if (!['staff', 'security'].includes(socket.userRole)) {
        return socket.emit('error', { message: 'Unauthorized' });
      }
      
      // Notify the specific user that their emergency has been acknowledged
      io.to(`user-${userId}`).emit('emergencyAcknowledged', {
        alertId,
        acknowledgedBy: {
          userId: socket.userId,
          userName: socket.userName,
          role: socket.userRole
        },
        timestamp: new Date()
      });
      
      // Notify other Guardian Angels
      socket.broadcast.to('guardian-angels').emit('emergencyAcknowledged', {
        alertId,
        userId,
        acknowledgedBy: {
          userId: socket.userId,
          userName: socket.userName,
          role: socket.userRole
        },
        timestamp: new Date()
      });
    });

    // Handle user heartbeat (to track online status)
    socket.on('heartbeat', () => {
      socket.emit('heartbeatResponse', { timestamp: new Date() });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userName} (${socket.userRole}) - Reason: ${reason}`);
      
      // Remove user from connected users sets
      connectedUsers[socket.userRole].delete(socket.id);
      
      if (['staff', 'security'].includes(socket.userRole)) {
        connectedUsers.guardianAngels.delete(socket.id);
      }
      
      // Notify Guardian Angels about user going offline
      if (['staff', 'security'].includes(socket.userRole)) {
        socket.broadcast.to('guardian-angels').emit('guardianOffline', {
          userId: socket.userId,
          userName: socket.userName,
          role: socket.userRole,
          timestamp: new Date()
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

// Helper function to get connected users count by role
const getConnectedUsersCount = () => {
  return {
    students: connectedUsers.students.size,
    staff: connectedUsers.staff.size,
    security: connectedUsers.security.size,
    guardianAngels: connectedUsers.guardianAngels.size,
    total: connectedUsers.students.size + connectedUsers.staff.size + connectedUsers.security.size
  };
};

// Helper function to broadcast to specific role
const broadcastToRole = (io, role, event, data) => {
  const roleSockets = connectedUsers[role];
  roleSockets.forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
};

// Helper function to broadcast to Guardian Angels
const broadcastToGuardianAngels = (io, event, data) => {
  io.to('guardian-angels').emit(event, data);
};

module.exports = {
  setupSocketIO,
  getConnectedUsersCount,
  broadcastToRole,
  broadcastToGuardianAngels
};
