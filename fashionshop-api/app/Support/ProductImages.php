<?php

namespace App\Support;

/**
 * Kho ảnh sản phẩm dùng chung cho seeder và lệnh điền ảnh.
 *
 * Ảnh được gom theo nhóm danh mục + giới tính; mọi file đều nằm sẵn trong
 * storage/app/public/products nên bản demo luôn có hình.
 */
class ProductImages
{
    /** Tên danh mục ứng với id, theo đúng thứ tự seeder tạo */
    private const CATEGORY_POOLS = [
        1 => 'quan_tay',   // Quần Tây
        2 => 'jean',       // Quần Jean
        3 => 'kaki',       // Quần Kaki
        4 => 'short',      // Quần Short
    ];

    /**
     * @return array<string, list<string>>
     */
    public static function pools(): array
    {
        return [
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
    }

    /**
     * Nhóm ảnh phù hợp với một sản phẩm.
     *
     * Tên sản phẩm được ưu tiên hơn category_id, vì dữ liệu cũ có những dòng
     * gắn sai danh mục (áo nằm trong danh mục quần) và sẽ nhận nhầm ảnh nếu
     * chỉ tra theo id. Danh mục áo và mọi danh mục lạ đều rơi về nhóm "ao".
     */
    public static function poolName(?int $categoryId, ?int $gioiTinh, ?string $tenSp = null): string
    {
        $base = self::baseFromName($tenSp) ?? self::CATEGORY_POOLS[$categoryId] ?? 'ao';

        if ($base === 'quan_tay' || $base === 'ao') {
            return $base;
        }

        return $base . ($gioiTinh === 1 ? '_nam' : '_nu');
    }

    /**
     * Đoán loại hàng từ tên sản phẩm. Trả về null khi tên không nói lên điều gì.
     */
    private static function baseFromName(?string $tenSp): ?string
    {
        if ($tenSp === null || $tenSp === '') {
            return null;
        }

        $name = mb_strtolower($tenSp);

        return match (true) {
            str_contains($name, 'áo')       => 'ao',
            str_contains($name, 'short')    => 'short',
            str_contains($name, 'jean')     => 'jean',
            str_contains($name, 'kaki')     => 'kaki',
            str_contains($name, 'quần tây') => 'quan_tay',
            default                         => null,
        };
    }

    /**
     * Chọn ảnh thứ $index trong nhóm, xoay vòng để sản phẩm cùng loại không trùng.
     */
    public static function pick(string $pool, int $index): ?string
    {
        $images = self::pools()[$pool] ?? [];

        return $images === [] ? null : $images[$index % count($images)];
    }
}
