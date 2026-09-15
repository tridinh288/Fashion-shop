<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * BVA Blackbox Test: Thêm sản phẩm vào giỏ hàng — POST /api/v1/cart
 * Theo kịch bản Câu 3 BVA_ThemGioHang_FashionShop.md (TC01-TC15)
 *
 * CartController trả HTTP 200 cho cả thành công lẫn thất bại.
 * Phân biệt bằng "errors" key trong response body.
 */
class BVAThemGioHangTest extends TestCase
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

    private function addToCart(int $quantity, string $size): \Illuminate\Testing\TestResponse
    {
        return $this->withHeaders($this->auth())->postJson('/api/v1/cart', [
            'product_id' => $this->productId,
            'quantity'   => $quantity,
            'size'       => $size,
        ]);
    }

    private function isCartSuccess(\Illuminate\Testing\TestResponse $resp): bool
    {
        return $resp->status() === 200 && !array_key_exists('errors', $resp->json() ?? []);
    }

    private function isCartError(\Illuminate\Testing\TestResponse $resp): bool
    {
        return $resp->status() === 200 && array_key_exists('errors', $resp->json() ?? []);
    }

    // =====================================================================
    // TestHopLeTaiBien — TC01-TC08
    // =====================================================================

    /** TC01 — V1,V2,B3: quantity=25, size=M */
    public function test_tc01_tat_ca_hop_le_gia_tri_dai_dien(): void
    {
        $this->assertTrue($this->isCartSuccess($this->addToCart(25, 'M')));
    }

    /** TC02 — V1,V2,B1: quantity=1 (biên dưới), size=M */
    public function test_tc02_quantity_tai_bien_duoi_min_1(): void
    {
        $this->assertTrue($this->isCartSuccess($this->addToCart(1, 'M')));
    }

    /** TC03 — V1,V2,B5: quantity=50 (biên trên), size=M */
    public function test_tc03_quantity_tai_bien_tren_max_50(): void
    {
        $this->assertTrue($this->isCartSuccess($this->addToCart(50, 'M')));
    }

    /** TC04 — V1,V2,B2: quantity=2 (min+), size=S */
    public function test_tc04_quantity_minplus_size_S(): void
    {
        $this->assertTrue($this->isCartSuccess($this->addToCart(2, 'S')));
    }

    /** TC05 — V1,V2,B4: quantity=49 (max-), size=L */
    public function test_tc05_quantity_maxminus_size_L(): void
    {
        $this->assertTrue($this->isCartSuccess($this->addToCart(49, 'L')));
    }

    /** TC06 — V1,V2: quantity=25, size=XL (phần tử cuối tập hợp lệ) */
    public function test_tc06_size_XL_phan_tu_cuoi_tap_hop_le(): void
    {
        $this->assertTrue($this->isCartSuccess($this->addToCart(25, 'XL')));
    }

    /** TC07 — V1,V2: quantity=25, size=S (phần tử đầu tập hợp lệ) */
    public function test_tc07_size_S_phan_tu_dau_tap_hop_le(): void
    {
        $this->assertTrue($this->isCartSuccess($this->addToCart(25, 'S')));
    }

    /** TC08 — V1,V2,B1: quantity=1 (min), size=XL */
    public function test_tc08_quantity_min_size_XL(): void
    {
        $this->assertTrue($this->isCartSuccess($this->addToCart(1, 'XL')));
    }

    // =====================================================================
    // TestKhongHopLe — TC09-TC15
    // =====================================================================

    /** TC09 — X1: quantity=0 (dưới biên dưới) */
    public function test_tc09_quantity_bang_0_duoi_bien_duoi(): void
    {
        $this->assertTrue($this->isCartError($this->addToCart(0, 'M')));
    }

    /** TC10 — X1: quantity=-1 (số âm) */
    public function test_tc10_quantity_am_1(): void
    {
        $this->assertTrue($this->isCartError($this->addToCart(-1, 'M')));
    }

    /** TC11 — X2: quantity=51 (vượt tồn kho 50) */
    public function test_tc11_quantity_51_vuot_ton_kho(): void
    {
        $this->assertTrue($this->isCartError($this->addToCart(51, 'M')));
    }

    /** TC12 — X3: size="XXL" (không tồn tại) */
    public function test_tc12_size_XXL_khong_hop_le(): void
    {
        $this->assertTrue($this->isCartError($this->addToCart(25, 'XXL')));
    }

    /** TC13 — X3: size="A" (không hợp lệ) */
    public function test_tc13_size_A_khong_hop_le(): void
    {
        $this->assertTrue($this->isCartError($this->addToCart(25, 'A')));
    }

    /** TC14 — X1,X3: quantity=0, size="XXL" */
    public function test_tc14_quantity_va_size_deu_sai(): void
    {
        $this->assertTrue($this->isCartError($this->addToCart(0, 'XXL')));
    }

    /** TC15 — X2: quantity=51, size=L */
    public function test_tc15_quantity_vuot_max_size_hop_le(): void
    {
        $this->assertTrue($this->isCartError($this->addToCart(51, 'L')));
    }
}
