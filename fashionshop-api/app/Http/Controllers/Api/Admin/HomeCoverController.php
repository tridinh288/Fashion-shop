<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\HomeCovers;
use App\Support\UploadStore;
use Illuminate\Http\Request;

/**
 * Ảnh trang chủ: ảnh lớn đầu trang và hai ô bộ sưu tập nam / nữ.
 *
 * Mỗi vị trí lưu ba thứ: đường dẫn ảnh, cách lấp khung (phủ kín hay vừa khung)
 * và toạ độ tiêu điểm — để quản trị viên kéo ảnh cho phần muốn khoe nằm đúng
 * trong khung thay vì bị cắt mất.
 */
class HomeCoverController extends Controller
{
    public function show()
    {
        return response()->json([
            'message' => 'Lấy ảnh trang chủ thành công',
            'data'    => HomeCovers::all(),
        ]);
    }

    public function update(Request $request)
    {
        $rules = [];
        $messages = [];

        foreach (HomeCovers::SLOTS as $slot => $label) {
            $rules[$slot] = 'nullable|image|mimes:jpg,jpeg,png,webp';
            $rules[$slot . '_fit'] = 'nullable|in:cover,contain';
            $rules[$slot . '_pos'] = 'nullable|string|max:24';

            $messages[$slot . '.image'] = "Ảnh {$label} không hợp lệ";
            $messages[$slot . '.mimes'] = "Ảnh {$label} phải là jpg, png hoặc webp";
        }

        $request->validate($rules, $messages);

        foreach (array_keys(HomeCovers::SLOTS) as $slot) {
            if ($request->hasFile($slot)) {
                $cu = Setting::get(HomeCovers::pathKey($slot));
                $moi = UploadStore::put($request->file($slot), 'covers', $slot);

                Setting::put(HomeCovers::pathKey($slot), $moi);

                // Dọn ảnh cũ để kho không phình ra sau mỗi lần đổi
                if ($cu && $cu !== $moi) {
                    UploadStore::delete($cu);
                }
            }

            if ($request->filled($slot . '_fit')) {
                Setting::put(HomeCovers::fitKey($slot), $request->input($slot . '_fit'));
            }

            if ($request->filled($slot . '_pos')) {
                Setting::put(
                    HomeCovers::posKey($slot),
                    HomeCovers::sanitizePosition($request->input($slot . '_pos'))
                );
            }
        }

        return response()->json([
            'message' => 'Cập nhật ảnh trang chủ thành công',
            'data'    => HomeCovers::all(),
        ]);
    }

    /** Gỡ ảnh của một vị trí, trang chủ quay lại dùng ảnh sản phẩm đang bán */
    public function destroy(string $slot)
    {
        if (! isset(HomeCovers::SLOTS[$slot])) {
            return response()->json(['message' => 'Vị trí ảnh không hợp lệ'], 404);
        }

        UploadStore::delete(Setting::get(HomeCovers::pathKey($slot)));

        Setting::put(HomeCovers::pathKey($slot), null);
        Setting::put(HomeCovers::fitKey($slot), null);
        Setting::put(HomeCovers::posKey($slot), null);

        return response()->json([
            'message' => 'Đã gỡ ảnh',
            'data'    => HomeCovers::all(),
        ]);
    }
}
