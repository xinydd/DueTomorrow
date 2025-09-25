// Demo accounts for testing the Campus Safety App
// These accounts are pre-created for easy testing

export const DEMO_ACCOUNTS = {
  student: {
    name: "Ahmad Student",
    email: "ahmad@student.edu",
    password: "student123",
    role: "student"
  },
  staff: {
    name: "Sarah Staff",
    email: "sarah@staff.edu", 
    password: "staff123",
    role: "staff"
  },
  security: {
    name: "Mike Security",
    email: "mike@security.edu",
    password: "security123", 
    role: "security"
  }
}

// Quick login helper
export const getDemoCredentials = (role) => {
  const account = DEMO_ACCOUNTS[role]
  if (!account) {
    throw new Error(`Demo account for role "${role}" not found`)
  }
  return {
    email: account.email,
    password: account.password
  }
}

// Display demo accounts info
export const displayDemoAccounts = () => {
  console.log("🎓 Campus Safety App - Demo Accounts")
  console.log("=====================================")
  console.log("")
  
  Object.entries(DEMO_ACCOUNTS).forEach(([role, account]) => {
    console.log(`👤 ${role.toUpperCase()}:`)
    console.log(`   Email: ${account.email}`)
    console.log(`   Password: ${account.password}`)
    console.log(`   Name: ${account.name}`)
    console.log("")
  })
  
  console.log("💡 Copy any email/password above to test different roles!")
}
