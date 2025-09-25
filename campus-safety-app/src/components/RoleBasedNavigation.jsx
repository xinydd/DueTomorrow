import { useSecurity } from '../state/SecurityContext.jsx'
import { MapPin, Users, AlertTriangle, FileText, Shield, Settings } from 'lucide-react'

const RoleBasedNavigation = () => {
  const { user, hasRole, hasAnyRole } = useSecurity()

  if (!user) return null

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Home', path: '/home', icon: MapPin, roles: ['student', 'staff', 'security'] },
      { name: 'Map', path: '/map', icon: MapPin, roles: ['student', 'staff', 'security'] },
      { name: 'Notifications', path: '/notifications', icon: AlertTriangle, roles: ['student', 'staff', 'security'] },
      { name: 'Profile', path: '/profile', icon: Settings, roles: ['student', 'staff', 'security'] }
    ]

    // Add role-specific items
    if (hasRole('student')) {
      return [
        ...baseItems,
        { name: 'SOS Alert', path: '/sos', icon: AlertTriangle, roles: ['student'] },
        { name: 'Report Incident', path: '/report', icon: FileText, roles: ['student'] }
      ]
    }

    if (hasRole('staff')) {
      return [
        ...baseItems,
        { name: 'View Reports', path: '/reports', icon: FileText, roles: ['staff', 'security'] },
        { name: 'Guardian Angels', path: '/guardians', icon: Users, roles: ['staff'] }
      ]
    }

    if (hasRole('security')) {
      return [
        ...baseItems,
        { name: 'SOS Alerts', path: '/alerts', icon: AlertTriangle, roles: ['security'] },
        { name: 'View Reports', path: '/reports', icon: FileText, roles: ['staff', 'security'] },
        { name: 'Patrol Map', path: '/patrol', icon: Shield, roles: ['security'] }
      ]
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon
        return (
          <a
            key={item.name}
            href={item.path}
            className="flex items-center space-x-3 px-4 py-3 text-green-800 hover:bg-amber-100 rounded-xl transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </a>
        )
      })}
    </div>
  )
}

export default RoleBasedNavigation
