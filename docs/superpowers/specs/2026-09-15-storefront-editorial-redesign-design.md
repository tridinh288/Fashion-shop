# Làm lại giao diện web bán hàng — Đợt 1: Nền tảng + Trang chủ, Danh mục, Chi tiết sản phẩm

**Ngày:** 2026-09-15
**Phạm vi repo:** chỉ `fashionshop-web` (không đụng `fashionshop-admin`, `fashionshop-api`), cộng phần sửa test trong `tests/e2e` liên quan tới các trang của đợt này.

## 1. Bối cảnh và mục tiêu

Web bán hàng hiện là React 19 + Vite 8 + Tailwind 4, nền trắng, font Be Vietnam Pro, animation bằng `framer-motion` và một hero WebGL (`FabricCanvas`). Mục tiêu là đổi sang phong cách **Editorial tối giản** (như tạp chí thời trang) với hiệu ứng **GSAP ở mức tối thiểu**, mà **không đổi logic**: gọi API, React Query, Zustand, react-hook-form + zod và route giữ nguyên.

Việc làm lại chia 3 đợt, mỗi đợt có spec + kế hoạch riêng:

| Đợt | Nội dung |
|---|---|
| **1 (tài liệu này)** | Nền tảng (token, font, component chung, GSAP), Header, Footer, Trang chủ, Danh mục, Chi tiết sản phẩm |
| 2 | Giỏ hàng, Thanh toán, Đặt hàng thành công, Đơn hàng, Chi tiết đơn |
| 3 | Đăng nhập, Đăng ký, Hồ sơ, Địa chỉ, Liên hệ, Tìm kiếm |

Giữa các đợt, trang chưa làm vẫn giữ bố cục cũ nhưng tự nhận màu/font mới qua token.

**Công cụ thiết kế:** skill `ui-ux-pro-max` dùng để tra cứu (không phải thư viện cài vào code). Code chỉ thêm `gsap` và `@gsap/react`.

## 2. Hệ thống hình ảnh

### 2.1 Màu

Tra `ui-ux-pro-max` không có bảng màu khớp tông kem editorial (kết quả là hồng/đen luxury), nên bảng dưới lấy từ mockup đã duyệt và tự kiểm tra tương phản WCAG trên nền `paper`.

| Token (`--color-*`) | Hex | Dùng cho | Tương phản trên `paper` |
|---|---|---|---|
| `paper` | `#f6f3ee` | Nền trang | — |
| `tile` | `#ece6db` | Ô ảnh sản phẩm, khối ảnh | — |
| `surface` | `#ffffff` | Ô nhập, thẻ nổi, menu thả | — |
| `ink` | `#141414` | Chữ chính, nút chính | 16.6:1 |
| `ink-soft` | `#5c554b` | Chữ phụ, mô tả | 6.6:1 |
| `ink-faint` | `#6b645a` | Chú thích, giá gạch ngang, placeholder | 5.3:1 |
| `accent` | `#7a5f3c` | Nhãn nhỏ (eyebrow), chữ nghiêng nhấn, viền phản hồi shop | 5.4:1 |
| `line` | `#d9d2c5` | Đường kẻ, viền ô | — |
| `sale` | `#b42318` | Nhãn giảm giá, lỗi form | 5.9:1 |

- Giữ tên token cũ `ink`, `ink-soft`, `ink-faint`, `paper`, `tile`, `line`, `sale` để các trang chưa làm không vỡ class. Token cũ `tile-warm` trỏ về cùng giá trị `paper`.
- `#8a6d46` trong mockup ban đầu bị loại vì chỉ đạt 4.36:1.

### 2.2 Chữ

Cặp font do `ui-ux-pro-max` đề xuất cho thời trang/editorial; cả hai có đủ glyph tiếng Việt.

