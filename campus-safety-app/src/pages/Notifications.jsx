import { useSecurity } from '../state/SecurityContext.jsx'
import NotificationTabs from '../ui/NotificationTabs.jsx'
import InfoCard from '../ui/InfoCard.jsx'
import { AlertTriangle, Users, Route } from 'lucide-react'

export default function Notifications() {
  const { 
    alerts, 
    lastUpdated, 
    guardians, 
    nearbyGuardians, 
    refreshData 
  } = useSecurity()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Notifications</h2>
        <div className="flex items-center gap-1 text-xs text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>
      
      <div className="grid gap-3">
        <InfoCard 
          title="Security Alerts" 
          items={alerts.map(a => ({
            title: a.title,
            subtitle: a.time,
            badge: a.level,
            icon: AlertTriangle,
            description: a.description || `Security alert reported at ${a.location || 'campus location'}`
          }))} 
          isLive={true}
          lastUpdated={lastUpdated}
          onRefresh={refreshData}
        />

        <InfoCard 
          title="Guardian Angels Status" 
          items={nearbyGuardians.length > 0 ? nearbyGuardians.map(g => ({
            title: g.name,
            subtitle: g.distanceText || g.distance,
            badge: g.role,
            icon: Users,
            description: g.available ? 'Available for assistance' : 'Currently busy'
          })) : guardians.map(g => ({
            title: g.name,
            subtitle: g.distance,
            badge: g.role,
            icon: Users,
            description: g.available ? 'Available for assistance' : 'Currently busy'
          }))} 
          isLive={true}
          lastUpdated={lastUpdated}
          onRefresh={refreshData}
        />

        <InfoCard 
          title="Route Updates" 
          items={[
            { 
              title: 'Library → Dorm A Route Updated', 
              subtitle: '2 min ago • Route optimized', 
              badge: 'safe',
              icon: Route,
              description: 'New lighting installed along the path, route is now safer'
            },
            { 
              title: 'Gym → Parking P2 Warning', 
              subtitle: '15 min ago • Low lighting reported', 
              badge: 'caution',
              icon: Route,
              description: 'Temporary lighting issue reported, use alternative route if possible'
            },
            { 
              title: 'Cafeteria → Study Hall Clear', 
              subtitle: '30 min ago • All clear', 
              badge: 'safe',
              icon: Route,
              description: 'Route is clear and safe for use'
            }
          ]} 
          isLive={true}
          lastUpdated={lastUpdated}
          onRefresh={refreshData}
        />
      </div>
      
      <NotificationTabs alerts={alerts} lastUpdated={lastUpdated} />
    </div>
  )
}


