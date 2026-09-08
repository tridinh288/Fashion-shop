<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->filled('keyword')) {
            $query->where('ten_sp', 'LIKE', "%{$request->keyword}%");
        }

        $products = $query->paginate(10);

        $products->appends([
            'keyword' => $request->keyword ?? ''
        ]);

        return response()->json(
            array_merge($products->toArray(), [
                'success' => true
            ])
        );
    }


    public function store(Request $request)
    {
        $request->validate([
            'ten_sp'      => 'required|string',
            'gia'         => 'required|integer|min:0',
            'gia_cu'      => 'nullable|integer|min:0',
            'mo_ta'       => 'nullable|string',
            'so_luong'    => 'required|integer|min:0',
            'gioi_tinh'   => 'required|in:0,1',
            'category_id' => 'nullable|exists:categories,id',
            'hinh_anh'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $hinh_anh = null;
        if ($request->hasFile('hinh_anh')) {
            $hinh_anh = $request->file('hinh_anh')->store('products', 'public');
        }

        $product = Product::create([
            'ten_sp'      => $request->ten_sp,
            'gia'         => $request->gia,
            'gia_cu'      => $request->gia_cu,
            'mo_ta'       => $request->mo_ta,
            'so_luong'    => $request->so_luong,
            'gioi_tinh'   => $request->gioi_tinh,
            'category_id' => $request->category_id,
            'hinh_anh'    => $hinh_anh,
        ]);
        
        $product->load('category');
        return response()->json(['success' => true, 'message' => 'Đã thêm sản phẩm', 'product' => $product], 201);

    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'ten_sp'      => 'required|string',
            'gia'         => 'required|integer|min:0',
            'gia_cu'      => 'nullable|integer|min:0',
            'mo_ta'       => 'nullable|string',
            'so_luong'    => 'required|integer|min:0',
            'gioi_tinh'   => 'required|in:0,1',
            'category_id' => 'nullable|exists:categories,id',
            'hinh_anh'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('hinh_anh')) {
            $anh_cu = $product->hinh_anh;
            $product->hinh_anh = $request->file('hinh_anh')->store('products', 'public');

            if ($anh_cu && $anh_cu !== $product->hinh_anh) {
                Storage::disk('public')->delete($anh_cu);
            }
        }

        $product->update($request->except('hinh_anh'));
        $product->load('category');
        return response()->json(['success' => true, 'message' => 'Đã cập nhật sản phẩm', 'product' => $product]);
    }

    public function destroy($id)
        {
            Product::findOrFail($id)->delete();
            
            return response()->json([
                'success'=> true,
                'message' => 'Đã xóa sản phẩm',
                'id'      => (int) $id,
                ]);
        }
}