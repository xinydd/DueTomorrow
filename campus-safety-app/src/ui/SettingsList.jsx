import { ChevronRight, Lock, Shield, Bell, SlidersHorizontal, UserCog, LogOut, Info } from 'lucide-react'

const settings = [
  { icon: UserCog, label: 'Account' },
  { icon: Shield, label: 'Safety Preferences' },
  { icon: Bell, label: 'Notifications' },
  { icon: Lock, label: 'Privacy & Security' },
  { icon: SlidersHorizontal, label: 'App Settings' },
]

export default function SettingsList() {
  return (
    <div className="card p-2">
      <ul>
        {settings.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-blue-50 text-blue-700">
                <Icon size={18} />
              </div>
              <span className="text-sm">{label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </li>
        ))}
      </ul>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button className="btn btn-outline"><Info size={16} /> About</button>
        <button className="btn btn-primary"><LogOut size={16} /> Logout</button>
      </div>
    </div>
  )
}


