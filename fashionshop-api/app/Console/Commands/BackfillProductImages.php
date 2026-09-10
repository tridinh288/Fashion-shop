<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Support\ProductImages;
use Illuminate\Console\Command;

/**
 * Điền ảnh cho những sản phẩm còn thiếu.
 *
 * Seeder chỉ gán ảnh lúc tạo mới, nên các sản phẩm đã tồn tại từ trước — hoặc
 * do quản trị viên thêm qua trang admin mà bỏ trống ảnh — sẽ hiển thị ô trống
 * ngoài cửa hàng. Lệnh này quét và gán ảnh theo danh mục cùng giới tính.
 */
class BackfillProductImages extends Command
{
    protected $signature = 'products:backfill-images
                            {--dry-run : Chỉ liệt kê thay đổi, không ghi vào database}';

    protected $description = 'Gán ảnh cho các sản phẩm đang thiếu hình';

    public function handle(): int
    {
        $missing = Product::query()
            ->where(function ($q) {
                $q->whereNull('hinh_anh')->orWhere('hinh_anh', '');
            })
            ->orderBy('id')
            ->get(['id', 'ten_sp', 'category_id', 'gioi_tinh']);

        if ($missing->isEmpty()) {
            $this->info('Mọi sản phẩm đều đã có ảnh.');

            return self::SUCCESS;
        }

        $dryRun = (bool) $this->option('dry-run');
        $this->info("Tìm thấy {$missing->count()} sản phẩm thiếu ảnh.");

        // Đếm riêng cho từng nhóm để ảnh xoay vòng đều, không dồn vào một tấm
        $used = [];
        $updated = 0;

        foreach ($missing as $product) {
            $pool = ProductImages::poolName($product->category_id, $product->gioi_tinh, $product->ten_sp);
            $index = $used[$pool] ?? 0;
            $image = ProductImages::pick($pool, $index);

            if ($image === null) {
                $this->warn("  bỏ qua #{$product->id}: nhóm '{$pool}' không có ảnh nào");
                continue;
            }

            $used[$pool] = $index + 1;

            $this->line(sprintf('  #%-4d %-38s → %s', $product->id, mb_substr($product->ten_sp, 0, 37), $image));

            if (! $dryRun) {
                Product::where('id', $product->id)->update(['hinh_anh' => $image]);
                $updated++;
            }
        }

        if ($dryRun) {
            $this->comment('Chạy thử, chưa ghi gì vào database. Bỏ --dry-run để áp dụng.');

            return self::SUCCESS;
        }

        $this->info("Đã cập nhật {$updated} sản phẩm.");

        return self::SUCCESS;
    }
}
