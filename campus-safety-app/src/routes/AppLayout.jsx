import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home as HomeIcon, Map as MapIcon, Bell, User, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { useSecurity } from '../state/SecurityContext.jsx'
import RoleBasedNavigation from '../components/RoleBasedNavigation.jsx'
import HeySafeLogo from '../components/HeySafeLogo.jsx'

export default function AppLayout() {
  const navigate = useNavigate()
  const { user, logout, hasRole } = useSecurity()

  useEffect(() => {
    const handleNavigateToTab = (event) => {
      const { tab } = event.detail
      if (tab === 'map') {
        navigate('/home/map')
      } else if (tab === 'home') {
        navigate('/home')
      } else if (tab === 'alerts') {
        navigate('/home/notifications')
      }
    }

    window.addEventListener('navigateToTab', handleNavigateToTab)
    return () => window.removeEventListener('navigateToTab', handleNavigateToTab)
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleDisplayName = (role) => {
    const roleMap = {
      student: 'Student',
      staff: 'Staff',
      security: 'Security'
    }
    return roleMap[role] || role
  }

  const getRoleColor = (role) => {
    const colorMap = {
      student: 'text-blue-600',
      staff: 'text-green-600',
      security: 'text-red-600'
    }
    return colorMap[role] || 'text-gray-600'
  }

  return (
    <div className="min-h-dvh max-w-md mx-auto flex flex-col bg-gradient-to-b from-amber-50 to-teal-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-green-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HeySafeLogo size="small" showSubtitle={false} />
            {user && (
              <div className={`text-xs px-2 py-1 rounded-full bg-amber-100 ${getRoleColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <NavLink to="/home/profile" className="text-sm text-blue-600 hover:text-blue-800">
              <User size={16} />
            </NavLink>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 bg-white/80 backdrop-blur border-t border-green-200">
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