| Vai trò | Font | Dùng ở |
|---|---|---|
| Tiêu đề (`--font-display`) | Playfair Display 500, nghiêng 500 | Hero, tiêu đề mục trang chủ, tiêu đề trang Danh mục, tên SP ở trang chi tiết, logo chữ, tiêu đề "Đánh giá" |
| Thân (`--font-sans`) | Inter 400/500/600 | Mọi chữ còn lại, gồm tên SP trong thẻ, giá, form, nút |

- Chữ thân 16px, giãn dòng 1.6; không có chữ nội dung dưới 12px.
- Nhãn nhỏ (`.eyebrow`) dùng Inter 600 in hoa bằng CSS, giãn chữ 0.16em.
- Chữ nút, tab, nhãn "Bộ lọc" **không** in hoa bằng CSS (Inter 600, viết hoa chữ đầu). Lý do: Chromium tính `innerText` sau `text-transform`, nên test E2E tìm `Thêm vào giỏ` / `Nổi bật` / `Bộ lọc` sẽ hỏng nếu các chữ này bị in hoa.
- Tải qua Google Fonts trong `index.html`, `display=swap`, bỏ Be Vietnam Pro.

### 2.3 Quy tắc thành phần

- Góc vuông cho nút, ô ảnh, ô nhập, chip lọc; không đổ bóng (trừ menu thả của Header).
- Ô ảnh sản phẩm tỉ lệ cố định 3:4 (trang chi tiết 4:5), ảnh `object-contain` có đệm, `loading="lazy"` trừ ảnh hero và ảnh chính trang chi tiết.
- Icon: `lucide-react`, nét 1.5; nút chỉ có icon luôn có `aria-label`.
- Vùng bấm tối thiểu 44×44px; `:focus-visible` viền 2px màu `ink`.
- Rê chuột: chuyển trạng thái 200–300ms; ảnh sản phẩm phóng `scale(1.04)` bằng CSS.

## 3. Kiến trúc code

### 3.1 Nền tảng

| File | Thay đổi |
|---|---|
| `index.html` | Font Playfair Display + Inter; `theme-color` và nền `html` = `#f6f3ee` |
| `src/index.css` | `@theme` theo mục 2; thêm `--font-display`; giữ `.eyebrow`, `.link-underline`; xoá `.marquee-track` và keyframe `marquee` |
| `src/App.css` | Xoá (không file nào import) |
| `package.json` | Thêm `gsap`, `@gsap/react`; gỡ `framer-motion` |
| `src/App.jsx` | Toaster đổi màu theo token (nền `ink`, chữ trắng, góc vuông) |

### 3.2 Component dùng chung (`src/components/ui/`)

| Component | Giao diện (props) | Ghi chú |
|---|---|---|
| `Button` | `variant: "primary" \| "secondary" \| "link"`, `size: "md" \| "lg"`, `loading?: boolean`, `to?: string` (có thì render `<Link>`), còn lại chuyển xuống phần tử | `loading` → `disabled` + chữ "Đang xử lý…" |
| `Container` | `as?`, `className?`, `children` | `max-w-[1400px]`, lề ngang `px-5 lg:px-8` |
| `SectionHeading` | `eyebrow?`, `title`, `as?: "h1" \| "h2"` (mặc định `h2`), `action?: ReactNode` | Tiêu đề dùng `--font-display` |
| `Price` | `gia: number`, `gia_cu?: number`, `size?: "sm" \| "lg"` | Hiện giá; nếu `gia_cu > gia` thêm giá gạch ngang và "−N%" màu `sale`. Thay `SaleBadge` |
| `ProductCard` | `product`, `onAddToCart?(product)` | Xem 3.4. Giữ `data-testid="product-item"` trên phần tử gốc |
| `Field` | `label`, `error?`, `hint?`, `children` (ô nhập) | Nhãn trên, lỗi dưới, `aria-describedby`; dùng từ đợt 2, đợt 1 dùng cho form đánh giá |
| `EmptyState` | `title`, `action?: ReactNode` | Dùng cho Danh mục không có kết quả |
| `LoadingSpinner`, `StarRating`, `StatusBadge` | Không đổi props | Chỉ đổi màu theo token |

