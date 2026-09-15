Feature('Trang Đơn Hàng @e2e');

Before(async ({ I }) => {
  await I.loginNewUser();
});

After(async ({ I }) => {
  await I.clearAuth();
});

Scenario('Chuyển đến /login khi truy cập /orders chưa đăng nhập', async ({ I }) => {
  await I.clearAuth();
  I.amOnPage('/orders');
  await I.waitForURL('http://localhost:5173/login', 5);
});

Scenario('Trang lịch sử đơn hàng hiển thị đúng', async ({ I }) => {
  I.amOnPage('/orders');
  await I.waitForElement('h1', 8);
  I.see('Lịch sử đơn hàng');
});

Scenario('Thông báo chưa có đơn hàng khi user mới', async ({ I }) => {
  I.amOnPage('/orders');
  await I.waitForElement('h1', 8);
  await I.waitForText('Chưa có đơn hàng nào', 8);
});

Scenario('Trang checkout hiển thị form đặt hàng', async ({ I }) => {
  await I.addToCartViaApi('M');

  I.amOnPage('/checkout');
  await I.waitForElement('[name="fullname"]', 8);

  I.seeElement('[name="fullname"]');
  I.seeElement('[name="phone"]');
  I.seeElement('[name="address"]');
  I.seeElement('button[type="submit"]');
});

Scenario('Đặt hàng thành công và chuyển trang order-success', async ({ I }) => {
  await I.addToCartViaApi('M');

  I.amOnPage('/checkout');
  await I.waitForElement('[name="fullname"]', 8);

  I.fillField('[name="fullname"]', 'Nguyễn Văn Test');
  I.fillField('[name="phone"]', '0901234567');
  I.fillField('[name="address"]', '123 Đường Lê Lợi, Quận 1, TP.HCM');
  I.click('button[type="submit"]');

  await I.waitForURL('**/order-success/**', 10);
  I.seeInCurrentUrl('/order-success/');
});

Scenario('Lỗi validation khi để trống địa chỉ', async ({ I }) => {
  await I.addToCartViaApi('L');

  I.amOnPage('/checkout');
  await I.waitForElement('form', 8);

  await I.disableNativeValidation();

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="phone"]', '0901234567');
  // Bỏ trống address
  I.click('button[type="submit"]');

  await I.waitForText('tối thiểu', 5);
  I.seeCurrentUrlEquals('http://localhost:5173/checkout');
});

Scenario('Xem danh sách đơn hàng sau khi đặt', async ({ I }) => {
  await I.addToCartViaApi('S');
  const token = await I.executeScript(() => localStorage.getItem('token'));

  await I.sendPostRequest('/orders',
    { fullname: 'Test', phone: '0901234567', address: '123 ABC Street', payment: 'COD' },
    { Authorization: `Bearer ${token}` }
  );

  I.amOnPage('/orders');
  await I.waitForElement('h1', 8);
  I.see('Lịch sử đơn hàng');
  await I.waitForElement('a[href*="/orders/"]', 8);
  I.see('Đơn #');
});

Scenario('Xem chi tiết đơn hàng', async ({ I }) => {
  await I.addToCartViaApi('M');
  const token = await I.executeScript(() => localStorage.getItem('token'));

  const orderRes = await I.sendPostRequest('/orders',
    { fullname: 'Test', phone: '0901234567', address: '123 ABC Street', payment: 'COD' },
    { Authorization: `Bearer ${token}` }
  );
  const orderId = orderRes.data.order?.id || orderRes.data.id;

  I.amOnPage(`/orders/${orderId}`);
  await I.waitForElement('h1, .text-2xl', 8);
  I.seeInCurrentUrl(`/orders/${orderId}`);
});
