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

/**
 * Downloads a generated PDF through the authorized endpoint and hands
 * it to the browser as a file save (blob + temporary anchor).
 */
export async function downloadDocument(documentId: number, filename: string): Promise<void> {
  const { data } = await api.get<Blob>(`/documents/${documentId}/download`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Result of the public QR verification endpoint. */
export interface VerificationResult {
  valid: boolean
  expired?: boolean
  document_number?: string
  version?: number
  document_type?: string
  employee_name?: string
  signed_by?: string
  issued_at?: string
  expires_at?: string | null
}

/** Public — no auth required; what the QR code points at. */
export async function verifyDocument(token: string): Promise<VerificationResult> {
  const { data } = await api.get<VerificationResult>(`/verify/${token}`)
  return data
}