Xoá: `Reveal.jsx`, `FabricCanvas.jsx`, `SaleBadge.jsx`.

### 3.3 Hiệu ứng

- `src/lib/gsap.js`: `import gsap` + `ScrollTrigger`, `gsap.registerPlugin(ScrollTrigger, useGSAP)` một lần, export `gsap`.
- `src/hooks/useReveal.js`: `useReveal(scopeRef, { selector = "[data-reveal]", stagger = 0.05, onLoad = false })`.
  - Dùng `useGSAP` với `scope: scopeRef` để tự dọn khi unmount.
  - Bên trong `gsap.matchMedia()`, chỉ chạy khi `(prefers-reduced-motion: no-preference)`: `gsap.from(targets, { opacity: 0, y: 12, duration: 0.35, ease: "power1.out", stagger })`.
  - `onLoad = false` → gắn `scrollTrigger: { trigger: scopeRef.current, start: "top 85%", once: true }`; `onLoad = true` → chạy ngay khi mount (hero).
- **Không ẩn sẵn nội dung bằng CSS.** Nếu JS lỗi hoặc giảm chuyển động, nội dung hiện đầy đủ.
- Chỗ dùng: hero trang chủ (`onLoad`), tiêu đề mục + lưới sản phẩm ở Trang chủ/Danh mục, khối thông tin trang chi tiết (`onLoad`).
- Không dùng: pin, parallax, ScrollSmoother, chuyển trang, dải chạy ngang, con trỏ tuỳ biến.

### 3.4 Layout chung

**Header** (`components/layout/Header.jsx`, giữ nguyên state và xử lý đăng xuất/tìm kiếm):
- Desktop lưới 3 cột: trái là menu `Nam`, `Nữ`, `Liên hệ` (link cũ); giữa là logo chữ "Fashion Shop" font display; phải là ô tìm kiếm thu gọn, Tài khoản (menu thả Hồ sơ / Đơn hàng / Đăng xuất như cũ) hoặc "Đăng nhập", Giỏ kèm số lượng.
- Điện thoại: logo trái, icon Giỏ + nút menu phải; menu mở chứa ô tìm kiếm và link.
- Dính trên cùng, nền `paper` 95% + viền dưới `line`.

**Footer**: 4 cột (thương hiệu + mô tả ngắn; Mua sắm: Nam, Nữ; Hỗ trợ: Liên hệ; Tài khoản: Đơn hàng, Hồ sơ) và dòng bản quyền. Chỉ dùng link tới route có thật.

**ProductCard**:
- `<article data-testid="product-item">` → ô ảnh (link tới SP) → `h3 > a` tên SP → `StarRating` nếu có → `Price size="sm"`.
- Nút "Thêm vào giỏ" nằm ở đáy ô ảnh: desktop hiện khi rê chuột hoặc focus; màn hình cảm ứng (`@media (hover: none)`) luôn hiện.

## 4. Bố cục từng trang

### 4.1 Trang chủ (`pages/Home.jsx`)

Giữ nguyên: truy vấn `products` theo tab, truy vấn `home-covers`, hàm `adminCover`, `covers`, `isAdminCover`, `handleAddToCart`.

1. **Hero** chia đôi (desktop), xếp dọc trên điện thoại:
   - Trái: eyebrow "Bộ sưu tập 2026"; `h1` display "Mặc đẹp mỗi ngày," + dòng nghiêng màu `accent` "không cần cố gắng."; đoạn mô tả hiện có; `Button` "Mua sắm ngay" → `/category`. Hiệu ứng `useReveal` `onLoad`.
   - Phải: nền `tile`. Có ảnh admin `hero` → ảnh phủ khung với `objectFit`/`objectPosition` từ API, link `/category`. Không có → ảnh sản phẩm đầu tiên có ảnh, `object-contain`, nhãn tên SP, link tới SP.
