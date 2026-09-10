<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('user')->orderBy('created_at', 'desc');

        // Không truyền status nghĩa là xem tất cả, không mặc định về "pending"
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->keyword) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('user', function ($q2) use ($request) {
                    $q2->where('fullname', 'LIKE', "%{$request->keyword}%");
                })->orWhere('id', $request->keyword);
            });
        }

        return response()->json($query->paginate(10));
    }

    public function show($id)
    {
        $order = Order::with(['user', 'details.product'])->findOrFail($id);

        return response()->json($this->normalizeDetails($order));
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,shipping,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $moi = $request->status;

        if (! $order->canTransitionTo($moi)) {
            return response()->json([
                'message' => "Không thể chuyển từ '{$order->status}' sang '{$moi}'",
            ], 422);
        }

        // Huỷ đơn thì trả hàng về kho. Gộp cùng giao dịch với việc đổi trạng
        // thái để không rơi vào cảnh đơn đã huỷ mà kho chưa được cộng lại.
        DB::transaction(function () use ($order, $moi) {
            if ($moi === 'cancelled') {
                $order->restoreStock();
            }

            $order->update(['status' => $moi]);
        });

        $order->load(['user', 'details.product']);

        return response()->json([
            'message' => 'Đã cập nhật trạng thái',
            'order'   => $this->normalizeDetails($order),
        ]);
    }

    /**
     * Đặt tên thuộc tính sản phẩm theo đúng chuẩn mà client mong đợi,
     * thay vì để lộ tên cột tiếng Việt trong bảng.
     */
    private function normalizeDetails(Order $order): Order
    {
        $order->details->each(function ($detail) {
            if ($detail->product) {
                $detail->product->name = $detail->product->ten_sp;
                $detail->product->current_price = $detail->product->gia;
                $detail->product->makeHidden(['ten_sp', 'gia', 'gia_cu']);
            }
        });

        return $order;
    }
}
