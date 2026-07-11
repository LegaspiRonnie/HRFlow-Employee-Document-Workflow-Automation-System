import type { DocumentType } from './documents'
import type { Employee } from './employees'

/** Mirrors App\Enums\RequestStatus on the backend. */
export type RequestStatus =
  | 'pending_manager'
  | 'manager_rejected'
  | 'pending_hr'
  | 'hr_rejected'
  | 'completed'

/** A manager/HR decision on a request (populated from Feature 7 on). */
export interface RequestApproval {
  id: number
  stage: 'manager' | 'hr'
  action: 'approved' | 'rejected'
  comments: string | null
  approver: { id: number; name: string }
  created_at: string
}

/** Generated PDF metadata (populated from Feature 9 on). */
export interface GeneratedDocumentMeta {
  id: number
  document_number: string
  version: number
  expires_at: string | null
  created_at: string
}

export interface DocumentRequest {
  id: number
  purpose: string
  status: RequestStatus
  status_label: string
  document_type: DocumentType
  employee?: Employee // present on manager/HR queues
  approvals?: RequestApproval[]
  generated_document?: GeneratedDocumentMeta | null
  created_at: string
  updated_at: string
}

/** Badge colors per status, used across employee/manager/HR pages. */
export const STATUS_STYLES: Record<RequestStatus, string> = {
  pending_manager: 'bg-amber-100 text-amber-700',
  manager_rejected: 'bg-red-100 text-red-700',
  pending_hr: 'bg-blue-100 text-blue-700',
  hr_rejected: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
}

/**
 * The linear happy path shown by the workflow stepper. A request's
 * progress index within this path:
 *   pending_manager → 1, pending_hr → 2, completed → 3
 * Rejected states stop at the stage that rejected them.
 */
export const WORKFLOW_STEPS = ['Submitted', 'Manager Review', 'HR Verification', 'Document Ready'] as const

export function workflowProgress(status: RequestStatus): { index: number; rejected: boolean } {
  switch (status) {
    case 'pending_manager':
      return { index: 1, rejected: false }
    case 'manager_rejected':
      return { index: 1, rejected: true }
    case 'pending_hr':
      return { index: 2, rejected: false }
    case 'hr_rejected':
      return { index: 2, rejected: true }
    case 'completed':
      return { index: 3, rejected: false }
  }
}
