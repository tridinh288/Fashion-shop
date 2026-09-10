<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Gom doanh thu và số đơn theo từng trạng thái trong một truy vấn
        $byStatus = Order::query()
            ->select('status', DB::raw('COUNT(*) as so_don'), DB::raw('SUM(total) as tien'))
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $tien = fn (string $status) => (int) ($byStatus[$status]->tien ?? 0);
        $soDon = fn (string $status) => (int) ($byStatus[$status]->so_don ?? 0);

        // Doanh thu thực nhận: chỉ tính đơn đã hoàn thành
        $doanhThu = $tien('completed');

        // Doanh thu dự kiến: đơn chờ xử lý và đang giao, chưa chắc chắn nhưng
        // vẫn còn khả năng thu được. Đơn đã huỷ không tính vào đâu cả.
        $duKien = $tien('pending') + $tien('shipping');

        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(7)
            ->get();

        $data = [
            'total_revenue'  => $doanhThu,
            'total_orders'   => Order::count(),
            'total_users'    => User::count(),
            'total_products' => Product::count(),

            // Bóc tách theo trạng thái để trang quản trị hiển thị rõ ràng
            'revenue' => [
                'completed' => $doanhThu,
                'pending'   => $tien('pending'),
                'shipping'  => $tien('shipping'),
                'expected'  => $duKien,
                'cancelled' => $tien('cancelled'),
            ],
            'order_counts' => [
                'completed' => $soDon('completed'),
                'pending'   => $soDon('pending'),
                'shipping'  => $soDon('shipping'),
                'cancelled' => $soDon('cancelled'),
            ],

            'recent_orders'  => $recentOrders,
            'latest_orders'  => $recentOrders,
        ];

        return response()->json(array_merge($data, ['data' => $data]));
    }
}
