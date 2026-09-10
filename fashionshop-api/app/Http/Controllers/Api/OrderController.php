<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
       $orders = Order::with('details')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
        $order->total_quantity = $order->details->sum('quantity');
        $order->order_date = $order->created_at;
        return $order;
    });
        return response()->json($orders);
    }
  
    public function show(Request $request, $id)
    {
        $order = Order::with('details.product')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'details' => $order->details->map(function ($detail) {
                $detail->product->size = $detail->size;
                $detail->total = $detail->price * $detail->quantity;
                return $detail;
            }),
            'order' => $order
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'fullname' => 'required|string',
            'phone'    => 'required|regex:/^[0-9]{9,11}$/',
            'address'  => 'required|string',
            'payment'  => 'required|in:COD',
        ]);

        $cartItems = Cart::with('product')
            ->where('user_id', $request->user()->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng trống'], 400);
        }

        // Báo sớm cho khách biết món nào không đủ hàng, trước khi vào giao dịch
        $thieu = $cartItems->filter(
            fn ($item) => ! $item->product || $item->product->so_luong < $item->quantity
        );

        if ($thieu->isNotEmpty()) {
            return response()->json([
                'message' => 'Một số sản phẩm không đủ số lượng trong kho',
                'items'   => $thieu->map(fn ($item) => [
                    'product_id' => $item->product_id,
                    'ten_sp'     => $item->product->ten_sp ?? null,
                    'yeu_cau'    => $item->quantity,
                    'con_lai'    => $item->product->so_luong ?? 0,
                ])->values(),
            ], 422);
        }

        $shippingFee = 30000;
        $total = $cartItems->sum(fn ($item) => $item->product->gia * $item->quantity) + $shippingFee;

        try {
            $order = DB::transaction(function () use ($request, $cartItems, $total) {
                $order = Order::create([
                    'user_id'  => $request->user()->id,
                    'fullname' => $request->fullname,
                    'phone'    => $request->phone,
                    'address'  => $request->address,
                    'payment'  => $request->payment,
                    'total'    => $total,
                    'status'   => 'pending',
                ]);

                foreach ($cartItems as $item) {
                    // Trừ kho kèm điều kiện còn đủ hàng: nếu có người khác vừa
                    // mua hết trong lúc này thì không dòng nào bị cập nhật và
                    // cả giao dịch bị huỷ, tránh bán quá số lượng đang có.
                    $daTru = Product::where('id', $item->product_id)
                        ->where('so_luong', '>=', $item->quantity)
                        ->decrement('so_luong', $item->quantity);

                    if ($daTru === 0) {
                        throw new \RuntimeException($item->product->ten_sp ?? 'Sản phẩm');
                    }

                    OrderDetail::create([
                        'order_id'   => $order->id,
                        'product_id' => $item->product_id,
                        'quantity'   => $item->quantity,
                        'price'      => $item->product->gia,
                        'size'       => $item->size,
                    ]);
                }

                Cart::where('user_id', $request->user()->id)->delete();

                return $order;
            });
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => "Sản phẩm \"{$e->getMessage()}\" vừa hết hàng, vui lòng thử lại",
            ], 422);
        }

        return response()->json([
            'message'      => 'Đặt hàng thành công',
            'shipping_fee' => $shippingFee,
            'order'        => $order->load('details'),
        ], 200);
    }

    public function cancel(Request $request, $id)
    {
        $order = Order::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Không thể hủy đơn hàng này'
            ], 400);
        }

        // Huỷ đơn thì trả hàng về kho, gộp cùng một giao dịch để không rơi vào
        // cảnh đơn đã huỷ nhưng kho chưa được cộng lại
        DB::transaction(function () use ($order) {
            $order->restoreStock();
            $order->update(['status' => 'cancelled']);
        });

        return response()->json([
            'message'    => 'Đã hủy đơn hàng',
            'status'     => 'cancelled',
            'updated_at' => $order->updated_at,
        ], 200);
    }

}