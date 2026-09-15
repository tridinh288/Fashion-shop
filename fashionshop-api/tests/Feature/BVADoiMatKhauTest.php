<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * BVA Blackbox Test: Đổi mật khẩu — PUT /api/v1/profile/password
 * Theo kịch bản Câu 3 BVA_DoiMatKhau_FashionShop.md (TC01-TC15)
 *
 * Mỗi test dùng fresh user riêng (RefreshDatabase) vì sau mỗi lần
 * đổi mật khẩu thành công, token cũ bị thu hồi.
 */
class BVADoiMatKhauTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'Password123';

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user  = User::factory()->create([
            'fullname' => 'Test User',
            'password' => Hash::make(self::PASSWORD),
        ]);
        $this->token = $this->user->createToken('auth_token')->plainTextToken;
    }

    private function auth(): array
    {
        return ['Authorization' => "Bearer {$this->token}"];
    }

    private function changePassword(string $oldPw, string $newPw): \Illuminate\Testing\TestResponse
    {
        return $this->withHeaders($this->auth())->putJson('/api/v1/profile/password', [
            'old_password'              => $oldPw,
            'new_password'              => $newPw,
            'new_password_confirmation' => $newPw,
        ]);
    }

    // =====================================================================
    // TestHopLeTaiBien — TC01-TC08
    // =====================================================================

    /** TC01 — V1,V2,B3,B8: old_password hợp lệ, new_password=28 ký tự */
    public function test_tc01_tat_ca_hop_le_gia_tri_dai_dien(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 28))->assertStatus(200);
    }

    /** TC02 — V1,V2,B1: old_password hợp lệ, new_password=6 ký tự (biên dưới) */
    public function test_tc02_new_password_tai_bien_duoi_min_6(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 6))->assertStatus(200);
    }

    /** TC03 — V1,V2,B5: old_password hợp lệ, new_password=50 ký tự (biên trên) */
    public function test_tc03_new_password_tai_bien_tren_max_50(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 50))->assertStatus(200);
    }

    /** TC04 — V1,V2,B2: old_password hợp lệ, new_password=7 ký tự (min+) */
    public function test_tc04_new_password_minplus(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 7))->assertStatus(200);
    }

    /** TC05 — V1,V2,B4: old_password hợp lệ, new_password=49 ký tự (max-) */
    public function test_tc05_new_password_maxminus(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 49))->assertStatus(200);
    }

    /** TC06 — V1,V2,B6,B7: old_password hợp lệ, new_password=6 (min) */
    public function test_tc06_new_password_tai_bien_duoi(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 6))->assertStatus(200);
    }

    /** TC07 — V1,V2,B9: old_password hợp lệ, new_password=49 (max-) */
    public function test_tc07_new_password_maxminus_2(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 49))->assertStatus(200);
    }

    /** TC08 — V1,V2,B1,B6: old_password hợp lệ, new_password=6 (tất cả tại min) */
    public function test_tc08_tat_ca_tai_bien_duoi_hop_le(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 6))->assertStatus(200);
    }

    // =====================================================================
    // TestKhongHopLe — TC09-TC15
    // =====================================================================

    /** TC09 — X1: old_password rỗng */
    public function test_tc09_old_password_rong_0_ky_tu(): void
    {
        $this->changePassword('', str_repeat('a', 28))->assertStatus(422);
    }

    /** TC10 — X2: old_password=51 ký tự sai */
    public function test_tc10_old_password_sai_51_ky_tu(): void
    {
        $this->changePassword(str_repeat('a', 51), str_repeat('a', 28))->assertStatus(400);
    }

    /** TC11 — X3: new_password=5 ký tự */
    public function test_tc11_new_password_qua_ngan_5_ky_tu(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 5))->assertStatus(422);
    }

    /** TC12 — X3: new_password=1 ký tự */
    public function test_tc12_new_password_bang_1_ky_tu(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 1))->assertStatus(422);
    }

    /** TC13 — X4: new_password=51 ký tự (trên biên trên) */
    public function test_tc13_new_password_qua_dai_51_ky_tu(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 51))->assertStatus(422);
    }

    /** TC14 — X1,X3: old_password rỗng, new_password=5 */
    public function test_tc14_ca_hai_bien_sai_dong_thoi(): void
    {
        $this->changePassword('', str_repeat('a', 5))->assertStatus(422);
    }

    /** TC15 — X4: old_password hợp lệ, new_password=51 ký tự (vượt max) */
    public function test_tc15_old_hop_le_new_vuot_max(): void
    {
        $this->changePassword(self::PASSWORD, str_repeat('a', 51))->assertStatus(422);
    }
}
