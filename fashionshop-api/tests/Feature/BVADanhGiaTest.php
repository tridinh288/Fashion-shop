<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * BVA Blackbox Test: Đánh giá sản phẩm — POST /api/v1/products/{id}/reviews
 * Theo kịch bản Câu 3 BVA_DanhGia_FashionShop.md (TC01-TC15)
 */
class BVADanhGiaTest extends TestCase
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

    private function postReview(int $rating, int $commentChars): \Illuminate\Testing\TestResponse
    {
        return $this->withHeaders($this->auth())->postJson(
            "/api/v1/products/{$this->productId}/reviews",
            [
                'rating'  => $rating,
                'comment' => str_repeat('A', $commentChars),
            ]
        );
    }

    // =====================================================================
    // TestHopLeTaiBien — TC01-TC08
    // =====================================================================

    /** TC01 — V1,V2,B3,B8: rating=3, comment=252 */
    public function test_tc01_tat_ca_hop_le_gia_tri_dai_dien(): void
    {
        $this->postReview(3, 252)->assertStatus(201);
    }

    /** TC02 — V1,V2,B1: rating=1 (biên dưới) */
    public function test_tc02_rating_tai_bien_duoi_1_sao(): void
    {
        $this->postReview(1, 252)->assertStatus(201);
    }

    /** TC03 — V1,V2,B5: rating=5 (biên trên) */
    public function test_tc03_rating_tai_bien_tren_5_sao(): void
    {
        $this->postReview(5, 252)->assertStatus(201);
    }

    /** TC04 — V1,V2,B6: comment=5 ký tự (biên dưới) */
    public function test_tc04_comment_tai_bien_duoi_5_ky_tu(): void
    {
        $this->postReview(3, 5)->assertStatus(201);
    }

    /** TC05 — V1,V2,B10: comment=500 ký tự (biên trên) */
    public function test_tc05_comment_tai_bien_tren_500_ky_tu(): void
    {
        $this->postReview(3, 500)->assertStatus(201);
    }

    /** TC06 — V1,V2,B2,B7: rating=2 (min+), comment=6 ký tự (min+) */
    public function test_tc06_rating_minplus_comment_minplus(): void
    {
        $this->postReview(2, 6)->assertStatus(201);
    }

    /** TC07 — V1,V2,B4,B9: rating=4 (max-), comment=499 ký tự (max-) */
    public function test_tc07_rating_maxminus_comment_maxminus(): void
    {
        $this->postReview(4, 499)->assertStatus(201);
    }

    /** TC08 — V1,V2,B1,B6: rating=1, comment=5 ký tự (tất cả tại min) */
    public function test_tc08_tat_ca_tai_bien_duoi_min(): void
    {
        $this->postReview(1, 5)->assertStatus(201);
    }

    // =====================================================================
    // TestKhongHopLe — TC09-TC15
    // =====================================================================

    /** TC09 — X1: rating=0 (dưới biên dưới) */
    public function test_tc09_rating_bang_0_duoi_bien_duoi(): void
    {
        $this->postReview(0, 252)->assertStatus(422);
    }

    /** TC10 — X1: rating=-1 (âm) */
    public function test_tc10_rating_am_1(): void
    {
        $this->postReview(-1, 252)->assertStatus(422);
    }

    /** TC11 — X2: rating=6 (trên biên trên) */
    public function test_tc11_rating_bang_6_tren_bien_tren(): void
    {
        $this->postReview(6, 252)->assertStatus(422);
    }

    /** TC12 — X3: comment=4 ký tự (dưới biên dưới) */
    public function test_tc12_comment_4_ky_tu_duoi_min(): void
    {
        $this->postReview(3, 4)->assertStatus(422);
    }

    /** TC13 — X4: comment=501 ký tự (trên biên trên) */
    public function test_tc13_comment_501_ky_tu_tren_max(): void
    {
        $this->postReview(3, 501)->assertStatus(422);
    }

    /** TC14 — X1,X3: rating=0, comment=4 ký tự */
    public function test_tc14_ca_hai_bien_sai_dong_thoi(): void
    {
        $this->postReview(0, 4)->assertStatus(422);
    }

    /** TC15 — X4: rating=5, comment=501 ký tự (chỉ comment vi phạm) */
    public function test_tc15_rating_5_comment_501_chi_comment_sai(): void
    {
        $this->postReview(5, 501)->assertStatus(422);
    }
}
