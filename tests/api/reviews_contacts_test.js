const { expect } = require('chai');

Feature('Reviews & Contacts API @api');

let token = '';
let productId = null;

Before(async ({ I }) => {
  ({ token } = await I.registerApiUser('review'));
  productId = await I.getFirstProductId();
});

// ─── VIẾT ĐÁNH GIÁ ───────────────────────────────────────────────

Scenario('POST /products/:id/reviews - Trạng thái 201 Created', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`,
    { rating: 5, comment: 'San pham rat tot, giao hang nhanh!' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(201);
});

Scenario('POST /products/:id/reviews - Response có review đầy đủ', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`,
    { rating: 5, comment: 'San pham rat tot, dung size!' },
    { Authorization: `Bearer ${token}` }
  );

  // API trả về { review: { rating, comment, ... } }
  expect(res.data).to.have.property('review');
  expect(res.data.review).to.have.property('rating', 5);
  expect(res.data.review).to.have.property('comment');
});

Scenario('[BUG] POST /products/:id/reviews - Response có thông tin user trong review', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`,
    { rating: 4, comment: 'San pham dep, chat luong tot' },
    { Authorization: `Bearer ${token}` }
  );

  // ❌ controller không trả về thông tin user trong response
  expect(res.data.review).to.have.property('user');
});

Scenario('POST /products/:id/reviews - Lỗi 422 khi rating > 5', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`,
    { rating: 6, comment: 'San pham tot' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(422);
});

Scenario('POST /products/:id/reviews - Lỗi 422 khi thiếu comment', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`,
    { rating: 4 },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(422);
});

Scenario('POST /products/:id/reviews - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`, {
    rating: 5,
    comment: 'Tot lam',
  });

  expect(res.status).to.equal(401);
});

Scenario('POST /products/:id/reviews - Lỗi 404 khi sản phẩm không tồn tại', async ({ I }) => {
  const res = await I.sendPostRequest('/products/999999/reviews',
    { rating: 5, comment: 'Test review' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(404);
});

// ─── XEM ĐÁNH GIÁ SẢN PHẨM ──────────────────────────────────────

Scenario('GET /products/:id/reviews - Status 200 OK', async ({ I }) => {
  const res = await I.sendGetRequest(`/products/${productId}/reviews`);

  expect(res.status).to.equal(200);
});

Scenario('GET /products/:id/reviews - Mỗi review phải có thông tin user', async ({ I }) => {
  const res = await I.sendGetRequest(`/products/${productId}/reviews`);

  expect(res.data).to.be.an('array');
  if (res.data.length > 0) {
    expect(res.data[0]).to.have.property('user');
    expect(res.data[0]).to.have.property('rating');
    expect(res.data[0]).to.have.property('comment');
  }
});

Scenario('[BUG] GET /products/:id/reviews - Reviews sắp xếp cũ nhất trước', async ({ I }) => {
  const res = await I.sendGetRequest(`/products/${productId}/reviews`);

  if (res.data.length >= 2) {
    const first = new Date(res.data[0].created_at);
    const second = new Date(res.data[1].created_at);
    // ❌ thực tế reviews sắp xếp mới nhất trước
    expect(first.getTime()).to.be.lessThan(second.getTime());
  }
});

// ─── GỬI LIÊN HỆ ─────────────────────────────────────────────────

Scenario('POST /contacts - Gửi liên hệ thành công - Status 201', async ({ I }) => {
  const res = await I.sendPostRequest('/contacts', {
    fullname: 'Nguyen Van A',
    email: 'contact@test.com',
    phone: '0901234567',
    message: 'Toi muon hoi ve san pham...',
  });

  expect(res.status).to.equal(201);
});

Scenario('POST /contacts - Response trả về JSON', async ({ I }) => {
  const res = await I.sendPostRequest('/contacts', {
    fullname: 'Nguyen Van A',
    email: 'contact@test.com',
    message: 'Toi muon hoi ve san pham...',
  });

  expect(res.data).to.be.an('object');
});

Scenario('[BUG] POST /contacts - Response phải có trường token', async ({ I }) => {
  const res = await I.sendPostRequest('/contacts', {
    fullname: 'Nguyen Van A',
    email: 'contact@test.com',
    message: 'Toi muon hoi ve san pham...',
  });

  // ❌ API liên hệ không trả về token
  expect(res.data).to.have.property('token');
});

Scenario('POST /contacts - Lỗi 422 khi thiếu message', async ({ I }) => {
  const res = await I.sendPostRequest('/contacts', {
    fullname: 'Test',
    email: 'test@test.com',
  });

  expect(res.status).to.equal(422);
});

Scenario('POST /contacts - Lỗi 422 khi email không hợp lệ', async ({ I }) => {
  const res = await I.sendPostRequest('/contacts', {
    fullname: 'Test',
    email: 'not-an-email',
    message: 'Xin chao shop nhe',
  });

  expect(res.status).to.equal(422);
});
