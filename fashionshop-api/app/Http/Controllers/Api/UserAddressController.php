<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\Request;

class UserAddressController extends Controller
{
    public function index(Request $request)
    {
        $addresses = UserAddress::where('user_id', $request->user()->id)
            ->orderBy('is_default', 'desc')
            ->get();

        return response()->json([
            'message' => 'Lấy danh sách địa chỉ thành công',
            'total'   => $addresses->count(),
            'data' => $addresses
        ]);  
}

    public function store(Request $request)
    {
        $request->validate([
            'fullname'        => 'required|string|min:2|max:255',
            'phone'           => 'required|regex:/^[0-9]{9,11}$/',
            'address_details' => 'required|string|min:5|max:500',
        ]);

         if ($request->is_default) {
        UserAddress::where('user_id', $request->user()->id)
            ->update(['is_default' => 0]);
    }
        $address = UserAddress::create([
            'user_id'         => $request->user()->id,
            'fullname'        => $request->fullname,
            'phone'           => $request->phone,
            'address_details' => $request->address_details,
            'is_default'      => 0,
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Đã thêm địa chỉ', 
            'address' => $address
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $address = UserAddress::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$address) {
            return response()->json([
                'message' => 'Không tìm thấy địa chỉ'
            ], 404);
        }

        // Lưu thông tin địa chỉ trước khi xóa
        $deletedAddress = $address->toArray();

        // Xóa địa chỉ
        $address->delete();

         $deletedAddress['is_default'] = 0;

        // Trả về thông tin địa chỉ đã xóa
        return response()->json([
            'message' => 'Đã xóa địa chỉ',
            'address' => $deletedAddress
        ], 200);
    }

    public function setDefault(Request $request, $id)
    {
        UserAddress::where('user_id', $request->user()->id)
            ->update(['is_default' => 0]);

        $address = UserAddress::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$address) {
            return response()->json([
                'message' => 'Không tìm thấy địa chỉ',
                'data' => null
            ], 404);
        }

        $address->update([
            'is_default' => 1
        ]);

        return response()->json([
            'message' => 'Đã đặt địa chỉ mặc định',
            'data' => $address->fresh(),
            'sync_all_addresses' => true
        ], 200);
    }
}