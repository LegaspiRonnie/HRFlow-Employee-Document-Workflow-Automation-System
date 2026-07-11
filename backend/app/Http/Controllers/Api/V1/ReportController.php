<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\DocumentRequestsExport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/** HR-only Excel exports (Laravel Excel / maatwebsite). */
class ReportController extends Controller
{
    /** GET /hr/reports/requests.xlsx */
    public function requests(): BinaryFileResponse
    {
        $filename = 'hrflow-requests-'.now()->format('Y-m-d').'.xlsx';

        return Excel::download(new DocumentRequestsExport, $filename);
    }
}
