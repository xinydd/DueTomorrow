const IncidentReport = require('../models/IncidentReport');
const User = require('../models/User');
const mongoose = require('mongoose');

class SimulationService {
  constructor() {
    this.isEnabled = process.env.SIMULATION_ENABLED === 'true';
    this.intervals = [];
    this.io = null;
    
    // Campus bounds (example coordinates - adjust for your campus)
    this.campusBounds = {
      north: 40.7200,
      south: 40.7000,
      east: -74.0000,
      west: -74.0200
    };
    
    // Sample data for simulation
    this.incidentTypes = [
      'harassment',
      'theft', 
      'suspicious_activity',
      'vandalism',
      'accident',
      'noise_complaint',
      'trespassing',
      'medical_emergency'
    ];
    
    this.priorities = ['low', 'medium', 'high', 'urgent'];
    
    this.descriptions = [
      'Student reported suspicious behavior near the library',
      'Loud noise disturbance in dormitory area',
      'Property damage found in parking lot',
      'Medical assistance needed at gymnasium',
      'Unauthorized person spotted in restricted area',
      'Theft reported from student locker',
      'Vandalism on campus bulletin board',
      'Accident involving bicycle near main entrance',
      'Harassment complaint from student',
      'Fire alarm activation in building',
      'Power outage affecting multiple buildings',
      'Water leak reported in basement',
      'Suspicious package found near entrance',
      'Student injured during sports activity',
      'Vehicle accident in parking area'
    ];
    
    this.systemAlerts = [
      '⚠️ Power outage in Block C',
      '🚨 Suspicious activity near Library',
      '🔥 Fire drill in Block A',
      '👮 Security patrol dispatched to Block D',
      '🚧 Construction work causing noise in Block B',
      '💧 Water leak detected in Block E',
      '🔌 Electrical maintenance in progress',
      '🚪 Door access system malfunction reported',
      '📱 WiFi connectivity issues in Library',
      '🌧️ Weather alert: Heavy rain expected',
      '🚗 Parking lot maintenance scheduled',
      '📚 Library closing early due to maintenance',
      '🍽️ Cafeteria service temporarily suspended',
      '🏥 Medical center operating on reduced hours',
      '📞 Emergency phone system test completed'
    ];
  }

  // Initialize simulation service
  initialize(io) {
    this.io = io;
    
    // Check environment variable at runtime
    this.isEnabled = process.env.SIMULATION_ENABLED === 'true';
    
    if (!this.isEnabled) {
      console.log('🎭 Simulation disabled (SIMULATION_ENABLED=false)');
      return;
    }
    
    console.log('🎭 Starting Campus Safety Simulation...');
    this.startSimulation();
  }

  // Start all simulation jobs
  startSimulation() {
    // Simulated incident reports every 10 seconds
    const incidentInterval = setInterval(() => {
      this.simulateIncidentReport();
    }, 10000);
    this.intervals.push(incidentInterval);

    // Guardian Angel location updates every 10 seconds
    const guardianInterval = setInterval(() => {
      this.simulateGuardianUpdates();
    }, 10000);
    this.intervals.push(guardianInterval);

    // System alerts every 30 seconds
    const alertInterval = setInterval(() => {
      this.simulateSystemAlert();
    }, 30000);
    this.intervals.push(alertInterval);

    console.log('🎭 Simulation jobs started:');
    console.log('  📝 Incident reports: Every 10s');
    console.log('  👮 Guardian updates: Every 10s');
    console.log('  🚨 System alerts: Every 30s');
  }

