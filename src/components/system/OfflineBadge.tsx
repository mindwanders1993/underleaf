import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import './OfflineBadge.css'

const OfflineBadge = () => {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="ul-offline-badge" role="status" data-testid="ul-offline-badge">
      <span className="ul-offline-badge__dot" />
      Offline — local edits still work
    </div>
  )
}

export default OfflineBadge
