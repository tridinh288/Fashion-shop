<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Admin;
use App\Models\Category;
use App\Models\Product;
use App\Support\ProductImages;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        Admin::firstOrCreate(
            ['email' => 'admin@fashionshop.vn'],
            [
                'fullname' => 'Admin FashionShop',
                'phone'    => '0901234567',
                'password' => Hash::make('Admin123456'),
            ]
        );

        // Test user
        User::firstOrCreate(
            ['email' => 'user@test.com'],
            [
                'fullname' => 'Nguyễn Văn Test',
                'phone'    => '0909090909',
                'gender'   => 'Nam',
                'password' => Hash::make('User123456'),
            ]
        );

        // Categories
        $catNames = ['Quần Tây', 'Quần Jean', 'Quần Kaki', 'Quần Short', 'Áo Polo', 'Áo Sơ Mi', 'Áo Khoác'];
        foreach ($catNames as $name) {
            Category::firstOrCreate(['ten_danh_muc' => $name]);
        }

        $catIds = Category::pluck('id', 'ten_danh_muc');

        // Products
        $products = [
            ['ten_sp' => 'Quần Tây Nam Công Sở Slim Fit',    'gia' => 320000, 'gia_cu' => 420000, 'mo_ta' => 'Quần tây nam dáng slim fit, chất liệu kaki cao cấp, phù hợp đi làm và dự tiệc.', 'so_luong' => 50, 'gioi_tinh' => 1, 'category_id' => $catIds['Quần Tây']],
            ['ten_sp' => 'Quần Tây Nam Kẻ Sọc Lịch Lãm',     'gia' => 350000, 'gia_cu' => 0,      'mo_ta' => 'Quần tây kẻ sọc tinh tế, dáng regular fit thoải mái.', 'so_luong' => 40, 'gioi_tinh' => 1, 'category_id' => $catIds['Quần Tây']],
            ['ten_sp' => 'Quần Jean Nam Skinny Rách Gối',     'gia' => 280000, 'gia_cu' => 380000, 'mo_ta' => 'Quần jean nam skinny với chi tiết rách gối thời trang, màu xanh đậm.', 'so_luong' => 60, 'gioi_tinh' => 1, 'category_id' => $catIds['Quần Jean']],
            ['ten_sp' => 'Quần Jean Nam Straight Cổ Điển',    'gia' => 295000, 'gia_cu' => 0,      'mo_ta' => 'Quần jean thẳng phong cách cổ điển, chất denim dày dặn bền bỉ.', 'so_luong' => 45, 'gioi_tinh' => 1, 'category_id' => $catIds['Quần Jean']],
            ['ten_sp' => 'Quần Kaki Nam Chinos Trẻ Trung',    'gia' => 250000, 'gia_cu' => 320000, 'mo_ta' => 'Quần kaki chinos năng động, phù hợp đi học, đi chơi.', 'so_luong' => 55, 'gioi_tinh' => 1, 'category_id' => $catIds['Quần Kaki']],
            ['ten_sp' => 'Quần Kaki Nam Jogger Co Gót',       'gia' => 265000, 'gia_cu' => 0,      'mo_ta' => 'Quần kaki jogger co gót thoải mái, phong cách streetwear.', 'so_luong' => 35, 'gioi_tinh' => 1, 'category_id' => $catIds['Quần Kaki']],
            ['ten_sp' => 'Quần Short Kaki Nam Năng Động',     'gia' => 180000, 'gia_cu' => 240000, 'mo_ta' => 'Quần short kaki thoáng mát, lý tưởng cho mùa hè.', 'so_luong' => 70, 'gioi_tinh' => 1, 'category_id' => $catIds['Quần Short']],
            ['ten_sp' => 'Quần Short Jean Nam Rách',          'gia' => 195000, 'gia_cu' => 0,      'mo_ta' => 'Quần short jean rách phong cách, trẻ trung, năng động.', 'so_luong' => 50, 'gioi_tinh' => 1, 'category_id' => $catIds['Quần Short']],
            ['ten_sp' => 'Áo Polo Nam Cổ Bẻ Basic',          'gia' => 220000, 'gia_cu' => 290000, 'mo_ta' => 'Áo polo nam cổ bẻ basic, chất cotton thoáng mát, nhiều màu.', 'so_luong' => 80, 'gioi_tinh' => 1, 'category_id' => $catIds['Áo Polo']],
            ['ten_sp' => 'Áo Polo Nam Phối Sọc Ngang',       'gia' => 245000, 'gia_cu' => 310000, 'mo_ta' => 'Áo polo phối sọc ngang tinh tế, phong cách thể thao lịch lãm.', 'so_luong' => 65, 'gioi_tinh' => 1, 'category_id' => $catIds['Áo Polo']],
            ['ten_sp' => 'Áo Sơ Mi Nam Trắng Công Sở',       'gia' => 270000, 'gia_cu' => 350000, 'mo_ta' => 'Áo sơ mi nam màu trắng tinh tế, chất liệu lụa mềm mịn, dễ ủi.', 'so_luong' => 60, 'gioi_tinh' => 1, 'category_id' => $catIds['Áo Sơ Mi']],
            ['ten_sp' => 'Áo Sơ Mi Nam Caro Nhỏ',            'gia' => 255000, 'gia_cu' => 0,      'mo_ta' => 'Áo sơ mi caro nhỏ phong cách, trẻ trung và năng động.', 'so_luong' => 45, 'gioi_tinh' => 1, 'category_id' => $catIds['Áo Sơ Mi']],
            ['ten_sp' => 'Áo Khoác Dù Nam Chống Nước',       'gia' => 450000, 'gia_cu' => 580000, 'mo_ta' => 'Áo khoác dù chống nước, nhẹ và gọn, phù hợp đi phượt.', 'so_luong' => 30, 'gioi_tinh' => 1, 'category_id' => $catIds['Áo Khoác']],
            ['ten_sp' => 'Áo Khoác Bomber Nam Form Rộng',    'gia' => 420000, 'gia_cu' => 550000, 'mo_ta' => 'Áo khoác bomber form rộng streetwear, thời trang và ấm áp.', 'so_luong' => 25, 'gioi_tinh' => 1, 'category_id' => $catIds['Áo Khoác']],
            ['ten_sp' => 'Quần Jean Nữ Ống Rộng Vintage',    'gia' => 290000, 'gia_cu' => 380000, 'mo_ta' => 'Quần jean ống rộng phong cách vintage, tôn dáng.', 'so_luong' => 50, 'gioi_tinh' => 0, 'category_id' => $catIds['Quần Jean']],
            ['ten_sp' => 'Quần Kaki Nữ Ống Suông Trẻ Trung', 'gia' => 240000, 'gia_cu' => 0,      'mo_ta' => 'Quần kaki ống suông thanh lịch cho nữ, nhiều màu sắc.', 'so_luong' => 45, 'gioi_tinh' => 0, 'category_id' => $catIds['Quần Kaki']],
            ['ten_sp' => 'Áo Sơ Mi Nữ Lụa Cao Cấp',         'gia' => 310000, 'gia_cu' => 420000, 'mo_ta' => 'Áo sơ mi nữ chất lụa cao cấp, mềm mịn, thanh lịch.', 'so_luong' => 40, 'gioi_tinh' => 0, 'category_id' => $catIds['Áo Sơ Mi']],
            ['ten_sp' => 'Áo Khoác Cardigan Nữ Len Mỏng',   'gia' => 385000, 'gia_cu' => 490000, 'mo_ta' => 'Áo khoác cardigan len mỏng nhẹ nhàng, phong cách Hàn Quốc.', 'so_luong' => 35, 'gioi_tinh' => 0, 'category_id' => $catIds['Áo Khoác']],
            ['ten_sp' => 'Quần Short Nữ Kaki Lưng Cao',      'gia' => 185000, 'gia_cu' => 250000, 'mo_ta' => 'Quần short kaki lưng cao tôn dáng, năng động cho ngày hè.', 'so_luong' => 55, 'gioi_tinh' => 0, 'category_id' => $catIds['Quần Short']],
        ];

        // Gán ảnh cho từng sản phẩm, xoay vòng trong nhóm để hàng cùng loại
        // không dùng chung một tấm. Bảng ảnh nằm ở App\Support\ProductImages
        // để lệnh products:backfill-images dùng lại đúng dữ liệu đó.
        $used = [];

        foreach ($products as $p) {
            $pool = ProductImages::poolName($p['category_id'], $p['gioi_tinh'], $p['ten_sp']);
            $index = $used[$pool] ?? 0;
            $used[$pool] = $index + 1;
            $p['hinh_anh'] = ProductImages::pick($pool, $index);

            Product::firstOrCreate(['ten_sp' => $p['ten_sp']], $p);
        }

        // Đơn hàng mẫu để dashboard quản trị có số liệu
        $this->call(OrderSeeder::class);
    }
}
