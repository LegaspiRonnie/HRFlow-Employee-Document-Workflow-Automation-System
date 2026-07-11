<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** HR-only viewer over the append-only audit trail, with filters. */
class AuditLogController extends Controller
{
    /**
     * GET /hr/audit-logs?action=&user_id=&date_from=&date_to=&page=
     * Newest first, 25 per page.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user:id,name')->orderByDesc('created_at')->orderByDesc('id');

        if ($action = $request->query('action')) {
            $query->where('action', 'like', "{$action}%"); // prefix filter, e.g. "request."
        }
        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }
        if ($from = $request->query('date_from')) {
            $query->where('created_at', '>=', $from.' 00:00:00');
        }
        if ($to = $request->query('date_to')) {
            $query->where('created_at', '<=', $to.' 23:59:59');
        }

        $page = $query->paginate(25);

        return response()->json([
            'data' => collect($page->items())->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'user' => $log->user ? ['id' => $log->user->id, 'name' => $log->user->name] : null,
                'subject_type' => $log->subject_type,
                'subject_id' => $log->subject_id,
                'details' => $log->details,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'total' => $page->total(),
            ],
        ]);
    }
}
