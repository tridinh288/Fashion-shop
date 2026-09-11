<?php

namespace App\Console\Commands;

use App\Models\Upload;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Ghi ảnh trong database ra lại ổ đĩa.
 *
 * Render dựng container mới sau mỗi lần triển khai hoặc sau khi dịch vụ ngủ
 * dậy, và ổ đĩa lúc đó sạch trơn: chỉ còn những gì nằm sẵn trong image Docker.
 * Lệnh này chạy ngay lúc khởi động để ảnh quản trị viên tải lên có mặt trở lại
 * trước khi có người vào xem.
 */
class RestoreUploads extends Command
{
    protected $signature = 'uploads:restore {--force : Ghi đè cả những file đang có trên đĩa}';

    protected $description = 'Ghi ảnh đã lưu trong database ra lại ổ đĩa public';

    public function handle(): int
    {
        if (! Schema::hasTable('uploads')) {
            $this->warn('Chưa có bảng uploads, bỏ qua.');
            return self::SUCCESS;
        }

        $dia = Storage::disk('public');
        $ghi = 0;
        $co_san = 0;
        $hong = 0;

        Upload::query()->orderBy('id')->chunk(20, function ($lo) use ($dia, &$ghi, &$co_san, &$hong) {
            foreach ($lo as $upload) {
                if (! $this->option('force') && $dia->exists($upload->path)) {
                    $co_san++;
                    continue;
                }

                try {
                    $dia->put($upload->path, $upload->bytes());
                    $ghi++;
                } catch (\Throwable $e) {
                    $hong++;
                    $this->warn("Không ghi được {$upload->path}: {$e->getMessage()}");
                }
            }
        });

        $this->info("Ảnh đã khôi phục: {$ghi} — sẵn có: {$co_san}" . ($hong ? " — lỗi: {$hong}" : ''));

        return self::SUCCESS;
    }
}
