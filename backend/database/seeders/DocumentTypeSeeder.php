<?php

namespace Database\Seeders;

use App\Models\DocumentTemplate;
use App\Models\DocumentType;
use Illuminate\Database\Seeder;

/**
 * The 10 document types HRFlow can generate, each with a starter HTML
 * template HR can edit. Idempotent: existing template bodies are kept
 * (HR edits survive re-seeding); only missing rows are created.
 */
class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->catalog() as $code => [$name, $description, $body]) {
            $type = DocumentType::updateOrCreate(
                ['code' => $code],
                ['name' => $name, 'description' => $description],
            );

            DocumentTemplate::firstOrCreate(
                ['document_type_id' => $type->id],
                ['body' => $body, 'is_active' => true],
            );
        }
    }

    /** @return array<string, array{0: string, 1: string, 2: string}> */
    private function catalog(): array
    {
        $certify = '<p>This is to certify that <strong>{{employee_name}}</strong> ({{employee_code}}) '
            .'is employed by {{company_name}} as <strong>{{position}}</strong> in the '
            .'{{department}} Department since <strong>{{date_hired}}</strong>.</p>';

        $issued = '<p>This document is issued on {{current_date}} upon the request of the '
            .'employee for <em>{{purpose}}</em>.</p>';

        return [
            'EMP_CERT' => [
                'Employment Certificate',
                'Certifies current employment, position, and tenure.',
                $certify.$issued,
            ],
            'EMP_CERT_COMP' => [
                'Certificate of Employment with Compensation',
                'Employment certificate including monthly compensation.',
                $certify
                .'<p>The employee currently receives a monthly compensation of <strong>PHP {{salary}}</strong>.</p>'
                .$issued,
            ],
            'PAYSLIP' => [
                'Payslip',
                'Statement of pay for a given period.',
                '<p>Payslip for <strong>{{employee_name}}</strong> ({{employee_code}}), {{position}}, {{department}} Department.</p>'
                .'<p>Monthly rate: <strong>PHP {{salary}}</strong>. Generated on {{current_date}} for <em>{{purpose}}</em>.</p>',
            ],
            'LEAVE_APP' => [
                'Leave Application Form',
                'Formal leave application form.',
                '<p>Leave application of <strong>{{employee_name}}</strong> ({{employee_code}}), {{position}}, {{department}} Department.</p>'
                .'<p>Reason / details: <em>{{purpose}}</em>.</p>'
                .'<p>Filed on {{current_date}}.</p>',
            ],
            'LEAVE_APPR' => [
                'Leave Approval Form',
                'Official approval of a filed leave.',
                '<p>This confirms that the leave request of <strong>{{employee_name}}</strong> ({{employee_code}}), '
                .'{{position}}, {{department}} Department, has been <strong>APPROVED</strong>.</p>'
                .'<p>Details: <em>{{purpose}}</em>.</p><p>Approved on {{current_date}}.</p>',
            ],
            'EMP_CONTRACT' => [
                'Employment Contract',
                'Contract of employment copy.',
                '<p>This Employment Contract is entered into between {{company_name}} and '
                .'<strong>{{employee_name}}</strong> ({{employee_code}}).</p>'
                .'<p>The employee is engaged as <strong>{{position}}</strong> in the {{department}} Department '
                .'effective <strong>{{date_hired}}</strong> with a monthly compensation of PHP {{salary}}.</p>'
                .$issued,
            ],
            'PERF_EVAL' => [
                'Performance Evaluation Report',
                'Summary of the latest performance evaluation.',
                '<p>Performance Evaluation Report for <strong>{{employee_name}}</strong> ({{employee_code}}), '
                .'{{position}}, {{department}} Department, employed since {{date_hired}}.</p>'
                .'<p>Purpose of issuance: <em>{{purpose}}</em>.</p><p>Issued on {{current_date}}.</p>',
            ],
            'HR_CLEARANCE' => [
                'HR Clearance Form',
                'Clearance of accountabilities from HR.',
                '<p>This certifies that <strong>{{employee_name}}</strong> ({{employee_code}}), {{position}}, '
                .'{{department}} Department, has been cleared of all HR accountabilities.</p>'
                .$issued,
            ],
            'CERT_SERVICE' => [
                'Certificate of Service',
                'Certifies length and record of service.',
                '<p>This is to certify that <strong>{{employee_name}}</strong> ({{employee_code}}) has rendered '
                .'service to {{company_name}} as <strong>{{position}}</strong> in the {{department}} Department '
                .'from <strong>{{date_hired}}</strong> to present.</p>'
                .$issued,
            ],
            'PROMO_LETTER' => [
                'Promotion Letter',
                'Official letter of promotion.',
                '<p>Dear <strong>{{employee_name}}</strong>,</p>'
                .'<p>We are pleased to formalize your promotion to <strong>{{position}}</strong> in the '
                .'{{department}} Department, effective {{current_date}}.</p>'
                .'<p>Congratulations on this well-deserved recognition.</p>',
            ],
        ];
    }
}
