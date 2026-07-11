import type { RequestStatus } from '../types/requests'
import { STATUS_STYLES } from '../types/requests'

/** Colored pill for a request's workflow status. */
export default function StatusBadge({ status, label }: { status: RequestStatus; label: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {label}
    </span>
  )
}
