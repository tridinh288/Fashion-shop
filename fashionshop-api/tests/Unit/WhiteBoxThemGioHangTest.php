<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Cart;
use App\Http\Controllers\Api\CartController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

class WhiteBoxThemGioHangTest extends TestCase
{
    use RefreshDatabase;

    private function makeRequest($user, $data = [])
    {
        $request = new Request($data);
        $request->setUserResolver(fn () => $user);
        return $request;
    }

    private function createProduct(): Product
    {
        return Product::create([
            'ten_sp'      => 'Test Product',
            'gia'         => 100000,
            'gia_cu'      => 120000,
            'mo_ta'       => 'Test',
            'so_luong'    => 10,
            'gioi_tinh'   => 1,
            'category_id' => null,
            'hinh_anh'    => null,
        ]);
    }

    /**
     * WB01
     * Bao phủ nhánh: Validate thất bại do size không hợp lệ
     * Kết quả mong đợi: HTTP 200 + response chứa key 'errors'
     */
    public function test_wb01_store_invalid_size()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'product_id' => 1,
            'quantity'   => 1,
            'size'       => 'XXL'
        ]);

        $response = (new CartController())->store($request);

        $this->assertEquals(200, $response->status());
        $json = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $json);
    }

    /**
     * WB02
     * Bao phủ nhánh: Validate thất bại do dữ liệu không hợp lệ
     * Kết quả mong đợi: HTTP 200 + response chứa key 'errors'
     */
    public function test_wb02_store_invalid_data()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'product_id' => '',
            'quantity'   => 0,
            'size'       => 'M'
        ]);

        $response = (new CartController())->store($request);

        $this->assertEquals(200, $response->status());
        $json = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $json);
    }

    /**
     * WB03
     * Bao phủ nhánh: Sản phẩm đã tồn tại trong giỏ → tăng quantity
     * Kết quả mong đợi: quantity được cộng dồn
     */
    public function test_wb03_store_increment_quantity()
    {
        $user    = User::factory()->create();
        $product = $this->createProduct();

        Cart::create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'quantity'   => 1,
            'size'       => 'M'
        ]);

        $request = $this->makeRequest($user, [
            'product_id' => $product->id,
            'quantity'   => 2,
            'size'       => 'M'
        ]);

        $response = (new CartController())->store($request);

        $this->assertEquals(200, $response->status());
        $this->assertDatabaseHas('cart', [
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'quantity'   => 3
        ]);
    }

    /**
     * WB04
     * Bao phủ nhánh: Thêm mới vào giỏ hàng
     * Kết quả mong đợi: HTTP 200, bản ghi mới được tạo
     */
    public function test_wb04_store_create_new_cart()
    {
        $user    = User::factory()->create();
        $product = $this->createProduct();

        $request = $this->makeRequest($user, [
            'product_id' => $product->id,
            'quantity'   => 2,
            'size'       => 'L'
        ]);

        $response = (new CartController())->store($request);

        $this->assertEquals(200, $response->status());
        $this->assertDatabaseHas('cart', [
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'quantity'   => 2,
            'size'       => 'L'
        ]);
    }

    /**
     * WB05
     * Bao phủ nhánh: index() giỏ hàng rỗng
     * Kết quả mong đợi: HTTP 200, data rỗng
     */
    public function test_wb05_index_empty()
    {
        $user    = User::factory()->create();
        $request = $this->makeRequest($user);

        $response = (new CartController())->index($request);

        $this->assertEquals(200, $response->status());
        $json = json_decode($response->getContent(), true);
        $this->assertEmpty($json['data']);
    }

    /**
     * WB06
     * Bao phủ nhánh: index() có sản phẩm trong giỏ
     * Kết quả mong đợi: HTTP 200, data không rỗng
     */
    public function test_wb06_index_has_items()
    {
        $user    = User::factory()->create();
        $product = $this->createProduct();

        Cart::create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'quantity'   => 1,
            'size'       => 'M'
        ]);

        $request  = $this->makeRequest($user);
        $response = (new CartController())->index($request);

        $this->assertEquals(200, $response->status());
        $json = json_decode($response->getContent(), true);
        $this->assertNotEmpty($json['data']);
    }

    /**
     * WB07
     * Bao phủ nhánh: update() validate thất bại (quantity < 1)
     * Kết quả mong đợi: ValidationException
     */
    public function test_wb07_update_validation_fail()
    {
        $user    = User::factory()->create();
        $request = $this->makeRequest($user, ['quantity' => 0]);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        (new CartController())->update($request, 1);
    }

    /**
     * WB08
     * Bao phủ nhánh: update() không tìm thấy cart item
     * Kết quả mong đợi: ModelNotFoundException
     */
    public function test_wb08_update_not_found()
    {
        $user    = User::factory()->create();
        $request = $this->makeRequest($user, ['quantity' => 2]);

        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        (new CartController())->update($request, 999);
    }

    /**
     * WB09
     * Bao phủ nhánh: update() cập nhật quantity thành công
     * Kết quả mong đợi: HTTP 200, quantity được cập nhật
     */
    public function test_wb09_update_success()
    {
        $user    = User::factory()->create();
        $product = $this->createProduct();

        $cart = Cart::create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'quantity'   => 1,
            'size'       => 'M'
        ]);

        $request  = $this->makeRequest($user, ['quantity' => 5]);
        $response = (new CartController())->update($request, $cart->id);

        $this->assertEquals(200, $response->status());
        $this->assertDatabaseHas('cart', [
            'id'       => $cart->id,
            'quantity' => 5
        ]);
    }

    /**
     * WB10
     * Bao phủ nhánh: destroy() không tìm thấy cart item
     * Kết quả mong đợi: HTTP 200, deleted_cart_id = null
     */
    public function test_wb10_destroy_not_found()
    {
        $user     = User::factory()->create();
        $request  = $this->makeRequest($user);
        $response = (new CartController())->destroy($request, 999);

        $this->assertEquals(200, $response->status());
        $json = json_decode($response->getContent(), true);
        $this->assertNull($json['deleted_cart_id']);
    }

    /**
     * WB11
     * Bao phủ nhánh: destroy() xóa cart item thành công
     * Kết quả mong đợi: HTTP 200, bản ghi bị xóa khỏi DB
     */
    public function test_wb11_destroy_success()
    {
        $user    = User::factory()->create();
        $product = $this->createProduct();

        $cart = Cart::create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'quantity'   => 1,
            'size'       => 'M'
        ]);

        $request  = $this->makeRequest($user);
        $response = (new CartController())->destroy($request, $cart->id);

        $this->assertEquals(200, $response->status());
        $this->assertDatabaseMissing('cart', ['id' => $cart->id]);
    }
}
