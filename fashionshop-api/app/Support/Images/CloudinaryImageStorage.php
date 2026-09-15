<?php

namespace App\Support\Images;

use Cloudinary\Api\Upload\UploadApi;

/**
 * Cất ảnh trên Cloudinary. Database chỉ giữ secure_url; ảnh sống độc lập với
 * ổ đĩa tạm của Render và được phát qua CDN của Cloudinary.
 */
class CloudinaryImageStorage implements ImageStorage
{
    /**
     * @param  string  $rootFolder  Thư mục gốc tách môi trường, ví dụ "fashionshop-dev" / "fashionshop-prod"
     */
    public function __construct(
        private UploadApi $api,
        private string $rootFolder,
    ) {
    }

    public function store(string $bytes, string $mime, string $folder): string
    {
        $ket_qua = $this->api->upload('data:' . $mime . ';base64,' . base64_encode($bytes), [
            'folder'          => trim($this->rootFolder . '/' . $folder, '/'),
            'resource_type'   => 'image',
            'unique_filename' => true,
            'overwrite'       => false,
        ]);

        return $ket_qua['secure_url'];
    }

    public function delete(string $ref): void
    {
        $id = self::publicId($ref);

        if ($id !== null) {
            $this->api->destroy($id, ['resource_type' => 'image', 'invalidate' => true]);
        }
    }

    /** Lấy public id từ URL Cloudinary, null nếu không phải URL của Cloudinary */
    public static function publicId(string $url): ?string
    {
        return preg_match('#^https://res\.cloudinary\.com/[^/]+/image/upload/(?:v\d+/)?(.+)\.[A-Za-z0-9]+$#', $url, $m) === 1
            ? $m[1]
            : null;
    }
}
