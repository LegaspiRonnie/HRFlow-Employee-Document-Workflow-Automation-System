import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import * as documentsApi from '../services/documents'
import type { VerificationResult } from '../services/documents'
import { Icon, LogoMark } from '../components/icons'

/**
 * PUBLIC page behind every document's QR code. Anyone (an embassy, a
 * bank) can confirm a certificate is genuine without logging in — so
 * this page has to look like an official company verification desk.
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
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-xl bg-white shadow-md">
          {/* branded letterhead */}
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-950 px-6 py-4 text-white">
            <LogoMark className="h-9 w-9" />
            <div>
              <p className="font-bold leading-tight">HRFlow</p>
              <p className="text-xs text-slate-400">Official Document Verification</p>
            </div>
          </div>

          <div className="p-6">
            {!result && !notFound && !error && (
              <p className="py-6 text-center text-sm text-slate-400">Verifying document…</p>
            )}

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {notFound && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
                  ✕
                </span>
                <p className="mt-3 text-lg font-bold text-red-700">Invalid document</p>
                <p className="mt-1 text-sm text-red-600">
                  This verification code does not match any document issued by HRFlow.
                </p>
              </div>
            )}

            {result && (
              <>
                <div
                  className={`rounded-lg border p-5 text-center ${
                    result.valid ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                  }`}
                >
                  <span
                    className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
                      result.valid ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    <Icon name={result.valid ? 'check-badge' : 'clock'} className="h-6 w-6" />
                  </span>
                  <p
                    className={`mt-3 text-lg font-bold ${
                      result.valid ? 'text-green-700' : 'text-amber-700'
                    }`}
                  >
                    {result.valid ? 'Authentic document' : 'Authentic but expired'}
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
                    <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-1.5">
                      <dt className="shrink-0 text-slate-400">{label}</dt>
                      <dd className="text-right font-medium text-slate-700">{value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Scanned from a document QR code · © {new Date().getFullYear()} HRFlow Corporation
        </p>
      </div>
    </div>
  )
}
