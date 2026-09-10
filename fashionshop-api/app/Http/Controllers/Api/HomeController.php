<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class HomeController extends Controller
{
    /**
     * Ảnh bìa hai ô bộ sưu tập ngoài trang chủ. Trả về null khi quản trị viên
     * chưa đặt ảnh; khi đó giao diện tự lấy ảnh một sản phẩm đang bán.
     */
    public function covers()
    {
        return response()->json([
            'message' => 'Lấy ảnh bìa trang chủ thành công',
            'data'    => [
                'nam' => Setting::get('home_cover_nam'),
                'nu'  => Setting::get('home_cover_nu'),
            ],
        ]);
    }
}
