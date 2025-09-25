import { useState } from 'react'

// Demo accounts data
const DEMO_ACCOUNTS = {
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

const DemoAccounts = ({ onSelectAccount }) => {
  const [showAccounts, setShowAccounts] = useState(false)

  const handleAccountSelect = (account) => {
    onSelectAccount({
      email: account.email,
      password: account.password
    })
    setShowAccounts(false)
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowAccounts(!showAccounts)}
        className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
      >
        {showAccounts ? 'Hide Demo Accounts' : 'Show Demo Accounts'}
      </button>

      {showAccounts && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-gray-600 text-center mb-3">
            Click any account below to auto-fill login form
          </p>
          
          {Object.entries(DEMO_ACCOUNTS).map(([role, account]) => (
            <button
              key={role}
              onClick={() => handleAccountSelect(account)}
              className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800 capitalize">{role}</div>
                  <div className="text-sm text-gray-600">{account.name}</div>
                  <div className="text-xs text-gray-500">{account.email}</div>
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  Click to use
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default DemoAccounts
