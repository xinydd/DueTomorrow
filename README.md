# Campus Safety Backend API

A comprehensive Node.js + Express backend for a Campus Safety App with real-time SOS alerts and incident reporting.

## Features

- 🔐 **JWT Authentication** with role-based access control
- 🚨 **Real-time SOS Alerts** with Socket.IO integration
- 📝 **Incident Reporting** system with priority handling
- 👥 **Role-based Access** (Student, Staff, Security)
- 🛡️ **Security Features** (Rate limiting, Password hashing, CORS)
- 📍 **Location-based Services** for Guardian Angel matching
- ⚡ **Real-time Notifications** via WebSocket
- 📊 **Analytics & Insights** with heatmap visualization
- 🔄 **Escalation Workflow** for SOS alerts (60s timeout)
- 📋 **Audit Logging** for all critical actions
- 👨‍💼 **Admin Panel** for user and system management
- 🎯 **Smart Guardian Matching** using Haversine formula

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Security**: bcryptjs, helmet, express-rate-limit

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-safety-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/campus-safety
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   SIMULATION_ENABLED=true
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB locally
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/profile` - Get user profile

### SOS Alerts
- `POST /api/sos` - Send SOS alert (Students only)
- `GET /api/sos` - Get all active alerts (Security only)
- `PATCH /api/sos/:id/acknowledge` - Acknowledge SOS alert (Staff + Security)
- `PATCH /api/sos/:id/resolve` - Resolve SOS alert (Security only)
- `GET /api/sos/my-alerts` - Get user's own alerts

### Incident Reports
- `POST /api/report` - Submit incident report (Students only)
- `GET /api/reports` - Get all reports (Staff + Security)
- `PATCH /api/reports/:id/close` - Close incident report (Staff + Security)
- `GET /api/my-reports` - Get user's own reports
- `GET /api/reports/:id` - Get specific report details
- `GET /api/stats` - Get incident statistics (Staff + Security)

### Analytics & Insights
- `GET /api/analytics/summary` - Get analytics summary (Staff + Security)
- `GET /api/analytics/heatmap` - Get heatmap data for incidents (Staff + Security)
- `GET /api/analytics/trends` - Get trends over time (Staff + Security)

### Admin Endpoints
- `GET /api/admin/users` - List all users with roles (Security only)
- `GET /api/admin/system-status` - Get system status and metrics (Security only)
- `GET /api/admin/audit-logs` - Get audit logs (Security only)
- `PATCH /api/admin/users/:id/deactivate` - Deactivate user (Security only)
- `PATCH /api/admin/users/:id/reactivate` - Reactivate user (Security only)
- `GET /api/admin/simulation/status` - Get simulation status (Security only)
- `POST /api/admin/simulation/start` - Start live data simulation (Security only)
- `POST /api/admin/simulation/stop` - Stop live data simulation (Security only)

### System
- `GET /health` - Health check
- `GET /api/status` - Server and Socket.IO status

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (student|staff|security),
  location: { lat: Number, lng: Number },
  isActive: Boolean,
  lastLogin: Date
}
```

### SOS Alert
```javascript
{
  userId: ObjectId,
  location: { lat: Number, lng: Number },
  timestamp: Date,
  status: String (active|resolved),
  resolvedBy: ObjectId,
  resolvedAt: Date,
  notes: String
}
```

### Incident Report
```javascript
{
  userId: ObjectId,
  type: String (harassment|theft|suspicious_activity|etc),
  description: String,
  location: { lat: Number, lng: Number },
  timestamp: Date,
  status: String (open|closed),
  handledBy: ObjectId,
  closedAt: Date,
  priority: String (low|medium|high|urgent)
}
```

## Enhanced Features

### Analytics & Insights
- **Summary Dashboard**: Total alerts, reports, resolution rates, response times
- **Heatmap Visualization**: Incident density by location and time
- **Trend Analysis**: Activity patterns over time
- **Real-time Metrics**: Live system statistics

### Priority Handling
- **Urgent Reports**: Automatically notify Security role
- **Medium/Low Reports**: Notify Staff role
- **Priority-based Routing**: Smart notification distribution

