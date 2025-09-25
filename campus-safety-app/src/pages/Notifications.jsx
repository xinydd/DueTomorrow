import { useSecurity } from '../state/SecurityContext.jsx'
import NotificationTabs from '../ui/NotificationTabs.jsx'

export default function Notifications() {
  const { alerts, lastUpdated } = useSecurity()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="flex items-center gap-1 text-xs text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>
      <NotificationTabs alerts={alerts} lastUpdated={lastUpdated} />
    </div>
  )
}


