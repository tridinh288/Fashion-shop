<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

/**
 * Sinh dữ liệu đơn hàng cho bản demo, đủ để trang dashboard quản trị
 * có doanh thu, số đơn và danh sách đơn gần đây thay vì các ô trống.
 */
class OrderSeeder extends Seeder
{
    /** Số đơn hàng sẽ tạo */
    private const ORDER_COUNT = 1000;

    /** Số khách hàng sẽ tạo, để đơn hàng không dồn hết vào một người */
    private const CUSTOMER_COUNT = 60;

    /** Phí giao hàng cố định, khớp với logic đặt hàng của OrderController */
    private const SHIPPING_FEE = 30000;

    private const SIZES = ['S', 'M', 'L', 'XL'];

    public function run(): void
    {
        // Đã có đơn hàng thì không sinh thêm, tránh chạy lại làm phình dữ liệu
        if (Order::query()->exists()) {
            $this->command->info('Đã có đơn hàng, bỏ qua OrderSeeder.');

            return;
        }

        $products = Product::query()->get(['id', 'gia']);

        if ($products->isEmpty()) {
            $this->command->warn('Chưa có sản phẩm nào, bỏ qua OrderSeeder.');

            return;
        }

        $userIds = $this->createCustomers();

        $this->command->info('Đang tạo ' . self::ORDER_COUNT . ' đơn hàng...');

        $this->createOrders($products, $userIds);

        $this->command->info('Xong: ' . Order::count() . ' đơn hàng.');
    }

    /**
     * Tạo danh sách khách hàng với tên và số điện thoại kiểu Việt Nam.
     *
     * @return array<int, int> id của toàn bộ khách hàng dùng được
     */
    private function createCustomers(): array
    {
        $ho        = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
        $demNam    = ['Văn', 'Hữu', 'Quang', 'Minh', 'Thanh', 'Đức', 'Công', 'Xuân'];
        $demNu     = ['Thị', 'Ngọc', 'Thanh', 'Thu', 'Kim', 'Mai', 'Phương'];
        $tenNam    = ['An', 'Bình', 'Cường', 'Dũng', 'Hải', 'Hùng', 'Khoa', 'Long', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Tài', 'Thắng', 'Trung', 'Tuấn', 'Vinh'];
        $tenNu     = ['Anh', 'Chi', 'Dung', 'Hà', 'Hằng', 'Hoa', 'Lan', 'Linh', 'Mai', 'Nhung', 'Oanh', 'Thảo', 'Trang', 'Tuyết', 'Vy', 'Yến'];

        // Hash một lần rồi dùng lại: bcrypt rất chậm, hash 60 lần sẽ kéo dài khởi động
        $password = Hash::make('User123456');
        $now      = now();

        $rows = [];

        for ($i = 1; $i <= self::CUSTOMER_COUNT; $i++) {
            $nam = $i % 2 === 1;

            $fullname = $ho[array_rand($ho)] . ' '
                . ($nam ? $demNam[array_rand($demNam)] : $demNu[array_rand($demNu)]) . ' '
                . ($nam ? $tenNam[array_rand($tenNam)] : $tenNu[array_rand($tenNu)]);

            $rows[] = [
                'fullname'   => $fullname,
                'email'      => 'khach' . $i . '@fashionshop.vn',
                'phone'      => '09' . str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT),
                'gender'     => $nam ? 'Nam' : 'Nữ',
                'password'   => $password,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        User::insertOrIgnore($rows);

        return User::query()->pluck('id')->all();
    }

    /**
     * Tạo đơn hàng cùng chi tiết đơn, trải đều trong 12 tháng gần nhất.
     *
     * @param  \Illuminate\Support\Collection<int, Product>  $products
     * @param  array<int, int>  $userIds
     */
    private function createOrders($products, array $userIds): void
    {
        $duong = ['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Cách Mạng Tháng 8', 'Điện Biên Phủ', 'Nguyễn Trãi', 'Lý Thường Kiệt', 'Phan Xích Long', 'Võ Văn Tần'];
        $quan  = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Tân Bình', 'Quận Phú Nhuận', 'TP. Thủ Đức'];
        $tinh  = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai'];

        $userNames = User::query()->pluck('fullname', 'id')->all();
        $userPhones = User::query()->pluck('phone', 'id')->all();

        $orderRows  = [];
        $orderPlans = [];

        for ($i = 0; $i < self::ORDER_COUNT; $i++) {
            $userId = $userIds[array_rand($userIds)];

            // Trải đơn trong 365 ngày gần nhất, nghiêng về thời gian gần đây
            $daysAgo    = (int) round(365 * (random_int(0, 1000) / 1000) ** 1.6);
            $createdAt  = now()->subDays($daysAgo)->subMinutes(random_int(0, 1439));

            // Mỗi đơn 1-4 sản phẩm khác nhau
            $items    = $products->random(min(random_int(1, 4), $products->count()));
            $subtotal = 0;
            $details  = [];

            foreach ($items as $item) {
                $quantity = random_int(1, 3);
                $subtotal += $item->gia * $quantity;

                $details[] = [
                    'product_id' => $item->id,
                    'quantity'   => $quantity,
                    'price'      => $item->gia,
                    'size'       => self::SIZES[array_rand(self::SIZES)],
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ];
            }

            $orderRows[] = [
                'user_id'    => $userId,
                'fullname'   => $userNames[$userId],
                'phone'      => $userPhones[$userId] ?? '0900000000',
                'address'    => random_int(1, 400) . ' ' . $duong[array_rand($duong)]
                    . ', ' . $quan[array_rand($quan)] . ', ' . $tinh[array_rand($tinh)],
                'payment'    => 'COD',
                'total'      => $subtotal + self::SHIPPING_FEE,
                'status'     => $this->statusFor($daysAgo),
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];

            $orderPlans[] = $details;
        }

        // Chèn theo lô cho nhanh, rồi lấy id vừa tạo để gắn chi tiết đơn
        $firstId = null;

        foreach (array_chunk($orderRows, 200, true) as $chunk) {
            DB::table('orders')->insert(array_values($chunk));

            if ($firstId === null) {
                $firstId = DB::table('orders')->min('id');
            }
        }

        $orderIds = DB::table('orders')->orderBy('id')->pluck('id')->all();

        $detailRows = [];

        foreach ($orderPlans as $index => $details) {
            if (!isset($orderIds[$index])) {
                continue;
            }

            foreach ($details as $detail) {
                $detail['order_id'] = $orderIds[$index];
                $detailRows[]       = $detail;
            }
        }

        foreach (array_chunk($detailRows, 500) as $chunk) {
            DB::table('order_details')->insert($chunk);
        }
    }

    /**
     * Đơn càng cũ thì càng khó còn ở trạng thái chờ xử lý.
     */
    private function statusFor(int $daysAgo): string
    {
        if ($daysAgo > 30) {
            // Đơn cũ chỉ có thể đã xong hoặc đã huỷ
            return random_int(1, 100) <= 88 ? 'completed' : 'cancelled';
        }

        if ($daysAgo > 7) {
            return match (true) {
                random_int(1, 100) <= 75 => 'completed',
                random_int(1, 100) <= 60 => 'shipping',
                default                  => 'cancelled',
            };
        }

        // Đơn mới: đang trong quy trình xử lý
        return match (true) {
            random_int(1, 100) <= 40 => 'pending',
            random_int(1, 100) <= 60 => 'shipping',
            random_int(1, 100) <= 70 => 'completed',
            default                  => 'cancelled',
        };
    }
}
