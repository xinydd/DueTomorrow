const User = require('../models/User');
const mongoose = require('mongoose');

class GuardianService {
  // Check if MongoDB is connected
  isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  // Haversine formula to calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Find nearest Guardian Angels (staff/security) to a location
  async findNearestGuardians(lat, lng, limit = 3) {
    try {
      if (!this.isMongoConnected()) {
        // Return demo data for testing
        return [
          {
            _id: 'demo-guardian-1',
            name: 'Demo Guardian 1',
            email: 'guardian1@demo.com',
            role: 'staff',
            location: { lat: lat + 0.001, lng: lng + 0.001 },
            isActive: true,
            distance: 0.1
          },
          {
            _id: 'demo-guardian-2',
            name: 'Demo Guardian 2',
            email: 'guardian2@demo.com',
            role: 'security',
            location: { lat: lat - 0.001, lng: lng + 0.001 },
            isActive: true,
            distance: 0.15
          }
        ];
      }

      // Find active staff and security users with location data
      const guardians = await User.find({
        role: { $in: ['staff', 'security'] },
        isActive: true,
        location: { $exists: true }
      }).select('name email role location isActive');

      // Calculate distances and sort
      const guardiansWithDistance = guardians.map(guardian => {
        const distance = this.calculateDistance(
          lat, lng,
          guardian.location.lat,
          guardian.location.lng
        );
        
        return {
          ...guardian.toObject(),
          distance
        };
      });

      // Sort by distance and return the nearest ones
      return guardiansWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

    } catch (error) {
      console.error('Error finding nearest guardians:', error);
      return [];
    }
  }

  // Find all active Guardian Angels
  async getAllActiveGuardians() {
    try {
      if (!this.isMongoConnected()) {
        return [
          {
            _id: 'demo-guardian-1',
            name: 'Demo Guardian 1',
            email: 'guardian1@demo.com',
            role: 'staff',
            isActive: true
          },
          {
            _id: 'demo-guardian-2',
            name: 'Demo Guardian 2',
            email: 'guardian2@demo.com',
            role: 'security',
            isActive: true
          }
        ];
      }

      return await User.find({
        role: { $in: ['staff', 'security'] },
        isActive: true
      }).select('name email role location isActive');

    } catch (error) {
      console.error('Error getting all active guardians:', error);
      return [];
    }
  }

  // Check if a user is a Guardian Angel
  isGuardianAngel(user) {
    return user && ['staff', 'security'].includes(user.role);
  }

  // Get Guardian Angel status
  async getGuardianStatus(userId) {
    try {
      if (!this.isMongoConnected()) {
        return {
          isGuardian: true,
          isActive: true,
          lastSeen: new Date(),
          location: { lat: 0, lng: 0 }
        };
      }

      const user = await User.findById(userId).select('role isActive location lastLogin');
      
      if (!user) {
        return { isGuardian: false };
      }

      return {
        isGuardian: this.isGuardianAngel(user),
        isActive: user.isActive,
        lastSeen: user.lastLogin,
        location: user.location
      };

    } catch (error) {
      console.error('Error getting guardian status:', error);
      return { isGuardian: false };
    }
  }
}

module.exports = new GuardianService();
