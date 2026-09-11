<?php

namespace App\Http\Controllers;

use App\Models\Upload;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Phục vụ ảnh tải lên tại /storage/{đường dẫn}.
 *
 * Bình thường máy chủ tĩnh trả thẳng file trên đĩa và không đụng tới Laravel.
 * Chỉ khi file không còn — sau mỗi lần Render dựng lại container — yêu cầu mới
 * rơi vào đây, và ảnh được lấy từ database rồi ghi lại ra đĩa cho lần sau.
 */
class UploadController extends Controller
{
    public function __invoke(string $path): Response
    {
        // Đường dẫn đi thẳng vào ổ đĩa nên phải chặn kiểu "../../.env" từ đây
        if (str_contains($path, '..')) {
            abort(404);
        }

        $dia = Storage::disk('public');

        if ($dia->exists($path)) {
            return $this->tra($dia->get($path), $dia->mimeType($path) ?: 'application/octet-stream');
        }

        $upload = Upload::where('path', $path)->first();
        if (! $upload) {
            abort(404);
        }

        $noi_dung = $upload->bytes();

        // Hâm nóng bộ nhớ đệm trên đĩa, lần sau khỏi phải hỏi database nữa
        rescue(fn () => $dia->put($path, $noi_dung), report: false);

        return $this->tra($noi_dung, $upload->mime);
    }

    /** Tên file là chuỗi ngẫu nhiên, đổi ảnh là đổi tên nên cho cache thoải mái */
    private function tra(string $noi_dung, string $mime): Response
    {
        return response($noi_dung, 200, [
            'Content-Type'   => $mime,
            'Content-Length' => (string) strlen($noi_dung),
            'Cache-Control'  => 'public, max-age=31536000, immutable',
        ]);
    }
}
