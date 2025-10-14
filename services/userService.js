const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { users } = require('../create-demo-accounts.js');
const User = require('../models/User');

// User service that works with or without MongoDB
class UserService {
  // Find user by email
  async findByEmail(email) {
    try {
      // Try MongoDB first
      if (mongoose.connection.readyState === 1) {
        const dbUser = await User.findOne({ email });
        if (dbUser) return dbUser;
      }
    } catch (error) {
      console.log('MongoDB not available, using demo accounts');
    }
    
    // Always attempt fallback to demo accounts if available
    const demoUser = users.get(email) || null;
    return demoUser;
  }

  // Find user by ID
  async findById(id) {
    try {
      // Try MongoDB first
      if (mongoose.connection.readyState === 1) {
        return await User.findById(id);
      }
    } catch (error) {
      console.log('MongoDB not available, using demo accounts');
    }
    
    // Fallback to demo accounts
    for (const user of users.values()) {
      if (user._id === id) {
        return user;
      }
    }
    return null;
  }

  // Create new user
  async create(userData) {
    try {
      // Try MongoDB first
      if (mongoose.connection.readyState === 1) {
        const user = new User(userData);
        return await user.save();
      }
    } catch (error) {
      console.log('MongoDB not available, using demo accounts');
    }
    
    // For demo mode, just return the user data (no actual creation)
    throw new Error('User creation not available in demo mode. Use existing demo accounts.');
  }

  // Update user
  async updateById(id, updateData) {
    try {
      // Try MongoDB first
      if (mongoose.connection.readyState === 1) {
        return await User.findByIdAndUpdate(id, updateData, { new: true });
      }
    } catch (error) {
      console.log('MongoDB not available, using demo accounts');
    }
    
    // Fallback to demo accounts
    for (const [email, user] of users.entries()) {
      if (user._id === id) {
        const updatedUser = { ...user, ...updateData };
        users.set(email, updatedUser);
        return updatedUser;
      }
    }
    return null;
  }

  // Compare password
  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = new UserService();
