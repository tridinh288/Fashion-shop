<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'name'  => $user->fullname,
            'user'  => $user,
            'id'       => $user->id,
            'fullname' => $user->fullname,
            'email'    => $user->email,
            'phone'    => $user->phone,
            'gender' => $user->gender
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'email'  => 'required|email|unique:users,email,' . $request->user()->id,
            'phone'  => 'required|regex:/^[0-9]{9,11}$/',
            'gender' => 'required|in:Nam,Nữ',
        ]);

        $request->user()->update($request->only('email', 'phone', 'gender'));

        return response()->json([
            'status'  => true,
            'message' => 'Cập nhật thành công',
            'user'    => $request->user() // Thêm dòng này để thỏa mãn pm.expect(json).to.have.property("user")
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password'     => 'required',
            'new_password'     => 'required|min:6|max:50|confirmed',
        ]);

        if (!Hash::check($request->old_password, $request->user()->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không chính xác'], 400);
        }

        $request->user()->update([
            'password' => Hash::make($request->new_password)
        ]);

        $request->user()->currentAccessToken()->delete();

        $newToken = $request->user()->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đổi mật khẩu thành công',
            'token'   => $newToken,
            'updated_at' => $request->user()->fresh()->updated_at
        ]);
    }
}