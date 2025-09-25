// Script to create demo accounts for testing
// This bypasses MongoDB and creates accounts directly

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Demo accounts data
const demoAccounts = [
  {
    name: "Ahmad Student",
    email: "ahmad@student.edu",
    password: "student123",
    role: "student"
  },
  {
    name: "Sarah Staff", 
    email: "sarah@staff.edu",
    password: "staff123",
    role: "staff"
  },
  {
    name: "Mike Security",
    email: "mike@security.edu", 
    password: "security123",
    role: "security"
  }
];

// Simple in-memory storage (replaces MongoDB for demo)
const users = new Map();

// Hash password function
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

// Create demo accounts
async function createDemoAccounts() {
  console.log('🎓 Creating demo accounts...\n');
  
  for (const account of demoAccounts) {
    try {
      const hashedPassword = await hashPassword(account.password);
      const userId = crypto.randomUUID();
      
      const user = {
        _id: userId,
        name: account.name,
        email: account.email,
        password: hashedPassword,
        role: account.role,
        isActive: true,
        createdAt: new Date()
      };
      
      users.set(account.email, user);
      
      console.log(`✅ Created ${account.role} account:`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Password: ${account.password}`);
      console.log(`   Name: ${account.name}\n`);
      
    } catch (error) {
      console.error(`❌ Error creating account ${account.email}:`, error.message);
    }
  }
  
  console.log('🎉 Demo accounts created successfully!');
  console.log('📝 You can now use these accounts to test the app:');
  console.log('   - Students: SOS alerts, incident reporting');
  console.log('   - Staff: View reports, assist students'); 
  console.log('   - Security: Manage alerts, emergency response');
}

// Export for use in server
module.exports = { users, createDemoAccounts };

// Run if called directly
if (require.main === module) {
  createDemoAccounts().catch(console.error);
}
