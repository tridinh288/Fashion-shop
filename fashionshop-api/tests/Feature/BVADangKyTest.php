<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * BVA Blackbox Test: Đăng ký tài khoản — POST /api/v1/register
 * Theo kịch bản Câu 3 BVA_DangKy_FashionShop.md (TC01-TC15)
 */
class BVADangKyTest extends TestCase
{
    use RefreshDatabase;

    private function register(int $fullnameChars, int $phoneDigits, int $passwordChars): \Illuminate\Testing\TestResponse
    {
        $pw = str_repeat('a', $passwordChars);
        return $this->postJson('/api/v1/register', [
            'fullname'              => str_repeat('A', $fullnameChars),
            'email'                 => 'test_' . uniqid() . '@example.com',
            'phone'                 => substr(str_repeat('1234567890', 4), 0, $phoneDigits),
            'gender'                => 'Nam',
            'password'              => $pw,
            'password_confirmation' => $pw,
        ]);
    }

    // =====================================================================
    // TestHopLeTaiBien — TC01-TC08
    // =====================================================================

    /** TC01 — V1,V2,V3,B3,B7,B11: fullname=128, phone=10, password=28 */
    public function test_tc01_tat_ca_hop_le_gia_tri_dai_dien(): void
    {
        $this->register(128, 10, 28)->assertStatus(201);
    }

    /** TC02 — V1,V2,V3,B1: fullname=2 (biên dưới) */
    public function test_tc02_fullname_tai_bien_duoi_min_2(): void
    {
        $this->register(2, 10, 28)->assertStatus(201);
    }

    /** TC03 — V1,V2,V3,B5: fullname=255 (biên trên) */
    public function test_tc03_fullname_tai_bien_tren_max_255(): void
    {
        $this->register(255, 10, 28)->assertStatus(201);
    }

    /** TC04 — V1,V2,V3,B6: phone=9 chữ số (biên dưới) */
    public function test_tc04_phone_tai_bien_duoi_9_chu_so(): void
    {
        $this->register(128, 9, 28)->assertStatus(201);
    }

    /** TC05 — V1,V2,V3,B8: phone=11 chữ số (biên trên) */
    public function test_tc05_phone_tai_bien_tren_11_chu_so(): void
    {
        $this->register(128, 11, 28)->assertStatus(201);
    }

    /** TC06 — V1,V2,V3,B9: password=6 ký tự (biên dưới) */
    public function test_tc06_password_tai_bien_duoi_min_6(): void
    {
        $this->register(128, 10, 6)->assertStatus(201);
    }

    /** TC07 — V1,V2,V3,B13: password=50 ký tự (biên trên) */
    public function test_tc07_password_tai_bien_tren_max_50(): void
    {
        $this->register(128, 10, 50)->assertStatus(201);
    }

    /** TC08 — V1,V2,V3,B1,B6,B9: fullname=2, phone=9, password=6 (tất cả tại min) */
    public function test_tc08_tat_ca_tai_bien_duoi_hop_le(): void
    {
        $this->register(2, 9, 6)->assertStatus(201);
    }

    // =====================================================================
    // TestKhongHopLe — TC09-TC15
    // =====================================================================

    /** TC09 — X1: fullname=1 ký tự (dưới biên dưới) */
    public function test_tc09_fullname_qua_ngan_1_ky_tu(): void
    {
        $this->register(1, 10, 28)->assertStatus(422);
    }

    /** TC10 — X2: fullname=256 ký tự (trên biên trên) */
    public function test_tc10_fullname_qua_dai_256_ky_tu(): void
    {
        $this->register(256, 10, 28)->assertStatus(422);
    }

    /** TC11 — X3: phone=8 chữ số (dưới biên dưới) */
    public function test_tc11_phone_thieu_chu_so_8(): void
    {
        $this->register(128, 8, 28)->assertStatus(422);
    }

    /** TC12 — X4: phone=12 chữ số (trên biên trên) */
    public function test_tc12_phone_du_chu_so_12(): void
    {
        $this->register(128, 12, 28)->assertStatus(422);
    }

    /** TC13 — X5: password=5 ký tự (dưới biên dưới) */
    public function test_tc13_password_qua_ngan_5_ky_tu(): void
    {
        $this->register(128, 10, 5)->assertStatus(422);
    }

    /** TC14 — X6: password=51 ký tự (trên biên trên) */
    public function test_tc14_password_qua_dai_51_ky_tu(): void
    {
        $this->register(128, 10, 51)->assertStatus(422);
    }

    /** TC15 — X1,X3,X5: fullname=1, phone=8, password=5 */
    public function test_tc15_nhieu_bien_sai_dong_thoi(): void
    {
        $this->register(1, 8, 5)->assertStatus(422);
    }
}
