<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WhiteBoxDatHangTest extends TestCase
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
            'ten_sp'      => 'Áo',
            'gia'         => 100000,
            'gia_cu'      => 120000,
            'mo_ta'       => 'Test',
            'so_luong'    => 10,
            'gioi_tinh'   => 1,
            'category_id' => null,
            'hinh_anh'    => null,
        ]);
    }

    private function createOrder(User $user, string $status = 'pending'): Order
    {
        return Order::create([
            'user_id'  => $user->id,
            'fullname' => 'Nguyen Van A',
            'phone'    => '0912345678',
            'address'  => 'TP HCM',
            'payment'  => 'COD',
            'total'    => 130000,
            'status'   => $status,
        ]);
    }

    /**
     * WB01
     * Bao phủ nhánh: store() validate thất bại
     * Kết quả mong đợi: ValidationException
     */
    public function test_wb01_store_validation_fail()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'fullname' => '',
            'phone'    => '123',
            'address'  => '',
            'payment'  => 'BANK'
        ]);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        (new OrderController())->store($request);
    }

    /**
     * WB02
     * Bao phủ nhánh: store() giỏ hàng trống
     * Kết quả mong đợi: HTTP 400
     */
    public function test_wb02_cart_empty()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'fullname' => 'Nguyen Van A',
            'phone'    => '0912345678',
            'address'  => 'HCM',
            'payment'  => 'COD'
        ]);

        $response = (new OrderController())->store($request);

        $this->assertEquals(400, $response->status());
    }

    /**
     * WB03
     * Bao phủ nhánh: store() đặt hàng thành công
     * Kết quả mong đợi: HTTP 200, order + order_details được tạo, cart bị xóa
     */
    public function test_wb03_store_success()
    {
        $user    = User::factory()->create();
        $product = $this->createProduct();

        Cart::create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'quantity'   => 2,
            'size'       => 'L'
        ]);

        $request = $this->makeRequest($user, [
            'fullname' => 'Nguyen Van A',
            'phone'    => '0912345678',
            'address'  => 'TP HCM',
            'payment'  => 'COD'
        ]);

        $response = (new OrderController())->store($request);

        $this->assertEquals(200, $response->status());
        $this->assertDatabaseHas('orders', [
            'user_id'  => $user->id,
            'fullname' => 'Nguyen Van A'
        ]);
        $this->assertDatabaseHas('order_details', [
            'product_id' => $product->id,
            'quantity'   => 2
        ]);
        $this->assertDatabaseMissing('cart', [
            'user_id' => $user->id
        ]);
    }

    /**
     * WB04
     * Bao phủ nhánh: index() trả về danh sách đơn hàng
     * Kết quả mong đợi: HTTP 200
     */
    public function test_wb04_index_success()
    {
        $user = User::factory()->create();
        $this->createOrder($user);

        $request  = $this->makeRequest($user);
        $response = (new OrderController())->index($request);

        $this->assertEquals(200, $response->status());
    }

    /**
     * WB05
     * Bao phủ nhánh: show() không tìm thấy đơn hàng
     * Kết quả mong đợi: ModelNotFoundException
     */
    public function test_wb05_show_not_found()
    {
        $user    = User::factory()->create();
        $request = $this->makeRequest($user);

        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        (new OrderController())->show($request, 999);
    }

    /**
     * WB06
     * Bao phủ nhánh: show() tìm thấy đơn hàng
     * Kết quả mong đợi: HTTP 200
     */
    public function test_wb06_show_success()
    {
        $user    = User::factory()->create();
        $product = $this->createProduct();
        $order   = $this->createOrder($user);

        OrderDetail::create([
            'order_id'   => $order->id,
            'product_id' => $product->id,
            'quantity'   => 1,
            'price'      => 100000,
            'size'       => 'M',
        ]);

        $request  = $this->makeRequest($user);
        $response = (new OrderController())->show($request, $order->id);

        $this->assertEquals(200, $response->status());
    }

    /**
     * WB07
     * Bao phủ nhánh: cancel() không tìm thấy đơn hàng
     * Kết quả mong đợi: ModelNotFoundException
     */
    public function test_wb07_cancel_not_found()
    {
        $user    = User::factory()->create();
        $request = $this->makeRequest($user);

        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        (new OrderController())->cancel($request, 999);
    }

    /**
     * WB08
     * Bao phủ nhánh: cancel() đơn hàng không ở trạng thái pending
     * Kết quả mong đợi: HTTP 400
     */
    public function test_wb08_cancel_status_not_pending()
    {
        $user    = User::factory()->create();
        $order   = $this->createOrder($user, 'cancelled');
        $request = $this->makeRequest($user);

        $response = (new OrderController())->cancel($request, $order->id);

        $this->assertEquals(400, $response->status());
    }

    /**
     * WB09
     * Bao phủ nhánh: cancel() hủy đơn hàng thành công
     * Kết quả mong đợi: HTTP 200, status = cancelled
     */
    public function test_wb09_cancel_success()
    {
        $user    = User::factory()->create();
        $order   = $this->createOrder($user, 'pending');
        $request = $this->makeRequest($user);

        $response = (new OrderController())->cancel($request, $order->id);

        $this->assertEquals(200, $response->status());
        $this->assertDatabaseHas('orders', [
            'id'     => $order->id,
            'status' => 'cancelled'
        ]);
    }
}
