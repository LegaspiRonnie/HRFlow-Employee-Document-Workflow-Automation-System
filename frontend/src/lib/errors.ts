import { isAxiosError } from 'axios'

/**
 * Turns any thrown error into a user-readable message. Laravel sends
 * { message, errors? } — we prefer the first field-level error because
 * "The code has already been taken." beats "The given data was invalid."
 */
export function getApiError(err: unknown): string {
  if (isAxiosError(err) && err.response) {
    const data = err.response.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined
    const firstFieldError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined
    return firstFieldError ?? data?.message ?? `Request failed (${err.response.status}).`
  }
  return 'Cannot reach the server — is the API running?'
}
