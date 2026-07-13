import type { Role } from '../types/auth'

export interface NavItem {
  label: string
  to: string
  /** Icon name resolved by <Icon /> (components/icons.tsx). */
  icon: string
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
      { label: 'Dashboard', to: '/dashboard', icon: 'home', roles: ALL },
      { label: 'My Profile', to: '/profile', icon: 'user', roles: ALL },
      { label: 'Notifications', to: '/notifications', icon: 'bell', roles: ALL },
    ],
  },
  {
    title: 'Documents',
    items: [
      { label: 'Request Document', to: '/requests/new', icon: 'document-plus', roles: ALL },
      { label: 'My Requests', to: '/requests', icon: 'document-text', roles: ALL },
    ],
  },
  {
    title: 'Manager',
    items: [
      { label: 'Approval Queue', to: '/manager/queue', icon: 'inbox', roles: ['manager', 'hr_admin'] },
      { label: 'Team History', to: '/manager/history', icon: 'clock', roles: ['manager', 'hr_admin'] },
    ],
  },
  {
    title: 'HR Administration',
    items: [
      { label: 'HR Verification', to: '/hr/verifications', icon: 'check-badge', roles: ['hr_admin'] },
      { label: 'Employees', to: '/hr/employees', icon: 'users', roles: ['hr_admin'] },
      { label: 'Departments', to: '/hr/departments', icon: 'building', roles: ['hr_admin'] },
      { label: 'Positions', to: '/hr/positions', icon: 'briefcase', roles: ['hr_admin'] },
      { label: 'Templates', to: '/hr/templates', icon: 'document-duplicate', roles: ['hr_admin'] },
      { label: 'Reports', to: '/hr/reports', icon: 'chart-bar', roles: ['hr_admin'] },
      { label: 'Audit Logs', to: '/hr/audit-logs', icon: 'shield-check', roles: ['hr_admin'] },
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
