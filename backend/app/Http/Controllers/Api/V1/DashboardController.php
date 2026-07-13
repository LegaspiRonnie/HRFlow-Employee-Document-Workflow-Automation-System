<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RequestStatus;
use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * GET /dashboard — one endpoint, role-shaped payload:
 *   employee  → own request stats
 *   manager   → own stats + team stats
 *   hr_admin  → company-wide stats, trends, and analytics charts
 */
class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        $payload = match ($user->role->value) {
            'hr_admin' => $this->hrStats(),
            'manager' => $this->managerStats($request),
            default => $this->employeeStats($request),
        };

        return response()->json(['data' => $payload]);
    }

    /** @return array<string, int> counts keyed by status for a scoped query */
    private function statusCounts(Builder $query): array
    {
        $counts = (clone $query)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'pending' => (int) ($counts['pending_manager'] ?? 0) + (int) ($counts['pending_hr'] ?? 0),
            'approved' => (int) ($counts['completed'] ?? 0),
            'rejected' => (int) ($counts['manager_rejected'] ?? 0) + (int) ($counts['hr_rejected'] ?? 0),
            'total' => (int) $counts->sum(),
        ];
    }

    private function employeeStats(Request $request): array
    {
        $employee = $request->user()->employee()->first();
        $scope = DocumentRequest::query()->where('employee_id', $employee?->id ?? 0);

        return [
            'role' => 'employee',
            'cards' => $this->statusCounts($scope),
        ];
    }

    private function managerStats(Request $request): array
    {
        $team = DocumentRequest::query()->whereHas(
            'employee',
            fn ($q) => $q->where('manager_id', $request->user()->id),
        );

        return [
            'role' => 'manager',
            'cards' => $this->statusCounts(clone $team) + [
                'awaiting_me' => (clone $team)->where('status', RequestStatus::PendingManager)->count(),
                'team_size' => Employee::where('manager_id', $request->user()->id)->count(),
            ],
            'charts' => [
                'trend' => $this->monthlyTrend(clone $team),
                'most_requested' => $this->mostRequested(clone $team),
            ],
        ];
    }

    private function hrStats(): array
    {
        $all = DocumentRequest::query();

        // average hours from submission to completion (HR verified)
        $hoursExpr = DB::connection()->getDriverName() === 'sqlite'
            ? '(julianday(updated_at) - julianday(created_at)) * 24'
            : 'timestampdiff(HOUR, created_at, updated_at)';
        $avgHours = DocumentRequest::where('status', RequestStatus::Completed)
            ->select(DB::raw("avg($hoursExpr) as avg_hours"))
            ->value('avg_hours');

        return [
            'role' => 'hr_admin',
            'cards' => $this->statusCounts(clone $all) + [
                'employees' => Employee::where('status', 'active')->count(),
                'awaiting_hr' => (clone $all)->where('status', RequestStatus::PendingHr)->count(),
                'avg_approval_hours' => $avgHours !== null ? round((float) $avgHours, 1) : null,
            ],
            'charts' => [
                'trend' => $this->monthlyTrend(clone $all),
                'by_department' => DocumentRequest::join('employees', 'employees.id', '=', 'document_requests.employee_id')
                    ->join('departments', 'departments.id', '=', 'employees.department_id')
                    ->select('departments.name', DB::raw('count(*) as count'))
                    ->groupBy('departments.name')
                    ->orderByDesc('count')
                    ->get(),
                'most_requested' => $this->mostRequested(clone $all),
            ],
        ];
    }

    /** Requests per month for the last 6 months (inclusive of empty months). */
    private function monthlyTrend(Builder $query): array
    {
        $ymExpr = DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "date_format(created_at, '%Y-%m')";
        $raw = $query
            ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->select(DB::raw("$ymExpr as ym"), DB::raw('count(*) as count'))
            ->groupBy('ym')
            ->pluck('count', 'ym');

        $trend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $trend[] = [
                'month' => $month->format('M'),
                'count' => (int) ($raw[$month->format('Y-m')] ?? 0),
            ];
        }

        return $trend;
    }

    /** Top 5 most requested document types for a scoped query. */
    private function mostRequested(Builder $query): array
    {
        return $query
            ->join('document_types', 'document_types.id', '=', 'document_requests.document_type_id')
            ->select('document_types.name', DB::raw('count(*) as count'))
            ->groupBy('document_types.name')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->toArray();
    }
}
