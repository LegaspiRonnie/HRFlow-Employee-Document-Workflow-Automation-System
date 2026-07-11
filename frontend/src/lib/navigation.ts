import type { Role } from '../types/auth'

export interface NavItem {
  label: string
  to: string
  /** Which roles see this item in the sidebar. */
  roles: Role[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

const ALL: Role[] = ['employee', 'manager', 'hr_admin']

/**
 * The single source of truth for the sidebar. RoleRoute (per-route guard)
 * and this list must agree — both key off the same Role type.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'General',
    items: [
      { label: 'Dashboard', to: '/dashboard', roles: ALL },
      { label: 'My Profile', to: '/profile', roles: ALL },
      { label: 'Notifications', to: '/notifications', roles: ALL },
    ],
  },
  {
    title: 'Documents',
    items: [
      { label: 'Request Document', to: '/requests/new', roles: ALL },
      { label: 'My Requests', to: '/requests', roles: ALL },
    ],
  },
  {
    title: 'Manager',
    items: [
      { label: 'Approval Queue', to: '/manager/queue', roles: ['manager', 'hr_admin'] },
      { label: 'Team History', to: '/manager/history', roles: ['manager', 'hr_admin'] },
    ],
  },
  {
    title: 'HR Administration',
    items: [
      { label: 'HR Verification', to: '/hr/verifications', roles: ['hr_admin'] },
      { label: 'Employees', to: '/hr/employees', roles: ['hr_admin'] },
      { label: 'Departments', to: '/hr/departments', roles: ['hr_admin'] },
      { label: 'Positions', to: '/hr/positions', roles: ['hr_admin'] },
      { label: 'Templates', to: '/hr/templates', roles: ['hr_admin'] },
      { label: 'Reports', to: '/hr/reports', roles: ['hr_admin'] },
      { label: 'Audit Logs', to: '/hr/audit-logs', roles: ['hr_admin'] },
    ],
  },
]

/** Sidebar sections visible to a given role (empty sections dropped). */
export function sectionsForRole(role: Role): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0)
}
