<?php

namespace Tests\Feature;

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * BVA Blackbox Test: Quản lý sản phẩm (Admin) — POST /api/v1/admin/products
 * Theo kịch bản Câu 3 BVA_QuanLySanPham_FashionShop.md (TC01-TC16)
 */
class BVAQuanLySanPhamTest extends TestCase
{
    use RefreshDatabase;

    private Admin $admin;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = Admin::create([
            'fullname' => 'Admin Test',
            'email'    => 'admin@test.com',
            'phone'    => '0900000000',
            'password' => Hash::make('admin123'),
        ]);
        $this->token = $this->admin->createToken('admin_token')->plainTextToken;
    }

    private function auth(): array
    {
        return ['Authorization' => "Bearer {$this->token}"];
    }

    private function createProduct(int $tenSpChars, int $gia, int $soLuong): \Illuminate\Testing\TestResponse
    {
        return $this->withHeaders($this->auth())->postJson('/api/v1/admin/products', [
            'ten_sp'    => $tenSpChars > 0 ? str_repeat('A', $tenSpChars) : '',
            'gia'       => $gia,
            'gia_cu'    => null,
            'so_luong'  => $soLuong,
            'gioi_tinh' => 0,
            'mo_ta'     => 'Mo ta san pham test BVA',
        ]);
    }

    // =====================================================================
    // TestHopLeTaiBien — TC01-TC08, TC16
    // =====================================================================

    /** TC01 — V1,V2,V3,B3,B8,B13: ten_sp=128, gia=500000000, so_luong=5000 */
    public function test_tc01_tat_ca_hop_le_gia_tri_dai_dien(): void
    {
        $this->createProduct(128, 500_000_000, 5000)->assertStatus(201);
    }

    /** TC02 — V1,V2,V3,B1: ten_sp=1 ký tự (biên dưới) */
    public function test_tc02_ten_sp_tai_bien_duoi_min_1(): void
    {
        $this->createProduct(1, 500_000_000, 5000)->assertStatus(201);
    }

    /** TC03 — V1,V2,V3,B5: ten_sp=255 ký tự (biên trên) */
    public function test_tc03_ten_sp_tai_bien_tren_max_255(): void
    {
        $this->createProduct(255, 500_000_000, 5000)->assertStatus(201);
    }

    /** TC04 — V1,V2,V3,B6: gia=0 (biên dưới, sản phẩm miễn phí) */
    public function test_tc04_gia_bang_0_san_pham_mien_phi(): void
    {
        $this->createProduct(128, 0, 5000)->assertStatus(201);
    }

    /** TC05 — V1,V2,V3,B10: gia=999999999 (biên trên) */
    public function test_tc05_gia_tai_bien_tren_999_999_999(): void
    {
        $this->createProduct(128, 999_999_999, 5000)->assertStatus(201);
    }

    /** TC06 — V1,V2,V3,B11: so_luong=0 (biên dưới, hết hàng) */
    public function test_tc06_so_luong_bang_0_het_hang(): void
    {
        $this->createProduct(128, 500_000_000, 0)->assertStatus(201);
    }

    /** TC07 — V1,V2,V3,B15: so_luong=10000 (biên trên) */
    public function test_tc07_so_luong_tai_bien_tren_10000(): void
    {
        $this->createProduct(128, 500_000_000, 10000)->assertStatus(201);
    }

    /** TC08 — V1,V2,V3,B1,B6,B11: ten_sp=1, gia=0, so_luong=0 (tất cả tại min) */
    public function test_tc08_tat_ca_tai_bien_duoi_hop_le(): void
    {
        $this->createProduct(1, 0, 0)->assertStatus(201);
    }

    /** TC16 — V1,V2,V3,B7,B12: ten_sp=128, gia=1 (min+), so_luong=1 (min+) */
    public function test_tc16_gia_minplus_so_luong_minplus(): void
    {
        $this->createProduct(128, 1, 1)->assertStatus(201);
    }

    // =====================================================================
    // TestKhongHopLe — TC09-TC15
    // =====================================================================

    /** TC09 — X1: ten_sp rỗng */
    public function test_tc09_ten_sp_rong_0_ky_tu(): void
    {
        $this->createProduct(0, 500_000_000, 5000)->assertStatus(422);
    }

    /** TC10 — X2: ten_sp=256 ký tự (trên biên trên) */
    public function test_tc10_ten_sp_qua_dai_256_ky_tu(): void
    {
        $this->createProduct(256, 500_000_000, 5000)->assertStatus(422);
    }

    /** TC11 — X3: gia=-1 (âm) */
    public function test_tc11_gia_am_1(): void
    {
        $this->createProduct(128, -1, 5000)->assertStatus(422);
    }

    /** TC12 — X4: gia=1000000000 (vượt giới hạn 999999999) */
    public function test_tc12_gia_vuot_gioi_han_1_ty(): void
    {
        $this->createProduct(128, 1_000_000_000, 5000)->assertStatus(422);
    }

    /** TC13 — X5: so_luong=-1 (âm) */
    public function test_tc13_so_luong_am_1(): void
    {
        $this->createProduct(128, 500_000_000, -1)->assertStatus(422);
    }

    /** TC14 — X6: so_luong=10001 (vượt giới hạn 10000) */
    public function test_tc14_so_luong_vuot_gioi_han_10001(): void
    {
        $this->createProduct(128, 500_000_000, 10001)->assertStatus(422);
    }

    /** TC15 — X1,X3,X5: ten_sp rỗng, gia=-1, so_luong=-1 */
    public function test_tc15_tat_ca_bien_sai_dong_thoi(): void
    {
        $this->createProduct(0, -1, -1)->assertStatus(422);
    }
}
