import api from '../lib/api'
import type { DocumentType } from '../types/documents'

/** Requestable document types (active template) — all roles. */
export async function listDocumentTypes(): Promise<DocumentType[]> {
  const { data } = await api.get<{ data: DocumentType[] }>('/document-types')
  return data.data
}

/** All types with editable template bodies — HR only. */
export async function listTemplates(): Promise<DocumentType[]> {
  const { data } = await api.get<{ data: DocumentType[] }>('/document-templates')
  return data.data
}

export async function updateTemplate(
  templateId: number,
  input: { body: string; is_active: boolean },
): Promise<DocumentType> {
  const { data } = await api.put<{ data: DocumentType }>(`/document-templates/${templateId}`, input)
  return data.data
}
