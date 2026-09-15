Feature('Trang Đăng Nhập @e2e');

// Tạo user một lần duy nhất cho toàn bộ file, tránh phụ thuộc seeded data
let USER_EMAIL = '';
const USER_PASSWORD = 'Chi123';

BeforeSuite(async ({ I }) => {
  USER_EMAIL = `logintest_${Date.now()}@test.com`;
  await I.sendPostRequest('/register', {
    fullname: 'Login Test User',
    email: USER_EMAIL,
    phone: '0901234567',
    gender: 'Nam',
    password: USER_PASSWORD,
    password_confirmation: USER_PASSWORD,
  });
});

Scenario('Trang login hiển thị đúng form', async ({ I }) => {
  I.amOnPage('/login');
  await I.waitForElement('[name="email"]', 8);

  I.see('Đăng nhập');
  I.seeElement('[name="email"]');
  I.seeElement('[name="password"]');
  I.seeElement('button[type="submit"]');
});

Scenario('Đăng nhập thành công và chuyển về trang chủ', async ({ I }) => {
  I.amOnPage('/login');
  await I.waitForElement('[name="email"]', 8);

  I.fillField('[name="email"]', USER_EMAIL);
  I.fillField('[name="password"]', USER_PASSWORD);
  I.click('button[type="submit"]');

  await I.waitForURL('http://localhost:5173/', 10);
  I.seeCurrentUrlEquals('http://localhost:5173/');
});

Scenario('Đăng nhập thất bại - sai mật khẩu hiện thông báo lỗi', async ({ I }) => {
  I.amOnPage('/login');
  await I.waitForElement('[name="email"]', 8);

  I.fillField('[name="email"]', USER_EMAIL);
  I.fillField('[name="password"]', 'wrongpassword');
  I.click('button[type="submit"]');

  // BE trả về: "Email hoặc mật khẩu không chính xác"
  await I.waitForText('không chính xác', 6);
  I.seeInCurrentUrl('/login');
});

Scenario('Đăng nhập thất bại - email không hợp lệ hiện lỗi validation', async ({ I }) => {
  I.amOnPage('/login');
  await I.waitForElement('form', 8);

  // Tắt HTML5 native validation để Zod xử lý
  await I.disableNativeValidation();

  I.fillField('[name="email"]', 'notvalidemail');
  I.fillField('[name="password"]', '123456');
  I.click('button[type="submit"]');

  await I.waitForText('Email không hợp lệ', 5);
  I.seeInCurrentUrl('/login');
});

Scenario('Chuyển sang trang đăng ký khi bấm link', async ({ I }) => {
  I.amOnPage('/login');
  await I.waitForElement('a[href="/register"]', 5);
  I.click('a[href="/register"]');
  await I.waitForURL('http://localhost:5173/register', 5);
});
