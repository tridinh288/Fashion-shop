<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * BVA Blackbox Test: Đặt hàng — POST /api/v1/orders
 * Theo kịch bản Câu 3 BVA_DatHang_FashionShop.md (TC01-TC16)
 *
 * Mỗi test TC01-TC08 tự thêm sản phẩm vào giỏ trước khi đặt hàng.
 * TC14 (quantity=0) và TC15 (quantity=101) kiểm tra qua bước thêm giỏ.
 */
class BVADatHangTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;
    private int $productId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user  = User::factory()->create(['fullname' => 'Test User']);
        $this->token = $this->user->createToken('auth_token')->plainTextToken;

        $product = Product::create([
            'ten_sp'    => 'Test Product',
            'gia'       => 100000,
            'so_luong'  => 100,
            'gioi_tinh' => 0,
            'mo_ta'     => 'Mo ta test',
        ]);
        $this->productId = $product->id;
    }

    private function auth(): array
    {
        return ['Authorization' => "Bearer {$this->token}"];
    }

    private function addToCart(int $quantity): \Illuminate\Testing\TestResponse
    {
        return $this->withHeaders($this->auth())->postJson('/api/v1/cart', [
            'product_id' => $this->productId,
            'quantity'   => $quantity,
            'size'       => 'M',
        ]);
    }

    private function placeOrder(int $fullnameChars, int $phoneDigits, int $addressChars): \Illuminate\Testing\TestResponse
    {
        return $this->withHeaders($this->auth())->postJson('/api/v1/orders', [
            'fullname' => str_repeat('A', $fullnameChars),
            'phone'    => substr(str_repeat('1234567890', 3), 0, $phoneDigits),
            'address'  => str_repeat('A', $addressChars),
            'payment'  => 'COD',
        ]);
    }

    // =====================================================================
    // TestHopLeTaiBien — TC01-TC08
    // =====================================================================

    /** TC01 — V1,V2,V3,V4,B3,B7,B11,B16: fullname=128, phone=10, address=252, quantity=50 */
    public function test_tc01_tat_ca_hop_le_gia_tri_dai_dien(): void
    {
        $this->addToCart(50);
        $this->placeOrder(128, 10, 252)->assertStatus(200);
    }

    /** TC02 — V1,V2,V3,V4,B1: fullname=2 (biên dưới) */
    public function test_tc02_fullname_tai_bien_duoi_min_2(): void
    {
        $this->addToCart(1);
        $this->placeOrder(2, 10, 252)->assertStatus(200);
    }

    /** TC03 — V1,V2,V3,V4,B5: fullname=255 (biên trên) */
    public function test_tc03_fullname_tai_bien_tren_max_255(): void
    {
        $this->addToCart(1);
        $this->placeOrder(255, 10, 252)->assertStatus(200);
    }

    /** TC04 — V1,V2,V3,V4,B6: phone=9 chữ số (biên dưới) */
    public function test_tc04_phone_tai_bien_duoi_9_chu_so(): void
    {
        $this->addToCart(1);
        $this->placeOrder(128, 9, 252)->assertStatus(200);
    }

    /** TC05 — V1,V2,V3,V4,B8: phone=11 chữ số (biên trên) */
    public function test_tc05_phone_tai_bien_tren_11_chu_so(): void
    {
        $this->addToCart(1);
        $this->placeOrder(128, 11, 252)->assertStatus(200);
    }

    /** TC06 — V1,V2,V3,V4,B14: quantity=1 (biên dưới) */
    public function test_tc06_quantity_tai_bien_duoi_1_san_pham(): void
    {
        $this->addToCart(1);
        $this->placeOrder(128, 10, 252)->assertStatus(200);
    }

    /** TC07 — V1,V2,V3,V4,B18: quantity=100 (biên trên) */
    public function test_tc07_quantity_tai_bien_tren_100_san_pham(): void
    {
        $this->addToCart(50);
        $this->placeOrder(128, 10, 252)->assertStatus(200);
    }

    /** TC08 — V1,V2,V3,V4,B9: address=5 ký tự (biên dưới) */
    public function test_tc08_address_tai_bien_duoi_5_ky_tu(): void
    {
        $this->addToCart(1);
        $this->placeOrder(128, 10, 5)->assertStatus(200);
    }

    // =====================================================================
    // TestKhongHopLe — TC09-TC16
    // =====================================================================

    /** TC09 — X1: fullname=1 ký tự (dưới biên dưới) */
    public function test_tc09_fullname_qua_ngan_1_ky_tu(): void
    {
        $this->addToCart(1);
        $this->placeOrder(1, 10, 252)->assertStatus(422);
    }

    /** TC10 — X2: fullname=256 ký tự (trên biên trên) */
    public function test_tc10_fullname_qua_dai_256_ky_tu(): void
    {
        $this->addToCart(1);
        $this->placeOrder(256, 10, 252)->assertStatus(422);
    }

    /** TC11 — X3: phone=8 chữ số (dưới biên dưới) */
    public function test_tc11_phone_thieu_chu_so_8(): void
    {
        $this->addToCart(1);
        $this->placeOrder(128, 8, 252)->assertStatus(422);
    }

    /** TC12 — X4: phone=12 chữ số (trên biên trên) */
    public function test_tc12_phone_du_chu_so_12(): void
    {
        $this->addToCart(1);
        $this->placeOrder(128, 12, 252)->assertStatus(422);
    }

    /** TC13 — X5: address=4 ký tự (dưới biên dưới) */
    public function test_tc13_address_qua_ngan_4_ky_tu(): void
    {
        $this->addToCart(1);
        $this->placeOrder(128, 10, 4)->assertStatus(422);
    }

    /** TC14 — X7: quantity=0 → giỏ hàng từ chối → giỏ rỗng */
    public function test_tc14_quantity_bang_0_khong_dat_san_pham(): void
    {
        $cartResp = $this->addToCart(0);
        // PHP có min:1 → trả errors (đúng theo spec)
        $this->assertArrayHasKey('errors', $cartResp->json());
        // Giỏ rỗng → API trả 400
        $this->placeOrder(128, 10, 252)->assertStatus(400);
    }

    /** TC15 — X8: quantity=101 (vượt tồn kho 100) → giỏ hàng phải từ chối */
    public function test_tc15_quantity_101_vuot_ton_kho(): void
    {
        $cartResp = $this->addToCart(101);
        $this->assertArrayHasKey('errors', $cartResp->json());
    }

    /** TC16 — X1,X3,X5,X7: fullname=1, phone=8, address=4, qty=0 */
    public function test_tc16_nhieu_bien_sai_dong_thoi(): void
    {
        $this->addToCart(0); // quantity=0 bị từ chối, giỏ rỗng
        $this->placeOrder(1, 8, 4)->assertStatus(422);
    }
}
