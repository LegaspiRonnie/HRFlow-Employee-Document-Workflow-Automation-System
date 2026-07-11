import api from '../lib/api'
import type { Department, DepartmentInput, Position, PositionInput } from '../types/org'

/** Typed service layer for departments & positions (HR admin only). */

export async function listDepartments(): Promise<Department[]> {
  const { data } = await api.get<{ data: Department[] }>('/departments')
  return data.data
}

export async function createDepartment(input: DepartmentInput): Promise<Department> {
  const { data } = await api.post<{ data: Department }>('/departments', input)
  return data.data
}

export async function updateDepartment(id: number, input: DepartmentInput): Promise<Department> {
  const { data } = await api.put<{ data: Department }>(`/departments/${id}`, input)
  return data.data
}

export async function deleteDepartment(id: number): Promise<void> {
  await api.delete(`/departments/${id}`)
}

export async function listPositions(): Promise<Position[]> {
  const { data } = await api.get<{ data: Position[] }>('/positions')
  return data.data
}

export async function createPosition(input: PositionInput): Promise<Position> {
  const { data } = await api.post<{ data: Position }>('/positions', input)
  return data.data
}

export async function updatePosition(id: number, input: PositionInput): Promise<Position> {
  const { data } = await api.put<{ data: Position }>(`/positions/${id}`, input)
  return data.data
}

export async function deletePosition(id: number): Promise<void> {
  await api.delete(`/positions/${id}`)
}