2. **Dải cam kết**: 3 mục "Giao nhanh toàn quốc", "Đổi trả trong 7 ngày", "Thanh toán khi nhận hàng", có icon lucide, kẻ trên/dưới. Thay dải ảnh chạy ngang.
3. **Mua theo phong cách**: `SectionHeading` eyebrow "Danh mục", tiêu đề "Mua theo phong cách". Hai khối Nam/Nữ (link cũ): ô ảnh (ảnh admin phủ khung theo `fit/pos`, hoặc ảnh SP `object-contain`), bên dưới là tên bộ sưu tập (display) + mô tả + link "Xem tất cả". Chữ không đè lên ảnh nên bỏ lớp phủ tối.
4. **Đang được chú ý**: `SectionHeading` eyebrow "Sản phẩm", tiêu đề "Đang được chú ý", `action` là 3 tab `Nổi bật / Bán chạy / Khuyến mãi` dạng chữ gạch chân (là `<button>`, `aria-pressed`). Lưới 2 cột (điện thoại) / 4 cột (≥1024px). Đang tải → `LoadingSpinner`; rỗng → "Không có sản phẩm nào". Nút `secondary` "Xem tất cả sản phẩm" → `/category`.

### 4.2 Danh mục (`pages/Category.jsx`)

Giữ nguyên: đọc/ghi `category_id`, `gioi_tinh`, `page` trên URL; truy vấn sản phẩm (12/trang) và danh mục; `handleAddToCart`.

1. Breadcrumb "Trang chủ / {tiêu đề}", `h1` display ("Thời trang nam" / "Thời trang nữ" / "Tất cả sản phẩm"), số lượng "{total} sản phẩm".
2. **Thanh lọc ngang**, mở đầu bằng nhãn nhìn thấy được "Bộ lọc" (kiểu `.eyebrow`, kèm icon `SlidersHorizontal`); thanh là `<fieldset>`/nhóm có nhãn cho trình đọc màn hình:
   - Giới tính: `Tất cả / Nam / Nữ` dạng radio `name="gender"`, hiển thị như chữ gạch chân.
   - Danh mục: `Tất cả` + từng danh mục dạng radio `name="category"`, hiển thị như chip viền (chip đang chọn viền `ink`).
   - Radio thật được ẩn trực quan (không `display:none`) nên vẫn dùng được bằng bàn phím.
   - Điện thoại: hàng chip cuộn ngang được.
3. Lưới 2 / 3 (≥768px) / 4 (≥1024px) cột.
4. **Thay đổi hành vi (a):** bỏ `MOCK_PRODUCTS` và nhánh chặn id 997–999. Không có sản phẩm → `EmptyState` "Không có sản phẩm phù hợp" + `Button` "Xoá bộ lọc" (xoá `category_id`, `gioi_tinh`, `page`).
5. Phân trang: số trang dạng chữ, trang hiện tại gạch chân, `aria-current="page"`, thêm "Trước"/"Tiếp" khi có.

### 4.3 Chi tiết sản phẩm (`pages/ProductDetail.jsx`)

Giữ nguyên: truy vấn sản phẩm, `size`, `qty`, giới hạn `MAX_PER_ADD` và tồn kho, `handleAddToCart(goCheckout)`, schema và gửi đánh giá.

1. Lưới 2 cột (desktop), xếp dọc trên điện thoại.
   - Trái: ô ảnh `tile` tỉ lệ 4:5, ảnh `object-contain`.
   - Phải (dính `sticky` khi cuộn trên desktop): breadcrumb; `h1` display tên SP; sao + "{n} đánh giá"; `Price size="lg"`; mô tả; "Kích cỡ" (nút vuông, chọn thì nền `ink`, `aria-pressed`) + "Còn {so_luong} sản phẩm"; bộ tăng giảm số lượng (nút `−`/`+` có `aria-label`) + `Button` primary "Thêm vào giỏ"; `Button` secondary "Mua ngay"; danh sách 3 cam kết. Hiệu ứng `useReveal` `onLoad`.
