Feature('Trang Liên Hệ @e2e');

Before(async ({ I }) => {
  I.amOnPage('/contact');
  await I.waitForElement('form', 8);
});

Scenario('Trang liên hệ hiển thị form', async ({ I }) => {
  await I.waitForElement('[name="fullname"]', 5);

  I.see('Liên hệ');
  I.seeElement('[name="fullname"]');
  I.seeElement('[name="email"]');
  I.seeElement('[name="message"]');
  I.seeElement('button[type="submit"]');
});

Scenario('Gửi liên hệ thành công', async ({ I }) => {
  await I.waitForElement('[name="fullname"]', 5);

  I.fillField('[name="fullname"]', 'Nguyễn Văn A');
  I.fillField('[name="email"]', 'contact@test.com');
  I.fillField('[name="message"]', 'Tôi muốn hỏi về sản phẩm áo thun nam có ở cửa hàng không?');
  I.click('button[type="submit"]');

  await I.waitForText('Gửi liên hệ thành công', 8);
});

Scenario('Lỗi validation khi để trống tên', async ({ I }) => {
  await I.disableNativeValidation();

  I.fillField('[name="email"]', 'test@gmail.com');
  I.fillField('[name="message"]', 'Nội dung tin nhắn đầy đủ hơn 10 ký tự');
  I.click('button[type="submit"]');

  await I.waitForText('Tên tối thiểu 2 ký tự', 5);
});

Scenario('Lỗi validation khi email không hợp lệ', async ({ I }) => {
  await I.disableNativeValidation();

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="email"]', 'not-an-email');
  I.fillField('[name="message"]', 'Nội dung tin nhắn đầy đủ hơn 10 ký tự');
  I.click('button[type="submit"]');

  await I.waitForText('Email không hợp lệ', 5);
});

Scenario('Lỗi validation khi nội dung quá ngắn', async ({ I }) => {
  await I.disableNativeValidation();

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="email"]', 'test@gmail.com');
  I.fillField('[name="message"]', 'Ngắn');
  I.click('button[type="submit"]');

  await I.waitForText('Nội dung tối thiểu 10 ký tự', 5);
});