### Escalation Workflow
- **60-Second Timeout**: SOS alerts escalate if not acknowledged
- **Multi-level Escalation**: Notify additional staff and security
- **Status Tracking**: Active → Acknowledged → Escalated → Resolved

### Guardian Angel Matching
- **Location-based**: Find 3 nearest active staff/security
- **Haversine Formula**: Accurate distance calculation
- **Smart Routing**: Reduce notification spam

### Audit Logging
- **Comprehensive Tracking**: All critical actions logged
- **User Activity**: Signup, login, actions
- **System Events**: SOS triggers, escalations, resolutions
- **Admin Actions**: User management, system changes

### Live Data Simulation (Demo Mode)
- **Simulated Incident Reports**: Auto-generated every 10 seconds
- **Guardian Angel Updates**: Random location updates every 10 seconds
- **System Alerts**: Random alerts every 30 seconds
- **Data Cleanup**: Maintains only latest 10 reports
- **Configurable**: Enable/disable via `SIMULATION_ENABLED` environment variable

## Socket.IO Events

### Client → Server
- `locationUpdate` - Update user location
- `guardianStatus` - Update Guardian Angel status
- `guardianChat` - Send chat message between Guardian Angels
- `acknowledgeEmergency` - Acknowledge emergency alert
- `heartbeat` - Keep connection alive

### Server → Client
- `newSOS` - New SOS alert (sent to nearest guardians)
- `sosAcknowledged` - SOS alert acknowledged
- `sosEscalated` - SOS alert escalated (60s timeout)
- `sosResolved` - SOS alert resolved
- `newIncidentReport` - New incident report (priority-based)
- `urgentIncidentReport` - Urgent incident report (security only)
- `incidentReportClosed` - Incident report closed
- `userLocationUpdate` - User location updated
- `guardianStatusUpdate` - Guardian Angel status changed
- `guardianChatMessage` - Chat message from Guardian Angel
- `systemAlert` - System-wide alert notification (simulation)

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents abuse of endpoints
- **CORS Protection**: Configurable cross-origin policies
- **Helmet**: Security headers
- **Input Validation**: Request body validation
- **Role-based Access**: Granular permissions

## Rate Limits

- **General**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **SOS Alerts**: 1 request per 30 seconds per IP

## Role Permissions

### Students
- Send SOS alerts
- Submit incident reports
- View own alerts/reports

### Staff
- View all incident reports
- Close incident reports
- Receive SOS notifications

### Security
- View all SOS alerts
- Resolve SOS alerts
- View all incident reports
- Close incident reports
- Receive all emergency notifications

## Development

### Project Structure
```
campus-safety-backend/
├── models/           # Database models
├── routes/           # API routes
├── middleware/       # Custom middleware
├── services/         # Business logic services
├── server.js         # Main server file
├── package.json      # Dependencies
└── README.md         # Documentation
```

### Environment Variables
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Testing

Test the API using tools like Postman or curl:

```bash
# Health check
curl http://localhost:3000/health

# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"student"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Send SOS alert (requires authentication)
curl -X POST http://localhost:3000/api/sos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"lat":40.7128,"lng":-74.0060}'

# Submit incident report with priority
curl -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"type":"harassment","description":"Incident description","lat":40.7128,"lng":-74.0060,"priority":"urgent"}'

# Get analytics summary (staff/security only)
curl -X GET http://localhost:3000/api/analytics/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get heatmap data
curl -X GET http://localhost:3000/api/analytics/heatmap?days=30 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Acknowledge SOS alert
curl -X PATCH http://localhost:3000/api/sos/ALERT_ID/acknowledge \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get admin users (security only)
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get system status (security only)
curl -X GET http://localhost:3000/api/admin/system-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get simulation status (security only)
curl -X GET http://localhost:3000/api/admin/simulation/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Start simulation (security only)
curl -X POST http://localhost:3000/api/admin/simulation/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Stop simulation (security only)
curl -X POST http://localhost:3000/api/admin/simulation/stop \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment

1. **Production Environment Variables**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-production-secret-key
   MONGODB_URI=your-production-mongodb-uri
   ```

2. **Process Manager** (PM2)
   ```bash
   npm install -g pm2
   pm2 start server.js --name campus-safety-api
   ```

3. **Docker** (optional)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Support

For support and questions, please contact the development team or create an issue in the repository.
