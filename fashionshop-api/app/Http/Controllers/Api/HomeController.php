<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\HomeCovers;

class HomeController extends Controller
{
    /**
     * Ảnh trang chủ do quản trị viên đặt, kèm cách hiển thị.
     * path là null khi chưa đặt; khi đó giao diện tự lấy ảnh sản phẩm đang bán.
     */
    public function covers()
    {
        return response()->json([
            'message' => 'Lấy ảnh trang chủ thành công',
            'data'    => HomeCovers::all(),
        ]);
    }
}