2. **Đánh giá** (kẻ trên): cột trái là tiêu đề display "Đánh giá", điểm trung bình "/5", số đánh giá, và nếu đã đăng nhập thì nút "Viết đánh giá" bật/tắt form (form dùng `Field`: chọn sao `select`, `textarea` nhận xét, nút gửi có `loading`). Cột phải là danh sách: tên, sao, ngày; nhận xét; "Phản hồi từ shop" viền trái `accent` nếu có. Chưa có → "Chưa có đánh giá nào".
3. **Thay đổi hành vi (b):** bỏ `reviewsReady` và bộ đếm 4 giây; truy vấn đánh giá chạy ngay khi có `id`.
4. Không tìm thấy SP → `EmptyState` "Không tìm thấy sản phẩm" + link về `/category`.

## 5. Hợp đồng với test E2E (`tests/e2e`)

Giao diện mới giữ các móc kỹ thuật sau:

| Móc | Nơi |
|---|---|
| `[data-testid="product-item"]` | Phần tử gốc của `ProductCard` |
| Tên SP là `h3 > a` | `ProductCard` |
| `input[name="category"]`, `input[name="gender"]` (radio) | Thanh lọc Danh mục |
| Tab là `<button>` có chữ tab | Trang chủ |
| Thông báo "Đã thêm vào giỏ hàng" | Toast khi thêm từ trang chi tiết |

Chữ đổi có chủ đích → sửa test tương ứng (dùng đúng chữ trong DOM, không phụ thuộc CSS in hoa):

| Test | Hiện đang tìm | Đổi thành |
|---|---|---|
| `products_test.js` | `Nổi Bật`, `Bán Chạy`, `Khuyến Mãi` | `Nổi bật`, `Bán chạy`, `Khuyến mãi` |
| `products_test.js` | `Bộ Lọc` | `Bộ lọc` |
| `products_test.js` | `Thêm Giỏ` | `Thêm vào giỏ` |
| `cart_test.js` (bước thêm từ trang chi tiết) | nút `Thêm Vào Giỏ` | nút `Thêm vào giỏ` |

Các test của trang thuộc đợt 2–3 không sửa trong đợt này.

## 6. Kiểm chứng (mỗi bước và cuối đợt)

1. `npm run lint` và `npm run build` trong `fashionshop-web` không lỗi.
2. `grep` không còn `framer-motion`, `FabricCanvas`, `Reveal`, `SaleBadge`, `MOCK_PRODUCTS`, `reviewsReady` trong `src`.
3. Chạy web + API local, mở Trang chủ, Danh mục (có lọc, lọc rỗng, trang 2), Chi tiết SP ở 375px, 768px, 1440px; chụp ảnh và tự xem lại bố cục, tràn ngang, ảnh admin hero/nam/nữ đúng `fit/pos`.
4. Luồng: Trang chủ → thẻ SP → chi tiết → chọn size, tăng số lượng → "Thêm vào giỏ" → số trên Header tăng → "Mua ngay" chuyển `/checkout`.
5. Giả lập `prefers-reduced-motion: reduce`: không có hiệu ứng, nội dung hiện đủ.
6. Bàn phím: Tab qua Header, tab sản phẩm, chip lọc, thẻ SP, nút size, nút thêm giỏ đều thấy viền focus và thao tác được.
7. `npm run test:e2e` trong `tests` với `products_test.js` và `cart_test.js`; báo kết quả thật, kể cả test đã hỏng từ trước không liên quan.

## 7. Ngoài phạm vi

- Trang của đợt 2, 3 (chỉ nhận token màu/font).
- `fashionshop-admin`, API, dữ liệu.
- Tính năng mới (bộ sưu tập ảnh nhiều tấm, lọc theo giá, danh sách yêu thích…).
- Thư viện test giao diện mới (Vitest/Testing Library).
- Tối ưu ảnh qua biến đổi URL Cloudinary.
