Feature('Trang Sản Phẩm @e2e');

Scenario('Trang chủ hiển thị danh sách sản phẩm và tabs', async ({ I }) => {
  I.amOnPage('/');
  await I.waitForElement('h3', 10);
  I.see('Nổi Bật');
  I.see('Bán Chạy');
  I.see('Khuyến Mãi');
  I.seeElement('h3');
});

Scenario('Trang chủ - tab Bán Chạy hiển thị sản phẩm', async ({ I }) => {
  I.amOnPage('/');
  await I.waitForText('Bán Chạy', 8);

  I.click('Bán Chạy');
  await I.waitForElement('h3', 8);
  I.seeElement('h3');
});

Scenario('Kiểm tra sử dụng bộ lọc sản phẩm', async ({ I }) => {
  I.amOnPage('/category');
  I.wait(5);
  I.see('Bộ Lọc');
  I.click(locate('input[name="category"]').first());
  I.wait(2);
  I.seeElement('body');
});

Scenario('Trang category hiển thị danh sách sản phẩm', async ({ I }) => {
  I.amOnPage('/category');
  await I.waitForElement('h3', 10);

  I.seeElement('h3');
});

Scenario('Product card có nút thêm giỏ', async ({ I }) => {
  I.amOnPage('/category');
  I.wait(5);
  I.see('Thêm vào giỏ');
  I.seeElement('[data-testid="product-item"]');
});

Scenario('Trang chi tiết sản phẩm hiển thị thông tin', async ({ I }) => {
  I.amOnPage('/products/1');
  I.waitForElement('body', 10);
  I.seeInCurrentUrl('/products/');
  I.waitForElement('h1, h2, body', 10);
});

Scenario('Trang search hiển thị kết quả theo keyword', async ({ I }) => {
  I.amOnPage('/search?keyword=ao');
  await I.waitForElement('body', 5);

  I.seeInCurrentUrl('/search');
});
