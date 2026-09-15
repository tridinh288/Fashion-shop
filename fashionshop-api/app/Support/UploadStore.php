<?php

namespace App\Support;

use App\Support\Images\ImageStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

/**
 * Nơi cất ảnh tải lên.
 *
 * Ảnh được thu nhỏ cho vừa trần dung lượng rồi giao cho kho ảnh đang cấu hình
 * (xem App\Support\Images). Database chỉ giữ giá trị kho trả về: đường dẫn
 * tương đối như "products/abc.png" hoặc URL đầy đủ của Cloudinary.
 */
class UploadStore
{
    /** Cạnh dài nhất giữ lại sau khi thu nhỏ */
    public const MAX_EDGE = 2000;

    /** Trần dung lượng một ảnh sau khi nén, giữ trang cửa hàng tải nhanh */
    public const MAX_BYTES = 3 * 1024 * 1024;

    /** Đuôi file theo kiểu ảnh, dùng cho tên file sinh ra */
    public const EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];

    /**
     * Cất một ảnh vừa tải lên và trả về giá trị để lưu vào database.
     *
     * @param  string  $field  Tên trường, chỉ dùng để báo lỗi cho đúng chỗ
     */
    public static function put(UploadedFile $file, string $folder, string $field = 'file'): string
    {
        $mime  = $file->getMimeType() ?: 'image/jpeg';
        $bytes = self::shrink(file_get_contents($file->getRealPath()), $mime);

        if (strlen($bytes) > self::MAX_BYTES) {
            throw ValidationException::withMessages([
                $field => 'Ảnh quá nặng, hãy dùng ảnh nhẹ hơn hoặc kích thước nhỏ hơn',
            ]);
        }

        return app(ImageStorage::class)->store($bytes, $mime, $folder);
    }

    /** Giá trị là URL đầy đủ (ảnh trên kho ngoài) chứ không phải đường dẫn trên đĩa */
    public static function isUrl(?string $ref): bool
    {
        return $ref !== null && preg_match('#^https?://#i', $ref) === 1;
    }

    /**
     * Xoá một ảnh. Dọn ảnh chỉ là việc phụ nên kho ngoài lỗi thì ghi log chứ
     * không làm hỏng thao tác của quản trị viên.
     */
    public static function delete(?string $ref): void
    {
        if (! $ref) {
            return;
        }

        if (self::isUrl($ref)) {
            rescue(fn () => app(ImageStorage::class)->delete($ref));
            return;
        }

        Storage::disk('public')->delete($ref);
    }

    /** Ảnh còn xem được không */
    public static function exists(?string $ref): bool
    {
        return self::existing([$ref]) !== [];
    }

    /**
     * Lọc ra những ảnh còn xem được. URL của kho ngoài được coi là còn; đường
     * dẫn tương đối thì phải còn trên đĩa.
     *
     * @param  list<string|null>  $refs
     * @return list<string>
     */
    public static function existing(array $refs): array
    {
        $refs = array_values(array_unique(array_filter($refs)));

        return array_values(array_filter(
            $refs,
            fn (string $ref) => self::isUrl($ref) || Storage::disk('public')->exists($ref)
        ));
    }

    /**
     * Thu nhỏ ảnh cho vừa trần dung lượng.
     *
     * Ảnh giữ nguyên định dạng: ảnh sản phẩm ở đây là ảnh tách nền nên đổi PNG
     * sang JPEG sẽ làm nền trong suốt thành một mảng đen. Nếu máy chủ không có
     * thư viện GD thì trả lại nguyên bản, phần kiểm tra dung lượng ở trên sẽ
     * chặn những ảnh quá nặng.
     */
    private static function shrink(string $original, string $mime): string
    {
        if (! function_exists('imagecreatefromstring')) {
            return $original;
        }

        $src = @imagecreatefromstring($original);
        if (! $src) {
            return $original;
        }

        $vua_khung = max(imagesx($src), imagesy($src)) <= self::MAX_EDGE;
        if ($vua_khung && strlen($original) <= self::MAX_BYTES) {
            imagedestroy($src);
            return $original;
        }

        // Ảnh vẫn quá nặng thì hạ dần cạnh dài cho tới khi lọt trần
        $tot_nhat = $original;
        foreach ([self::MAX_EDGE, 1600, 1200, 900] as $canh) {
            $thu = self::encode($src, $canh, $mime);

            if ($thu !== null && strlen($thu) < strlen($tot_nhat)) {
                $tot_nhat = $thu;
            }

            if (strlen($tot_nhat) <= self::MAX_BYTES) {
                break;
            }
        }

        imagedestroy($src);

        return $tot_nhat;
    }

    /** Vẽ lại ảnh với cạnh dài không quá $canh, trả về null nếu không nén được */
    private static function encode(\GdImage $src, int $canh, string $mime): ?string
    {
        $w = imagesx($src);
        $h = imagesy($src);
        $ty_le = min(1, $canh / max($w, $h));

        $moi_w = max(1, (int) round($w * $ty_le));
        $moi_h = max(1, (int) round($h * $ty_le));

        $dst = imagecreatetruecolor($moi_w, $moi_h);

        // Giữ nền trong suốt cho PNG và WebP
        if ($mime !== 'image/jpeg') {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            imagefilledrectangle($dst, 0, 0, $moi_w, $moi_h, imagecolorallocatealpha($dst, 0, 0, 0, 127));
        }

        imagecopyresampled($dst, $src, 0, 0, 0, 0, $moi_w, $moi_h, $w, $h);

        ob_start();
        $xong = match ($mime) {
            'image/png'  => function_exists('imagepng') && imagepng($dst, null, 6),
            'image/webp' => function_exists('imagewebp') && imagewebp($dst, null, 82),
            default      => function_exists('imagejpeg') && imagejpeg($dst, null, 82),
        };
        $ket_qua = ob_get_clean();

        imagedestroy($dst);

        return $xong && $ket_qua !== '' ? $ket_qua : null;
    }
}
