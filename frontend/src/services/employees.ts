import api from '../lib/api'
import type { Employee, EmployeeInput, ManagerOption } from '../types/employees'

/** Strips empty-string optionals so Laravel's 'nullable' rules see null. */
function toPayload(input: EmployeeInput, includePassword: boolean) {
  return {
    name: input.name,
    email: input.email,
    ...(includePassword || input.password ? { password: input.password } : {}),
    role: input.role,
    department_id: input.department_id,
    position_id: input.position_id,
    manager_id: input.manager_id === '' ? null : input.manager_id,
    date_hired: input.date_hired,
    phone: input.phone || null,
    address: input.address || null,
    salary: input.salary === '' ? null : input.salary,
    status: input.status,
  }
}

export async function listEmployees(search?: string): Promise<Employee[]> {
  const { data } = await api.get<{ data: Employee[] }>('/employees', {
    params: search ? { search } : undefined,
  })
  return data.data
}

export async function listManagerOptions(): Promise<ManagerOption[]> {
  const { data } = await api.get<{ data: ManagerOption[] }>('/employees/managers')
  return data.data
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  const { data } = await api.post<{ data: Employee }>('/employees', toPayload(input, true))
  return data.data
}

export async function updateEmployee(id: number, input: EmployeeInput): Promise<Employee> {
  const { data } = await api.put<{ data: Employee }>(`/employees/${id}`, toPayload(input, false))
  return data.data
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/employees/${id}`)
}

/** Own record — available to every authenticated role. */
export async function getProfile(): Promise<Employee> {
  const { data } = await api.get<{ data: Employee }>('/profile')
  return data.data
}

export async function updateProfile(input: { phone: string; address: string }): Promise<Employee> {
  const { data } = await api.put<{ data: Employee }>('/profile', {
    phone: input.phone || null,
    address: input.address || null,
  })
  return data.data
}
