<?php

namespace App\Exports;

use App\Models\DocumentRequest;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/** Company-wide request report, one row per request (HR export). */
class DocumentRequestsExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping
{
    public function collection()
    {
        return DocumentRequest::with([
            'employee.user', 'employee.department', 'documentType', 'generatedDocument',
        ])->latest()->get();
    }

    /** @return array<int, string> */
    public function headings(): array
    {
        return [
            'Request ID', 'Employee', 'Employee Code', 'Department', 'Document Type',
            'Purpose', 'Status', 'Document No.', 'Submitted At', 'Last Update',
        ];
    }

    /** @param DocumentRequest $row */
    public function map($row): array
    {
        return [
            $row->id,
            $row->employee->user->name,
            $row->employee->employee_code,
            $row->employee->department->name,
            $row->documentType->name,
            $row->purpose,
            $row->status->label(),
            $row->generatedDocument?->document_number ?? '—',
            $row->created_at->format('Y-m-d H:i'),
            $row->updated_at->format('Y-m-d H:i'),
        ];
    }
}
