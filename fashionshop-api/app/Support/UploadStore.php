<?php

namespace App\Support;

use App\Models\Upload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Nơi cất ảnh tải lên.
 *
 * Ảnh được ghi ra ổ đĩa public như trước để phục vụ cho nhanh, đồng thời lưu
 * một bản trong database. Ổ đĩa của Render bị xoá mỗi lần container khởi động
 * lại, nên bản trong database mới là bản thật; bản trên đĩa chỉ là bộ nhớ đệm
 * và được dựng lại khi có người xem ảnh lần đầu sau khi khởi động.
 */
class UploadStore
{
    /** Cạnh dài nhất giữ lại sau khi thu nhỏ */
    public const MAX_EDGE = 2000;

    /**
     * Trần dung lượng một ảnh sau khi nén. Phải nằm dưới giới hạn kích thước
     * một dòng của TiDB (6MB) sau khi cộng thêm phần phình ra của base64.
     */
    public const MAX_BYTES = 3 * 1024 * 1024;

    /** Đuôi file theo kiểu ảnh, dùng cho tên file sinh ra */
    private const EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];

    /**
     * Cất một ảnh vừa tải lên và trả về đường dẫn tương đối, ví dụ
     * "covers/abc123.jpg" — đúng dạng vẫn đang lưu trong database từ trước.
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

        $ext  = self::EXTENSIONS[$mime] ?? ($file->guessExtension() ?: 'jpg');
        $path = $folder . '/' . Str::random(40) . '.' . $ext;

        Storage::disk('public')->put($path, $bytes);

        Upload::updateOrCreate(
            ['path' => $path],
            ['mime' => $mime, 'size' => strlen($bytes), 'data' => base64_encode($bytes)]
        );

        return $path;
    }

    /** Xoá một ảnh khỏi cả database lẫn ổ đĩa */
    public static function delete(?string $path): void
    {
        if (! $path) {
            return;
        }

        Upload::where('path', $path)->delete();
        Storage::disk('public')->delete($path);
    }

    /** Ảnh còn xem được không: hoặc còn trong database, hoặc còn trên đĩa */
    public static function exists(?string $path): bool
    {
        if (! $path) {
            return false;
        }

        return Storage::disk('public')->exists($path)
            || Upload::where('path', $path)->exists();
    }

    /**
     * Lọc ra những đường dẫn còn xem được, trong một lượt truy vấn.
     *
     * @param  list<string>  $paths
     * @return list<string>
     */
    public static function existing(array $paths): array
    {
        $paths = array_values(array_unique(array_filter($paths)));

        if (! $paths) {
            return [];
        }

        $found = Upload::whereIn('path', $paths)->pluck('path')->all();

        foreach ($paths as $path) {
            if (! in_array($path, $found, true) && Storage::disk('public')->exists($path)) {
                $found[] = $path;
            }
        }

        return $found;
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
