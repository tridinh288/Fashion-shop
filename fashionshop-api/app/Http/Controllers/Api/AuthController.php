<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'fullname' => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'required|regex:/^[0-9]{9,11}$/',
            'gender'   => 'required|in:Nam,Nữ',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'fullname' => $request->fullname,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'gender'   => $request->gender,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công',
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->fullname,
                'fullname' => $user->fullname,
                'email'    => $user->email,
                'phone'    => $user->phone,
                'gender'   => $user->gender,
            ],
            'token'   => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác'
            ], 401);
        }

        

        $token = $user->createToken('auth_token')->plainTextToken;

       return response()->json([
            'message' => 'Đăng nhập thành công',
            'user' => $user->only(['id', 'fullname', 'email', 'phone', 'gender']),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đăng xuất thành công',
            'user' => $user->only(['id', 'fullname', 'email', 'phone', 'gender'])
        ]);
    }
}