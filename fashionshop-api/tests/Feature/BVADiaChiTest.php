<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * BVA Blackbox Test: Thêm địa chỉ giao hàng — POST /api/v1/addresses
 * Theo kịch bản Câu 3 BVA_DiaChi_FashionShop.md (TC01-TC15)
 */
class BVADiaChiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user  = User::factory()->create(['fullname' => 'Test User']);
        $this->token = $this->user->createToken('auth_token')->plainTextToken;
    }

    private function auth(): array
    {
        return ['Authorization' => "Bearer {$this->token}"];
    }

    private function postAddress(int $fullnameChars, int $phoneDigits, int $addressChars): \Illuminate\Testing\TestResponse
    {
        return $this->withHeaders($this->auth())->postJson('/api/v1/addresses', [
            'fullname'        => str_repeat('A', $fullnameChars),
            'phone'           => substr(str_repeat('1234567890', 3), 0, $phoneDigits),
            'address_details' => str_repeat('A', $addressChars),
        ]);
    }

    // =====================================================================
    // TestHopLeTaiBien — TC01-TC08
    // =====================================================================

    /** TC01 — V1,V2,V3,B3,B7,B11: fullname=128, phone=10, address_details=252 */
    public function test_tc01_tat_ca_hop_le_gia_tri_dai_dien(): void
    {
        $this->postAddress(128, 10, 252)->assertStatus(201);
    }

    /** TC02 — V1,V2,V3,B1: fullname=2 (biên dưới) */
    public function test_tc02_fullname_tai_bien_duoi_min_2(): void
    {
        $this->postAddress(2, 10, 252)->assertStatus(201);
    }

    /** TC03 — V1,V2,V3,B5: fullname=255 (biên trên) */
    public function test_tc03_fullname_tai_bien_tren_max_255(): void
    {
        $this->postAddress(255, 10, 252)->assertStatus(201);
    }

    /** TC04 — V1,V2,V3,B6: phone=9 chữ số (biên dưới) */
    public function test_tc04_phone_tai_bien_duoi_9_chu_so(): void
    {
        $this->postAddress(128, 9, 252)->assertStatus(201);
    }

    /** TC05 — V1,V2,V3,B8: phone=11 chữ số (biên trên) */
    public function test_tc05_phone_tai_bien_tren_11_chu_so(): void
    {
        $this->postAddress(128, 11, 252)->assertStatus(201);
    }

    /** TC06 — V1,V2,V3,B9: address_details=5 ký tự (biên dưới) */
    public function test_tc06_address_tai_bien_duoi_5_ky_tu(): void
    {
        $this->postAddress(128, 10, 5)->assertStatus(201);
    }

    /** TC07 — V1,V2,V3,B13: address_details=500 ký tự (biên trên) */
    public function test_tc07_address_tai_bien_tren_500_ky_tu(): void
    {
        $this->postAddress(128, 10, 500)->assertStatus(201);
    }

    /** TC08 — V1,V2,V3,B1,B6,B9: fullname=2, phone=9, address_details=5 */
    public function test_tc08_tat_ca_tai_bien_duoi_hop_le(): void
    {
        $this->postAddress(2, 9, 5)->assertStatus(201);
    }

    // =====================================================================
    // TestKhongHopLe — TC09-TC15
    // =====================================================================

    /** TC09 — X1: fullname=1 ký tự (dưới biên dưới) */
    public function test_tc09_fullname_qua_ngan_1_ky_tu(): void
    {
        $this->postAddress(1, 10, 252)->assertStatus(422);
    }

    /** TC10 — X2: fullname=256 ký tự (trên biên trên) */
    public function test_tc10_fullname_qua_dai_256_ky_tu(): void
    {
        $this->postAddress(256, 10, 252)->assertStatus(422);
    }

    /** TC11 — X3: phone=8 chữ số (dưới biên dưới) */
    public function test_tc11_phone_thieu_chu_so_8(): void
    {
        $this->postAddress(128, 8, 252)->assertStatus(422);
    }

    /** TC12 — X4: phone=12 chữ số (trên biên trên) */
    public function test_tc12_phone_du_chu_so_12(): void
    {
        $this->postAddress(128, 12, 252)->assertStatus(422);
    }

    /** TC13 — X5: address_details=4 ký tự (dưới biên dưới) */
    public function test_tc13_address_qua_ngan_4_ky_tu(): void
    {
        $this->postAddress(128, 10, 4)->assertStatus(422);
    }

    /** TC14 — X6: address_details=501 ký tự (trên biên trên) */
    public function test_tc14_address_qua_dai_501_ky_tu(): void
    {
        $this->postAddress(128, 10, 501)->assertStatus(422);
    }

    /** TC15 — X1,X3,X5: fullname=1, phone=8, address=4 */
    public function test_tc15_nhieu_bien_sai_dong_thoi(): void
    {
        $this->postAddress(1, 8, 4)->assertStatus(422);
    }
}
