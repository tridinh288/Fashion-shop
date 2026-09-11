<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Một file ảnh đã tải lên. Xem App\Support\UploadStore để biết cách ghi và
 * App\Http\Controllers\UploadController để biết cách phục vụ ra ngoài.
 */
class Upload extends Model
{
    protected $fillable = ['path', 'mime', 'size', 'data'];

    /** Nội dung file gốc */
    public function bytes(): string
    {
        return base64_decode($this->data);
    }
}
