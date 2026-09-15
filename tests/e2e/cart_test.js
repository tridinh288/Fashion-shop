Feature('Trang Giỏ Hàng @e2e');

Before(async ({ I }) => {
  // loginNewUser đã navigate đến localhost:5173 và set auth
  await I.loginNewUser();
});

After(async ({ I }) => {
  await I.clearAuth();
});

Scenario('Chuyển đến /login khi truy cập /cart chưa đăng nhập', async ({ I }) => {
  // Clear auth khi đang ở localhost:5173 (đúng origin)
  await I.clearAuth();
  I.amOnPage('/cart');
  await I.waitForURL('http://localhost:5173/login', 5);
  I.seeCurrentUrlEquals('http://localhost:5173/login');
});

Scenario('Trang giỏ hàng hiển thị đúng khi đã đăng nhập', async ({ I }) => {
  I.amOnPage('/cart');
  await I.waitForElement('h1', 8);
  I.see('Giỏ hàng');
});

Scenario('Giỏ hàng trống hiển thị thông báo', async ({ I }) => {
  I.amOnPage('/cart');
  await I.waitForElement('h1', 8);
  await I.waitForText('Giỏ hàng trống', 8);
});

Scenario('Thêm sản phẩm vào giỏ từ trang chi tiết', async ({ I }) => {
  I.amOnPage('/category');
  await I.waitForElement('h3', 10);
  I.click(locate('a').inside('h3').first());
  await I.waitForURL('**/products/**', 8);

  await I.waitForText('Thêm vào giỏ', 8);
  I.click(locate('button').withText('Thêm vào giỏ').first());

  await I.waitForText('Đã thêm vào giỏ hàng', 5);
});

Scenario('Xem giỏ hàng sau khi thêm sản phẩm qua API', async ({ I }) => {
  await I.addToCartViaApi('M');

  I.amOnPage('/cart');
  await I.waitForElement('h1', 8);
  I.see('Giỏ hàng');
  await I.waitForElement('[data-testid="cart-item"] img', 8);
});

Scenario('Tăng số lượng sản phẩm trong giỏ hàng', async ({ I }) => {
  await I.addToCartViaApi('L');

  I.amOnPage('/cart');
  await I.waitForElement('button', 8);

  const plusBtn = locate('button').withText('+').first();
  await I.waitForElement(plusBtn, 5);
  I.click(plusBtn);

  await I.waitForText('2', 3);
});

Scenario('Nút Tiến hành thanh toán dẫn đến /checkout', async ({ I }) => {
  await I.addToCartViaApi('S');

  I.amOnPage('/cart');
  await I.waitForElement('a[href="/checkout"]', 8);
  I.click('a[href="/checkout"]');
  await I.waitForURL('http://localhost:5173/checkout', 8);
});
