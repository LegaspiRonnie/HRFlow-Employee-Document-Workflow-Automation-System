import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import * as documentsApi from '../services/documents'
import type { VerificationResult } from '../services/documents'

/**
 * PUBLIC page behind every document's QR code. Anyone (an embassy, a
 * bank) can confirm a certificate is genuine without logging in.
 */
export default function VerifyPage() {
  const { token } = useParams<{ token: string }>()
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    documentsApi
      .verifyDocument(token)
      .then(setResult)
      .catch((err) => {
        if (isAxiosError(err) && err.response?.status === 404) setNotFound(true)
        else setError('Verification service unavailable — try again later.')
      })
  }, [token])

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-white shadow-md p-8">
        <h1 className="text-center text-2xl font-bold text-slate-800">HRFlow</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Document Verification</p>

        <div className="mt-6">
          {!result && !notFound && !error && (
            <p className="text-center text-sm text-slate-400">Verifying…</p>
          )}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          {notFound && (
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-lg font-bold text-red-700">✕ Invalid document</p>
              <p className="mt-1 text-sm text-red-600">
                This verification code does not match any document issued by HRFlow.
              </p>
            </div>
          )}

          {result && (
            <>
              <div className={`rounded-lg p-4 text-center ${result.valid ? 'bg-green-50' : 'bg-amber-50'}`}>
                <p className={`text-lg font-bold ${result.valid ? 'text-green-700' : 'text-amber-700'}`}>
                  {result.valid ? '✓ Authentic document' : '⚠ Authentic but expired'}
                </p>
                <p className={`mt-1 text-sm ${result.valid ? 'text-green-600' : 'text-amber-600'}`}>
                  {result.valid
                    ? 'This document was issued by HRFlow and is currently valid.'
                    : 'This document was genuinely issued but its validity period has lapsed.'}
                </p>
              </div>

              <dl className="mt-5 space-y-2 text-sm">
                {(
                  [
                    ['Document No.', `${result.document_number} (v${result.version})`],
                    ['Type', result.document_type],
                    ['Issued to', result.employee_name],
                    ['Signed by', result.signed_by],
                    ['Issued on', result.issued_at],
                    ['Valid until', result.expires_at ?? '—'],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-slate-100 pb-1.5">
                    <dt className="text-slate-400">{label}</dt>
                    <dd className="font-medium text-slate-700">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
