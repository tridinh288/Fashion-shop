<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = Cart::with('product')
            ->where('user_id', $request->user()->id)
            ->where('quantity', '>', 0)
            ->get();

        $total_price = $cart->sum(
            fn($item) => $item->product->price * $item->quantity
        );

        return response()->json([
            'items' => $cart,
            'data' => $cart,
            'total_price' => $total_price,
        ]);
    }

    public function store(Request $request)
    {
        $validator = \Validator::make($request->all(), [
    'product_id' => 'required|exists:products,id',
    'quantity'   => 'required|integer|min:1|max:50',
    'size'       => 'required|in:S,M,L,XL',
]);

if ($validator->fails()) {

    if ($validator->errors()->has('size')) {
        return response()->json([
            'message' => 'Size không hợp lệ',
            'errors' => [
                'size' => $validator->errors()->get('size')
            ]
        ], 200);
    }

    return response()->json([
        'message' => 'Dữ liệu không hợp lệ',
        'errors' => $validator->errors()
    ], 200);
}
        $cart = Cart::where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->where('size', $request->size)
            ->first();

        if ($cart) {
            $cart->increment('quantity', $request->quantity);
        } else {
            $cart = Cart::create([
                'user_id'    => $request->user()->id,
                'product_id' => $request->product_id,
                'quantity'   => $request->quantity,
                'size'       => $request->size,
            ]);
        }

        return response()->json(['message' => 'Đã thêm vào giỏ hàng', 'cart' => $cart]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = Cart::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $cart->update([
            'quantity' => $request->quantity
        ]);

        $total_price = Cart::with('product')
            ->where('user_id', $request->user()->id)
            ->get()
            ->sum(fn($item) => $item->product->price * $item->quantity);

        return response()->json([
            'message' => 'Đã cập nhật giỏ hàng',
            'cart' => $cart->fresh(),
            'total_price' => $total_price
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $cart = Cart::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$cart) {
            return response()->json([
                'message' => 'ID không hợp lệ',
                'deleted_cart_id' => null
            ], 200);
        }

        $deletedCartId = $cart->id;

        $cart->delete();

        return response()->json([
            'message' => 'Đã xóa sản phẩm khỏi giỏ hàng',
            'deleted_cart_id' => $deletedCartId
        ], 200);
    }
}