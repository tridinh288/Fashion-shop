<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Ảnh bìa cho hai ô bộ sưu tập "Thời trang nam" và "Thời trang nữ"
 * ngoài trang chủ. Khi chưa đặt, trang chủ tự lấy ảnh một sản phẩm đang bán.
 */
class HomeCoverController extends Controller
{
    /** Khoá lưu trong bảng settings, ứng với giá trị gioi_tinh của sản phẩm */
    private const KEYS = [
        'nam' => 'home_cover_nam',
        'nu'  => 'home_cover_nu',
    ];

    public function show()
    {
        return response()->json([
            'message' => 'Lấy ảnh bìa trang chủ thành công',
            'data'    => [
                'nam' => Setting::get(self::KEYS['nam']),
                'nu'  => Setting::get(self::KEYS['nu']),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'nam' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'nu'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ], [
            'nam.image' => 'Ảnh bộ sưu tập nam không hợp lệ',
            'nu.image'  => 'Ảnh bộ sưu tập nữ không hợp lệ',
            'nam.max'   => 'Ảnh bộ sưu tập nam vượt quá 5MB',
            'nu.max'    => 'Ảnh bộ sưu tập nữ vượt quá 5MB',
        ]);

        foreach (self::KEYS as $field => $key) {
            if (! $request->hasFile($field)) {
                continue;
            }

            $cu = Setting::get($key);
            $moi = $request->file($field)->store('covers', 'public');

            Setting::put($key, $moi);

            // Dọn ảnh cũ để thư mục không phình ra sau mỗi lần đổi
            if ($cu && $cu !== $moi) {
                Storage::disk('public')->delete($cu);
            }
        }

        return response()->json([
            'message' => 'Cập nhật ảnh bìa thành công',
            'data'    => [
                'nam' => Setting::get(self::KEYS['nam']),
                'nu'  => Setting::get(self::KEYS['nu']),
            ],
        ]);
    }

    /** Gỡ ảnh của một bộ sưu tập, trang chủ quay lại dùng ảnh sản phẩm */
    public function destroy(string $gioiTinh)
    {
        if (! isset(self::KEYS[$gioiTinh])) {
            return response()->json(['message' => 'Bộ sưu tập không hợp lệ'], 404);
        }

        $key = self::KEYS[$gioiTinh];

        if ($cu = Setting::get($key)) {
            Storage::disk('public')->delete($cu);
        }

        Setting::put($key, null);

        return response()->json(['message' => 'Đã gỡ ảnh bìa']);
    }
}
