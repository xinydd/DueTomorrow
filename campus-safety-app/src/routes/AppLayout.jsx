import { NavLink, Outlet } from 'react-router-dom'
import { Home as HomeIcon, Map as MapIcon, Bell, User } from 'lucide-react'

export default function AppLayout() {
  return (
    <div className="min-h-dvh max-w-md mx-auto flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Campus Safety</div>
          <NavLink to="/home/profile" className="text-sm text-blue-600">Profile</NavLink>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 bg-white border-t">
        <div className="grid grid-cols-3 max-w-md mx-auto">
          <BottomLink to="/home" label="Home" icon={<HomeIcon size={20} />} />
          <BottomLink to="/home/map" label="Map" icon={<MapIcon size={20} />} />
          <BottomLink to="/home/notifications" label="Alerts" icon={<Bell size={20} />} />
        </div>
      </nav>
    </div>
  )
}

function BottomLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-1 py-3 text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'
        }`
      }
      end
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}


