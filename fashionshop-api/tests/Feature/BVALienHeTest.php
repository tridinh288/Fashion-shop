<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * BVA Blackbox Test: Gửi liên hệ — POST /api/v1/contacts
 * Theo kịch bản Câu 3 BVA_LienHe_FashionShop.md (TC01-TC15)
 */
class BVALienHeTest extends TestCase
{
    use RefreshDatabase;

    private function postContact(int $fullnameChars, int $messageChars): \Illuminate\Testing\TestResponse
    {
        return $this->postJson('/api/v1/contacts', [
            'fullname' => str_repeat('A', $fullnameChars),
            'email'    => 'test@example.com',
            'message'  => str_repeat('A', $messageChars),
        ]);
    }

    // =====================================================================
    // TestHopLeTaiBien — TC01-TC08
    // =====================================================================

    /** TC01 — V1,V2,B3,B8: fullname=128, message=505 */
    public function test_tc01_tat_ca_hop_le_gia_tri_dai_dien(): void
    {
        $this->postContact(128, 505)->assertStatus(201);
    }

    /** TC02 — V1,V2,B1: fullname=2 (biên dưới) */
    public function test_tc02_fullname_tai_bien_duoi_min_2(): void
    {
        $this->postContact(2, 505)->assertStatus(201);
    }

    /** TC03 — V1,V2,B5: fullname=255 (biên trên) */
    public function test_tc03_fullname_tai_bien_tren_max_255(): void
    {
        $this->postContact(255, 505)->assertStatus(201);
    }

    /** TC04 — V1,V2,B6: message=10 (biên dưới) */
    public function test_tc04_message_tai_bien_duoi_min_10(): void
    {
        $this->postContact(128, 10)->assertStatus(201);
    }

    /** TC05 — V1,V2,B10: message=1000 (biên trên) */
    public function test_tc05_message_tai_bien_tren_max_1000(): void
    {
        $this->postContact(128, 1000)->assertStatus(201);
    }

    /** TC06 — V1,V2,B2,B7: fullname=3 (min+), message=11 (min+) */
    public function test_tc06_fullname_minplus_message_minplus(): void
    {
        $this->postContact(3, 11)->assertStatus(201);
    }

    /** TC07 — V1,V2,B4,B9: fullname=254 (max-), message=999 (max-) */
    public function test_tc07_fullname_maxminus_message_maxminus(): void
    {
        $this->postContact(254, 999)->assertStatus(201);
    }

    /** TC08 — V1,V2,B1,B6: fullname=2, message=10 (tất cả tại min) */
    public function test_tc08_tat_ca_tai_bien_duoi_min(): void
    {
        $this->postContact(2, 10)->assertStatus(201);
    }

    // =====================================================================
    // TestKhongHopLe — TC09-TC15
    // =====================================================================

    /** TC09 — X1: fullname=1 ký tự (dưới biên dưới) */
    public function test_tc09_fullname_qua_ngan_1_ky_tu(): void
    {
        $this->postContact(1, 505)->assertStatus(422);
    }

    /** TC10 — X2: fullname=256 ký tự (trên biên trên) */
    public function test_tc10_fullname_qua_dai_256_ky_tu(): void
    {
        $this->postContact(256, 505)->assertStatus(422);
    }

    /** TC11 — X3: message=9 ký tự (dưới biên dưới) */
    public function test_tc11_message_qua_ngan_9_ky_tu(): void
    {
        $this->postContact(128, 9)->assertStatus(422);
    }

    /** TC12 — X3: message=0 ký tự (rỗng) */
    public function test_tc12_message_rong_0_ky_tu(): void
    {
        $this->postContact(128, 0)->assertStatus(422);
    }

    /** TC13 — X4: message=1001 ký tự (trên biên trên) */
    public function test_tc13_message_qua_dai_1001_ky_tu(): void
    {
        $this->postContact(128, 1001)->assertStatus(422);
    }

    /** TC14 — X1,X3: fullname=1, message=9 (cả hai vi phạm) */
    public function test_tc14_ca_hai_bien_sai(): void
    {
        $this->postContact(1, 9)->assertStatus(422);
    }

    /** TC15 — X4: fullname=255, message=1001 (chỉ message vi phạm) */
    public function test_tc15_fullname_hop_le_toi_da_message_sai(): void
    {
        $this->postContact(255, 1001)->assertStatus(422);
    }
}