  // Stop all simulation jobs
  stopSimulation() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    console.log('🎭 Simulation stopped');
  }

  // Generate random location within campus bounds
  generateRandomLocation() {
    const lat = this.campusBounds.south + 
      (Math.random() * (this.campusBounds.north - this.campusBounds.south));
    const lng = this.campusBounds.west + 
      (Math.random() * (this.campusBounds.east - this.campusBounds.west));
    
    return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
  }

  // Simulate incident report creation
  async simulateIncidentReport() {
    try {
      if (!this.io) return;

      const type = this.incidentTypes[Math.floor(Math.random() * this.incidentTypes.length)];
      const description = this.descriptions[Math.floor(Math.random() * this.descriptions.length)];
      const priority = this.priorities[Math.floor(Math.random() * this.priorities.length)];
      const location = this.generateRandomLocation();

      // Create a simulated user ID (for demo purposes)
      const simulatedUserId = 'simulation-user-' + Date.now();

      const reportData = {
        userId: simulatedUserId,
        type,
        description,
        location,
        priority,
        timestamp: new Date(),
        status: 'open'
      };

      if (this.isMongoConnected()) {
        const report = new IncidentReport(reportData);
        await report.save();

        // Keep only latest 10 reports
        await this.cleanupOldReports();

        // Broadcast to staff and security
        this.broadcastToStaffAndSecurity('newIncidentReport', {
          report: {
            ...report.toObject(),
            userId: { _id: simulatedUserId, name: 'Simulated User', role: 'student' }
          },
          user: {
            id: simulatedUserId,
            name: 'Simulated User',
            email: 'simulation@campus.edu',
            role: 'student'
          },
          priority,
          simulated: true
        });

        console.log(`📝 [SIM] Created incident report: ${type} (${priority}) at ${location.lat}, ${location.lng}`);
      } else {
        // Demo mode - just broadcast without saving
        this.broadcastToStaffAndSecurity('newIncidentReport', {
          report: {
            ...reportData,
            _id: 'sim-' + Date.now(),
            userId: { _id: simulatedUserId, name: 'Simulated User', role: 'student' }
          },
          user: {
            id: simulatedUserId,
            name: 'Simulated User',
            email: 'simulation@campus.edu',
            role: 'student'
          },
          priority,
          simulated: true
        });

        console.log(`📝 [SIM] Created simulated incident report: ${type} (${priority})`);
      }
    } catch (error) {
      console.error('Error simulating incident report:', error);
    }
  }

  // Simulate Guardian Angel location updates
  async simulateGuardianUpdates() {
    try {
      if (!this.io) return;

      let guardians = [];
      
      if (this.isMongoConnected()) {
        // Get 3-5 random staff/security users
        const allGuardians = await User.find({
          role: { $in: ['staff', 'security'] },
          isActive: true
        }).limit(5);

        guardians = allGuardians.slice(0, Math.floor(Math.random() * 3) + 3);
      } else {
        // Demo mode - create simulated guardians
        const roles = ['staff', 'security'];
        const names = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Wilson', 'Tom Brown'];
        
        guardians = Array.from({ length: Math.floor(Math.random() * 3) + 3 }, (_, i) => ({
          _id: `sim-guardian-${i}`,
          name: names[i] || `Guardian ${i + 1}`,
          role: roles[Math.floor(Math.random() * roles.length)],
          location: this.generateRandomLocation()
        }));
      }

      // Update locations for selected guardians
      const updates = [];
      for (const guardian of guardians) {
        const newLocation = this.generateRandomLocation();
        
        if (this.isMongoConnected()) {
          await User.findByIdAndUpdate(guardian._id, { location: newLocation });
        }
        
        updates.push({
          ...guardian.toObject ? guardian.toObject() : guardian,
          location: newLocation
        });
      }

      // Broadcast updates
      this.broadcastToAll('guardianStatusUpdate', {
        guardians: updates,
        simulated: true
      });

      console.log(`👮 [SIM] Updated ${updates.length} guardian locations`);
    } catch (error) {
      console.error('Error simulating guardian updates:', error);
    }
  }

  // Simulate system alerts
  simulateSystemAlert() {
    try {
      if (!this.io) return;

      const alert = this.systemAlerts[Math.floor(Math.random() * this.systemAlerts.length)];
      const timestamp = new Date();

      this.broadcastToAll('systemAlert', {
        message: alert,
        timestamp,
        type: 'system',
        simulated: true
      });

      console.log(`🚨 [SIM] System alert: ${alert}`);
    } catch (error) {
      console.error('Error simulating system alert:', error);
    }
  }

  // Clean up old reports (keep only latest 10)
  async cleanupOldReports() {
    try {
      if (!this.isMongoConnected()) return;

      const totalReports = await IncidentReport.countDocuments();
      if (totalReports > 10) {
        const reportsToDelete = await IncidentReport.find()
          .sort({ timestamp: 1 })
          .limit(totalReports - 10)
          .select('_id');

        const idsToDelete = reportsToDelete.map(report => report._id);
        await IncidentReport.deleteMany({ _id: { $in: idsToDelete } });
        
        console.log(`🧹 [SIM] Cleaned up ${idsToDelete.length} old reports`);
      }
    } catch (error) {
      console.error('Error cleaning up old reports:', error);
    }
  }

  // Broadcast to staff and security only
  broadcastToStaffAndSecurity(event, data) {
    if (!this.io) return;

    // In a real implementation, you'd filter by user role
    // For demo purposes, broadcast to all connected clients
    this.io.emit(event, data);
  }

  // Broadcast to all connected clients
  broadcastToAll(event, data) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Check if MongoDB is connected
  isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  // Get simulation status
  getStatus() {
    return {
      enabled: this.isEnabled,
      running: this.intervals.length > 0,
      jobs: this.intervals.length,
      campusBounds: this.campusBounds
    };
  }
}

module.exports = new SimulationService();
