<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Admin;
use App\Models\Category;
use App\Models\Product;

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

        // Ảnh sản phẩm, gom theo nhóm danh mục + giới tính.
        // Danh sách này khớp với database/fix_images.sql; mọi file đều nằm sẵn
        // trong storage/app/public/products nên bản demo luôn có hình.
        $imagePools = [
            'ao' => [
                'products/0qZgVo1DlOSkUltmNm31Dm6ZMtXg340KRIAFcCja.png',
                'products/1d9zxdLcRjrY4AXf2KMJKROltLLSCZCGiNaVve2X.png',
                'products/ELXmoSC11ClGVr8vEcYnK0WUZwdAZgxbzckYNahH.png',
                'products/IAUKoaiMbJN4HQB7jKXHCeZzBITUEfhW4ChLOW2b.png',
                'products/QqnSI7kfQbz9h1tqRYeFye0fDOgDp2JQqeFlV7XO.png',
                'products/X8IzX0JOPbWejrlrQCq8D6FTqv8QDoAS07tt1i1E.png',
                'products/d4zr4OPofFe3tAo8JV7qvqWYBeJz114sO1AfIaCM.png',
                'products/hsJocfs8RVEhkyE2DY1lgq37V4M82A748OGMcKuf.png',
                'products/nDu62q34y1BZX5omROjw5aetRURPgAyp1I68D9ad.png',
                'products/o5AZUSEQWyHSUy6gSYDbK5Id7UlrBR9EgL8zMOUY.png',
                'products/tvDNxx7fLmomL7rMjqYKy3kIlWbCzIMUrg6zZvB7.png',
                'products/0EydYSJ5hBb942DdEUfrbiXPJdx9dHHBKin0pEJd.png',
                'products/XntHkvWIbZyfeZAFbvIfDrgMjcPsZ2rdf7dfCvHg.png',
                'products/ohtkN7q479lzBYmCr8frjNhY7Hep89J5xqMEHikr.png',
                'products/q21gPtS0euTw0GGD1mv9VZO14Ap9EfGOmhrVy6Oy.png',
                'products/qe84CPzmdjHiG95kMkyqn7uAZ6AGS3UP2YYvf4kh.png',
                'products/vQCodBNEMiMqq0cs8ILlm0VNO3GZnh0PelxzFFEM.png',
            ],
            'jean_nam' => [
                'products/6ORezVoLQ4ypWIK3Klq9GBIJ0x9frvSqWFsBl2JL.png',
                'products/CMnew5jb6KUun6hC026sOKJMEmDQnxUDJti4tuWT.png',
                'products/SmApiDSzATaIQqhIRrFa8YYWobhuYRce6t87owck.png',
                'products/fHYV4K6n0eZTVpdsMl9ts22NzB3DNPM2yHJlhU2B.png',
                'products/r1c1YQ1wZteltHaWVEmjZROzkGZA2S1HIGoLnrD2.png',
            ],
            'jean_nu' => [
                'products/OxVLo0Q8zyw5H4L1PAfi0VjXZwnTymiI1ZrWqHz1.png',
                'products/WNgeDdG8P7UJtPLfvyGJiFBVTf7HTOpuxeNORi5k.png',
                'products/lEFVlVaeRyCyeiWhvTZ2GFHATTh5VqdX3qET5sxf.png',
                'products/xc8EKAefrtOiBjxXOVT65iKRWkMt8jpet5584P8a.png',
                'products/zgORCAZfrfmkIaqQG2y7DEMj0qFsQ8pQL5YhbX7g.png',
            ],
            'kaki_nam' => [
                'products/K1P7UPDUIOpi9k3tAys6MCfxviFM93OY1aAMuCZi.png',
                'products/KR6MpBJbbgX7SK2GlDdQZ801IOL2q3jNUISHfYKz.png',
                'products/T4bRuI3emwr15o2vbVP9cFwCZjeCTWZsH6dyOz2a.png',
                'products/krxjYCASSKtlVcgjws7S7gtGiUvR3edaMgbPsyf4.png',
                'products/xDoKAQjG4AV96Czu541uts1u6YjFRCqvDBEECIwX.png',
            ],
            'kaki_nu' => [
                'products/GTyKDIULZwNHTy8iNSxaLP1kXkcmunyV1rabEIks.png',
                'products/SGUtf6N6haYMh4AaQWfgrqYLV2hXmxtIIYCvKQ2l.png',
                'products/quantayongxuongnam.png',
                'products/tWgLPbjJh6GJPkTZqouB3jIVKxJFtylKh7bPYbUp.png',
                'products/trEXWuWREZZ5q2ThJ5NzwdM02AlOj1cAXCxtdctw.png',
                'products/wRUF1b7hyhiy06yWRjgaq3yfNJZJxdUITsYdtYrf.png',
            ],
            'quan_tay' => [
                'products/quantayongxuongnam.png',
                'products/K1P7UPDUIOpi9k3tAys6MCfxviFM93OY1aAMuCZi.png',
            ],
            'short_nam' => [
                'products/EDfBIulu9Uf4pBWjCvuhUMEox2llwNAmgmUsRROf.png',
                'products/TTwBwctqgRTzlV5ihwjVb0aYwn6GPPoPha1hDxwc.png',
                'products/XXs38CZ56ly0ft8V9S7HNZS5umd8HCx63fpgFXpS.png',
                'products/g3vUPevQ4jIFpcLBIPdeksvAraEXKGPMZJ1dljLb.png',
                'products/jG7KjQaLeGkvtQFvxVPA1SyQTEXiLkug9Kju7iI1.png',
                'products/vU88rbcIMkOhJ0yK59WHr6VSqfCK3y2slzkh7Aoy.png',
            ],
            'short_nu' => [
                'products/j0n7PZcXEUMyn09u45sqPv4bckilsWY5d5maVIlq.png',
                'products/vNdSsgKH42i0cpH0rcHAWItclMEs9Zqt1V1DIn3h.png',
                'products/vluLz8z9znqInNrUmBSpuGvAwrKiPm2M5yTTsmnw.png',
            ],
        ];

        // Danh mục nào dùng nhóm ảnh nào
        $poolFor = function (string $category, int $gioiTinh): string {
            $nam = $gioiTinh === 1;

            return match ($category) {
                'Quần Tây'   => 'quan_tay',
                'Quần Jean'  => $nam ? 'jean_nam' : 'jean_nu',
                'Quần Kaki'  => $nam ? 'kaki_nam' : 'kaki_nu',
                'Quần Short' => $nam ? 'short_nam' : 'short_nu',
                default      => 'ao',
            };
        };

        $catNameById = array_flip($catIds->toArray());
        $used = [];

        foreach ($products as $p) {
            $pool = $poolFor($catNameById[$p['category_id']], $p['gioi_tinh']);
            $images = $imagePools[$pool];

            // Xoay vòng trong nhóm để các sản phẩm cùng loại không trùng ảnh
            $index = $used[$pool] ?? 0;
            $used[$pool] = $index + 1;
            $p['hinh_anh'] = $images[$index % count($images)];

            Product::firstOrCreate(['ten_sp' => $p['ten_sp']], $p);
        }

        // Đơn hàng mẫu để dashboard quản trị có số liệu
        $this->call(OrderSeeder::class);
    }
}
