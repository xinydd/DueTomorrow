import { User } from 'lucide-react'

export default function ProfileCard() {
  const user = { name: 'Alex Kim', role: 'Student', email: 'alex.kim@campus.edu' }
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-blue-600 text-white grid place-items-center">
        <User size={22} />
      </div>
      <div className="flex-1">
        <div className="font-medium">{user.name}</div>
        <div className="text-sm text-gray-600">{user.role} • {user.email}</div>
      </div>
      <button className="btn btn-outline">Edit</button>
    </div>
  )
}


