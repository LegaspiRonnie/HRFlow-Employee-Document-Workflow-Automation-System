{{-- Master PDF layout: letterhead + template body + signature + QR footer.
     Rendered by DomPDF; keep CSS simple (no flexbox/grid — tables only). --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page { margin: 90px 70px 110px 70px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1e293b; }

        header {
            position: fixed; top: -60px; left: 0; right: 0;
            border-bottom: 2px solid #4338ca; padding-bottom: 8px;
        }
        .company { font-size: 18px; font-weight: bold; color: #4338ca; }
        .tagline { font-size: 9px; color: #64748b; }

        h1.doc-title { text-align: center; font-size: 16px; text-transform: uppercase;
                       letter-spacing: 2px; margin: 10px 0 4px 0; }
        .doc-number { text-align: center; font-size: 10px; color: #64748b; margin-bottom: 24px; }

        .body-content { line-height: 1.7; text-align: justify; }
        .body-content p { margin: 0 0 12px 0; }

        table.signature { width: 100%; margin-top: 40px; }
        .sign-name { font-weight: bold; border-top: 1px solid #1e293b;
                     display: inline-block; padding-top: 4px; min-width: 200px; }
        .sign-role { font-size: 10px; color: #64748b; }

        footer {
            position: fixed; bottom: -90px; left: 0; right: 0;
            border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 8px; color: #64748b;
        }
        footer table { width: 100%; }
        .hash { font-family: DejaVu Sans Mono, monospace; font-size: 7px; word-break: break-all; }
    </style>
</head>
<body>
    <header>
        <span class="company">{{ config('app.company_name') }}</span><br>
        <span class="tagline">Employee Document &amp; Workflow Automation · {{ config('app.frontend_url') }}</span>
    </header>

    <main>
        <h1 class="doc-title">{{ $title }}</h1>
        <p class="doc-number">Document No. {{ $documentNumber }} · Version {{ $version }} · Issued {{ $issuedAt->format('F j, Y') }}</p>

        <div class="body-content">
            {!! $body !!}
        </div>

        <table class="signature">
            <tr>
                <td style="width: 55%;"></td>
                <td>
                    <span class="sign-name">{{ $signedBy }}</span><br>
                    <span class="sign-role">HR Administrator — digitally signed</span>
                </td>
            </tr>
        </table>
    </main>

    <footer>
        <table>
            <tr>
                <td style="width: 100px; vertical-align: top;">
                    <img src="{{ $qrDataUri }}" style="width: 85px; height: 85px;" alt="QR verification code">
                </td>
                <td style="vertical-align: top; padding-left: 10px;">
                    <strong>Verify this document:</strong> scan the QR code or visit<br>
                    {{ $verifyUrl }}<br>
                    Valid until {{ $expiresAt->format('F j, Y') }} ·
                    Digital signature: <span class="hash">{{ $signatureHash }}</span>
                </td>
            </tr>
        </table>
    </footer>
</body>
</html>
