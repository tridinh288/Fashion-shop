<?php

namespace App\Support;

use App\Models\Setting;

/**
 * Ảnh trang chủ do quản trị viên đặt.
 *
 * Mỗi vị trí gồm ba thiết lập lưu trong bảng settings:
 *   - path: đường dẫn ảnh trong ổ đĩa public
 *   - fit:  "cover" phủ kín khung (có thể bị cắt) hoặc "contain" vừa khung
 *   - pos:  tiêu điểm dạng "50% 40%", quyết định phần nào của ảnh được giữ lại
 *           khi bị cắt. Đây là thứ cho phép kéo ảnh lên xuống trong trang admin.
 */
class HomeCovers
{
    /** Các vị trí ảnh, kèm nhãn tiếng Việt dùng trong thông báo lỗi */
    public const SLOTS = [
        'hero' => 'đầu trang',
        'nam'  => 'bộ sưu tập nam',
        'nu'   => 'bộ sưu tập nữ',
    ];

    public const DEFAULT_FIT = 'cover';
    public const DEFAULT_POS = '50% 50%';

    public static function pathKey(string $slot): string
    {
        return "home_cover_{$slot}";
    }

    public static function fitKey(string $slot): string
    {
        return "home_cover_{$slot}_fit";
    }

    public static function posKey(string $slot): string
    {
        return "home_cover_{$slot}_pos";
    }

    /**
     * Toàn bộ thiết lập ảnh trang chủ.
     *
     * @return array<string, array{path: string|null, fit: string, pos: string}>
     */
    public static function all(): array
    {
        $out = [];

        foreach (array_keys(self::SLOTS) as $slot) {
            $out[$slot] = [
                'path' => Setting::get(self::pathKey($slot)),
                'fit'  => Setting::get(self::fitKey($slot)) ?: self::DEFAULT_FIT,
                'pos'  => Setting::get(self::posKey($slot)) ?: self::DEFAULT_POS,
            ];
        }

        return $out;
    }

    /**
     * Chỉ nhận toạ độ dạng "<số>% <số>%" trong khoảng 0-100.
     * Giá trị này đi thẳng vào CSS object-position nên phải chặn từ đây.
     */
    public static function sanitizePosition(?string $pos): string
    {
        if (! $pos || ! preg_match('/^\s*(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%\s*$/', $pos, $m)) {
            return self::DEFAULT_POS;
        }

        $x = min(100, max(0, (float) $m[1]));
        $y = min(100, max(0, (float) $m[2]));

        return sprintf('%s%% %s%%', round($x, 2), round($y, 2));
    }
}
