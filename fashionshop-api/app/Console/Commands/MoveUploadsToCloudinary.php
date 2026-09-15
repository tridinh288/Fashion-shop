<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\Setting;
use App\Models\Upload;
use App\Support\Images\ImageStorage;
use App\Support\Images\LocalImageStorage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Chuyển ảnh đang nằm trong bảng uploads sang kho ảnh ngoài.
 *
 * Với mỗi ảnh: tải lên kho, đổi mọi chỗ trỏ tới đường dẫn cũ (sản phẩm, ảnh
 * trang chủ) sang URL mới, rồi xoá dòng trong uploads. Dòng nào đã xong thì
 * không còn trong bảng, nên chạy lại chỉ xử lý phần còn sót.
 */
class MoveUploadsToCloudinary extends Command
{
    protected $signature = 'uploads:to-cloudinary {--dry-run : Chỉ liệt kê, không tải lên và không ghi database}';

    protected $description = 'Chuyển ảnh trong bảng uploads sang Cloudinary và cập nhật đường dẫn';

    public function handle(ImageStorage $kho): int
    {
        if ($kho instanceof LocalImageStorage) {
            $this->error('IMAGE_DRIVER đang là local. Đặt IMAGE_DRIVER=cloudinary và CLOUDINARY_URL rồi chạy lại.');
            return self::FAILURE;
        }

        $chay_thu = (bool) $this->option('dry-run');
        $xong = 0;
        $loi = 0;

        Upload::query()->orderBy('id')->chunkById(20, function ($lo) use ($kho, $chay_thu, &$xong, &$loi) {
            foreach ($lo as $upload) {
                $so_sp = Product::where('hinh_anh', $upload->path)->count();
                $so_cai_dat = Setting::where('value', $upload->path)->count();

                $this->line(sprintf('  %-60s %d sản phẩm, %d ảnh trang chủ', $upload->path, $so_sp, $so_cai_dat));

                if ($chay_thu) {
                    continue;
                }

                try {
                    $url = $kho->store($upload->bytes(), $upload->mime, dirname($upload->path));

                    DB::transaction(function () use ($upload, $url) {
                        Product::where('hinh_anh', $upload->path)->update(['hinh_anh' => $url]);
                        Setting::where('value', $upload->path)->update(['value' => $url]);
                        $upload->delete();
                    });

                    $this->line("    → {$url}");
                    $xong++;
                } catch (\Throwable $e) {
                    $loi++;
                    $this->warn("    lỗi: {$e->getMessage()}");
                }
            }
        });

        if ($chay_thu) {
            $this->comment('Chạy thử, chưa tải lên và chưa ghi gì. Bỏ --dry-run để áp dụng.');
            return self::SUCCESS;
        }

        $this->info("Đã chuyển {$xong} ảnh" . ($loi ? ", lỗi {$loi} ảnh (chạy lại để thử tiếp)" : ''));

        return $loi ? self::FAILURE : self::SUCCESS;
    }
}
