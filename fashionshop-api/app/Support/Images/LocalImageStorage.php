<?php

namespace App\Support\Images;

use App\Support\UploadStore;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Cất ảnh vào ổ đĩa public của máy đang chạy. Dùng khi dev không cần mạng và
 * khi chạy test. Không dùng trên Render vì ổ đĩa ở đó mất sau mỗi lần khởi động.
 */
class LocalImageStorage implements ImageStorage
{
    public function store(string $bytes, string $mime, string $folder): string
    {
        $path = $folder . '/' . Str::random(40) . '.' . (UploadStore::EXTENSIONS[$mime] ?? 'jpg');

        Storage::disk('public')->put($path, $bytes);

        return $path;
    }

    public function delete(string $ref): void
    {
        if (! UploadStore::isUrl($ref)) {
            Storage::disk('public')->delete($ref);
        }
    }
}
