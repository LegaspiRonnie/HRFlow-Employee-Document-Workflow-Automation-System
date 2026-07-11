/** Mirrors DocumentTypeResource on the backend. */
export interface DocumentTemplate {
  id: number
  body: string
  is_active: boolean
  updated_at: string
}

export interface DocumentType {
  id: number
  name: string
  code: string
  description: string | null
  template?: DocumentTemplate // present only on HR template endpoints
}

/** Placeholders available in template bodies — keep in sync with backend. */
export const TEMPLATE_PLACEHOLDERS = [
  '{{employee_name}}',
  '{{employee_code}}',
  '{{position}}',
  '{{department}}',
  '{{date_hired}}',
  '{{salary}}',
  '{{purpose}}',
  '{{current_date}}',
  '{{company_name}}',
  '{{document_number}}',
] as const
