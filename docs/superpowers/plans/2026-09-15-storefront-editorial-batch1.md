# Web bán hàng Editorial — Đợt 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đổi `fashionshop-web` sang phong cách Editorial tối giản (nền kem, Playfair Display + Inter, GSAP tối thiểu) cho nền tảng, Header, Footer, Trang chủ, Danh mục, Chi tiết sản phẩm — logic dữ liệu giữ nguyên.

**Architecture:** Token màu/font trong `@theme` của Tailwind 4; bộ component nhỏ trong `src/components/ui/`; mọi hiệu ứng đi qua một hook `useReveal` dùng `useGSAP` + `gsap.matchMedia()` (tắt khi giảm chuyển động, không ẩn sẵn nội dung). Mỗi trang chỉ thay JSX, giữ nguyên truy vấn React Query, store Zustand, form và route.

**Tech Stack:** React 19, Vite 8, Tailwind CSS 4 (`@tailwindcss/vite`), `gsap` 3.x, `@gsap/react` 2.x, `lucide-react`, CodeceptJS + Playwright (test E2E có sẵn trong `tests/`).

**Spec:** `docs/superpowers/specs/2026-09-15-storefront-editorial-redesign-design.md`

## Global Constraints

- Chỉ sửa `fashionshop-web/`, `tests/e2e/products_test.js`, `tests/e2e/cart_test.js`, `.gitignore`. Không đụng `fashionshop-admin/`, `fashionshop-api/`.
- Không đổi logic: hàm gọi API, `queryKey`, store, schema zod, route giữ nguyên, trừ 2 thay đổi hành vi: (a) bỏ `MOCK_PRODUCTS` ở Danh mục, (b) bỏ bộ đếm 4 giây tải đánh giá.
- Màu dùng token, không viết hex trong component: `paper #f6f3ee`, `tile #ece6db`, `surface #ffffff`, `ink #141414`, `ink-soft #5c554b`, `ink-faint #6b645a`, `accent #7a5f3c`, `line #d9d2c5`, `sale #b42318`; `tile-warm` = `#f6f3ee`.
- Font: `--font-display` = Playfair Display (500, nghiêng 500); `--font-sans` = Inter (400/500/600).
- Góc vuông, không đổ bóng (trừ menu thả Header). Vùng bấm tối thiểu 44px (`min-h-11`). Icon lucide `strokeWidth={1.5}`; icon trang trí có `aria-hidden="true"`.
- **Không in hoa bằng CSS** cho chữ nút, tab, nhãn "Bộ lọc" (test E2E đọc `innerText`). Chỉ `.eyebrow` được in hoa.
- Hiệu ứng: chỉ qua `useReveal` (opacity 0→1, y 12→0, 0.35s, `power1.out`, stagger 0.05). Không pin, parallax, ScrollSmoother, chuyển trang, marquee.
- Móc test phải giữ: `data-testid="product-item"` trên gốc thẻ SP; tên SP là `h3 > a`; radio `name="category"` và `name="gender"`; tab là `<button>`; toast "Đã thêm vào giỏ hàng" ở trang chi tiết.
- Commit thẳng `main`, message tiếng Anh dạng câu, kết thúc bằng dòng `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Lệnh chạy trong PowerShell; đường dẫn gốc repo `C:\laragon\www\Fashion-Shop`.

## Kiểm chứng dùng chung

Web không có unit test; "test" của mỗi task là: lint + build, test E2E liên quan (khi task chạm vào trang có test), và kiểm tra trên trình duyệt. Các lệnh:

- **Lint + build** (trong `fashionshop-web`): `npm run lint; if ($?) { npm run build }` — Expected: không lỗi, `✓ built`.
- **Chạy local để test E2E** (3 cửa sổ/tiến trình nền, giữ chạy suốt đợt):
  - API: `cd C:\laragon\www\Fashion-Shop\fashionshop-api; C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe artisan serve` (cổng 8000)
  - Web: `cd C:\laragon\www\Fashion-Shop\fashionshop-web; npm run dev` (cổng 5173)
  - Test: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/<file>_test.js -c codecept.e2e.conf.js --steps`
- Test E2E đăng ký user mới vào DB local mỗi lần chạy — đó là hành vi sẵn có của bộ test.

## File Structure

| File | Trạng thái | Trách nhiệm |
|---|---|---|
| `.gitignore` | Sửa | Bỏ qua `tests/output/` (thư mục output CodeceptJS) |
| `fashionshop-web/package.json`, `package-lock.json` | Sửa | Thêm `gsap`, `@gsap/react`; gỡ `framer-motion` (Task 5) |
| `fashionshop-web/index.html` | Sửa | Font, `theme-color` |
| `fashionshop-web/src/index.css` | Sửa | Token, base, `.eyebrow`, hành vi nút thêm giỏ |
| `fashionshop-web/src/App.css` | Xoá | Không ai import |
| `fashionshop-web/src/App.jsx` | Sửa | Màu Toaster |
| `fashionshop-web/src/lib/gsap.js` | Tạo | Đăng ký plugin GSAP một lần |
| `fashionshop-web/src/hooks/useReveal.js` | Tạo | Hiệu ứng hiện dần dùng chung |
| `fashionshop-web/src/utils/promises.js` | Tạo | 3 cam kết dịch vụ (Trang chủ + Chi tiết) |
| `fashionshop-web/src/components/ui/Button.jsx` | Tạo | Nút / link dạng nút |
| `fashionshop-web/src/components/ui/Container.jsx` | Tạo | Khung rộng + lề |
| `fashionshop-web/src/components/ui/SectionHeading.jsx` | Tạo | Eyebrow + tiêu đề display + action |
| `fashionshop-web/src/components/ui/Price.jsx` | Tạo | Giá, giá gốc, % giảm |
| `fashionshop-web/src/components/ui/Field.jsx` | Tạo | Nhãn + ô nhập + lỗi |
| `fashionshop-web/src/components/ui/fieldStyles.js` | Tạo | Class chung cho ô nhập |
| `fashionshop-web/src/components/ui/EmptyState.jsx` | Tạo | Trạng thái rỗng |
| `fashionshop-web/src/components/ui/LoadingSpinner.jsx`, `StarRating.jsx`, `StatusBadge.jsx` | Sửa | Màu theo token, a11y |
| `fashionshop-web/src/components/ui/ProductCard.jsx` | Viết lại | Thẻ sản phẩm |
| `fashionshop-web/src/components/layout/Header.jsx`, `Footer.jsx` | Viết lại | Khung trang |
| `fashionshop-web/src/pages/Home.jsx`, `Category.jsx`, `ProductDetail.jsx` | Viết lại | 3 trang đợt 1 |
| `fashionshop-web/src/components/ui/Reveal.jsx`, `FabricCanvas.jsx`, `SaleBadge.jsx` | Xoá | Thay bằng `useReveal` / `Price` |
| `tests/e2e/products_test.js`, `tests/e2e/cart_test.js` | Sửa | Chữ theo giao diện mới |

---

### Task 1: Nền tảng — token, font, GSAP

**Files:**
- Modify: `.gitignore`
- Modify: `fashionshop-web/package.json` (qua npm)
- Modify: `fashionshop-web/index.html`
- Modify: `fashionshop-web/src/index.css` (thay toàn bộ)
- Modify: `fashionshop-web/src/App.jsx:51-60`
- Delete: `fashionshop-web/src/App.css`
- Create: `fashionshop-web/src/lib/gsap.js`
- Create: `fashionshop-web/src/hooks/useReveal.js`
- Create: `fashionshop-web/src/utils/promises.js`

**Interfaces:**
- Produces:
  - Class Tailwind từ token: `bg-paper`, `bg-tile`, `bg-surface`, `text-ink`, `text-ink-soft`, `text-ink-faint`, `text-accent`, `border-line`, `text-sale`, `font-display`, `font-sans`; class `.eyebrow`, `.link-underline`.
  - `import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap"`
  - `useReveal(scopeRef, { selector = "[data-reveal]", stagger = 0.05, onLoad = false, dependencies = [] } = {}): void` — default export của `src/hooks/useReveal.js`; animate các phần tử khớp `selector` bên trong `scopeRef.current`.
  - `export const PROMISES: Array<{ icon: LucideIcon, label: string }>` từ `src/utils/promises.js`.

- [ ] **Step 1: Ghi lại kết quả test E2E trước khi sửa (baseline)**

Khởi động API và web như mục "Kiểm chứng dùng chung", rồi:

Run: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/products_test.js -c codecept.e2e.conf.js; npx codeceptjs run e2e/cart_test.js -c codecept.e2e.conf.js`
Expected: có kết quả pass/fail cho từng scenario. Ghi lại danh sách scenario **đang fail từ trước** (ví dụ `Nổi Bật`, `Thêm Giỏ` không khớp giao diện hiện tại) để các task sau phân biệt hỏng mới và hỏng cũ.

- [ ] **Step 2: Bỏ qua thư mục output của test**

Thêm vào cuối `.gitignore` ở gốc repo:

```gitignore

# output CodeceptJS (ảnh chụp khi test fail)
tests/output/
```

- [ ] **Step 3: Cài GSAP**

Run: `cd C:\laragon\www\Fashion-Shop\fashionshop-web; npm install gsap@^3.13 @gsap/react@^2.1`
Expected: `package.json` có `"gsap"` và `"@gsap/react"` trong `dependencies`.

- [ ] **Step 4: Đổi font và màu nền trong `index.html`**

Trong `fashionshop-web/index.html`:
- Thay `<meta name="theme-color" content="#ffffff" />` bằng `<meta name="theme-color" content="#f6f3ee" />`.
- Thay thẻ `<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet" />` (nhiều dòng) bằng:

```html
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;1,500&display=swap"
      rel="stylesheet"
    />
```

- Thay `html { background-color: #ffffff; }` bằng `html { background-color: #f6f3ee; }`.

Dùng công cụ Edit theo từng đoạn, không ghi lại cả file (file có tiếng Việt, tránh hỏng mã hoá).

- [ ] **Step 5: Thay `src/index.css`**

Ghi đè toàn bộ `fashionshop-web/src/index.css`:

```css
@import "tailwindcss";

/* ============================================================
   Design tokens — Editorial tối giản.
   Nền kem cho cảm giác giấy tạp chí; ô ảnh đậm hơn một bậc để ảnh
   tách nền có chỗ tựa. Mọi màu chữ đạt tương phản >= 4.5:1 trên paper.
   ============================================================ */
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Playfair Display", ui-serif, Georgia, serif;

  --color-paper: #f6f3ee;        /* nền trang */
  --color-tile: #ece6db;         /* ô ảnh sản phẩm */
  --color-tile-warm: #f6f3ee;    /* tên cũ, các trang chưa làm lại vẫn dùng */
  --color-surface: #ffffff;      /* ô nhập, menu thả */

  --color-ink: #141414;          /* chữ chính, nút chính — 16.6:1 */
  --color-ink-soft: #5c554b;     /* chữ phụ — 6.6:1 */
  --color-ink-faint: #6b645a;    /* chú thích, giá gốc — 5.3:1 */
  --color-accent: #7a5f3c;       /* nâu đồng nhấn — 5.4:1 */
  --color-line: #d9d2c5;         /* đường kẻ */

  --color-sale: #b42318;         /* giảm giá, lỗi — 5.9:1 */
}

@layer base {
  *, ::before, ::after {
    border-color: var(--color-line);
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    background-color: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-sans);
    font-size: 1rem;
    line-height: 1.6;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4 {
    letter-spacing: -0.02em;
    text-wrap: balance;
    font-weight: 600;
  }

  /* Tiêu đề serif mảnh hơn và khít chữ vừa phải */
  .font-display {
    font-weight: 500;
    letter-spacing: -0.01em;
  }

  input, textarea, select {
    accent-color: var(--color-ink);
  }

  ::selection {
    background-color: var(--color-ink);
    color: #fff;
  }

  ::-webkit-scrollbar { width: 11px; height: 11px; }
  ::-webkit-scrollbar-track { background: var(--color-paper); }
  ::-webkit-scrollbar-thumb { background: var(--color-line); border: 3px solid var(--color-paper); }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-ink-faint); }

  :focus-visible {
    outline: 2px solid var(--color-ink);
    outline-offset: 2px;
  }
}

/* ============================================================
   Tiện ích
   ============================================================ */

/* Nhãn nhỏ in hoa giãn chữ. Không dùng cho chữ mà test E2E tìm theo nội dung. */
.eyebrow {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent);
}

/* Gạch chân chạy từ trái khi rê chuột */
.link-underline {
  position: relative;
}
.link-underline::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  height: 1px;
  width: 100%;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
.link-underline:hover::after {
  transform: scaleX(1);
}

/* Dải ảnh chạy ngang — Trang chủ cũ còn dùng, xoá ở Task 5 */
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 45s linear infinite;
}
.marquee-track:hover {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .marquee-track { animation: none; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Xoá `App.css` và đổi màu Toaster**

Run: `git -C C:\laragon\www\Fashion-Shop rm -q fashionshop-web/src/App.css`

Trong `fashionshop-web/src/App.jsx`, thay khối `style` của `<Toaster>`:

```jsx
            style: {
              background: "#141414",
              color: "#ffffff",
              borderRadius: "0",
              fontSize: "14px",
            },
```

(Toaster nhận style inline nên đây là chỗ duy nhất được viết hex; giá trị bằng token `ink`.)

- [ ] **Step 7: Tạo `src/lib/gsap.js`**

```js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Đăng ký một lần cho cả ứng dụng; nơi khác import từ file này
gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
```

- [ ] **Step 8: Tạo `src/hooks/useReveal.js`**

```js
import { gsap, useGSAP } from "../lib/gsap";

/**
 * Cho các phần tử khớp `selector` bên trong scopeRef hiện dần lên.
 *
 * - Chỉ chạy khi người dùng không bật giảm chuyển động.
 * - Không ẩn sẵn bằng CSS: GSAP chỉ đặt trạng thái ẩn ngay trước khi chạy,
 *   nên JS lỗi hay tắt hiệu ứng thì nội dung vẫn hiện đầy đủ.
 * - `onLoad` chạy ngay khi gắn (hero); mặc định chờ khối cuộn tới.
 * - `dependencies` đổi (dữ liệu tải xong, đổi tab) thì chạy lại cho phần tử mới.
 */
export default function useReveal(
  scopeRef,
  { selector = "[data-reveal]", stagger = 0.05, onLoad = false, dependencies = [] } = {}
) {
  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = gsap.utils.toArray(selector, scope);
        if (targets.length === 0) return;

        gsap.from(targets, {
          opacity: 0,
          y: 12,
          duration: 0.35,
          ease: "power1.out",
          stagger,
          ...(onLoad
            ? {}
            : { scrollTrigger: { trigger: scope, start: "top 85%", once: true } }),
        });
      });

      return () => mm.revert();
    },
    { scope: scopeRef, dependencies, revertOnUpdate: true }
  );
}
```

- [ ] **Step 9: Tạo `src/utils/promises.js`**

```js
import { Truck, RotateCcw, Wallet } from "lucide-react";

/** Cam kết dịch vụ, hiện ở Trang chủ và trang Chi tiết sản phẩm */
export const PROMISES = [
  { icon: Truck, label: "Giao nhanh toàn quốc" },
  { icon: RotateCcw, label: "Đổi trả trong 7 ngày" },
  { icon: Wallet, label: "Thanh toán khi nhận hàng" },
];
```

- [ ] **Step 10: Lint + build**

Run: `cd C:\laragon\www\Fashion-Shop\fashionshop-web; npm run lint; if ($?) { npm run build }`
Expected: không lỗi; `✓ built`. (`useReveal` và `promises.js` chưa được import — không phải lỗi.)

- [ ] **Step 11: Xem nhanh trên trình duyệt**

Mở `http://localhost:5173/`. Expected: nền kem, chữ Inter; trang chủ cũ vẫn chạy (marquee, WebGL còn nguyên). Mở DevTools Console: không có lỗi mới.

- [ ] **Step 12: Commit**

```bash
git -C C:\laragon\www\Fashion-Shop add .gitignore fashionshop-web/package.json fashionshop-web/package-lock.json fashionshop-web/index.html fashionshop-web/src/index.css fashionshop-web/src/App.jsx fashionshop-web/src/lib fashionshop-web/src/hooks fashionshop-web/src/utils/promises.js
git -C C:\laragon\www\Fashion-Shop commit -m "Lay the editorial tokens, fonts and GSAP groundwork for the storefront" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

(`App.css` đã được stage bởi `git rm` ở Step 6.)

---

### Task 2: Component dùng chung

**Files:**
- Create: `fashionshop-web/src/components/ui/Button.jsx`
- Create: `fashionshop-web/src/components/ui/Container.jsx`
- Create: `fashionshop-web/src/components/ui/SectionHeading.jsx`
- Create: `fashionshop-web/src/components/ui/Price.jsx`
- Create: `fashionshop-web/src/components/ui/fieldStyles.js`
- Create: `fashionshop-web/src/components/ui/Field.jsx`
- Create: `fashionshop-web/src/components/ui/EmptyState.jsx`
- Modify: `fashionshop-web/src/components/ui/LoadingSpinner.jsx` (thay toàn bộ)
- Modify: `fashionshop-web/src/components/ui/StarRating.jsx` (thay toàn bộ)
- Modify: `fashionshop-web/src/components/ui/StatusBadge.jsx` (thay toàn bộ)

**Interfaces:**
- Consumes: token Task 1; `formatCurrency(amount: number): string` từ `src/utils/formatCurrency.js`.
- Produces (tất cả là default export, trừ `INPUT_CLASS`):
  - `Button({ variant = "primary" | "secondary" | "link", size = "md" | "lg", loading = false, to?: string, type = "button", className = "", disabled, children, ...rest })` — có `to` thì render `<Link>`; `loading` → `disabled`, `aria-busy`, chữ "Đang xử lý…".
  - `Container({ as = "div", className = "", children })`
  - `SectionHeading({ eyebrow?, title, as = "h2", action?, className = "", ...rest })` — `rest` (vd. `data-reveal`) gắn vào div ngoài.
  - `Price({ gia: number, gia_cu?: number, size = "sm" | "lg" })`
  - `export const INPUT_CLASS: string` từ `fieldStyles.js`
  - `Field({ label, error?, hint?, className = "", children })` — `children` là một phần tử ô nhập; Field gắn `id`, `aria-invalid`, `aria-describedby`.
  - `EmptyState({ title, action? })` — tiêu đề là `h2`.
  - `LoadingSpinner({ className = "" })`, `StarRating({ rating, max = 5, size = 16 })`, `StatusBadge({ status })` — props không đổi.

- [ ] **Step 1: Tạo `Button.jsx`**

```jsx
import { Link } from "react-router-dom";

const BASE =
  "inline-flex items-center justify-center gap-2 text-[13px] font-semibold tracking-[0.02em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS = {
  primary: "bg-ink px-6 text-white hover:bg-black",
  secondary: "border border-ink px-6 text-ink hover:bg-ink hover:text-white",
  link: "text-ink underline decoration-1 underline-offset-4 hover:text-accent",
};

const SIZES = {
  md: "min-h-11",
  lg: "min-h-13 px-8",
};

/**
 * Nút dùng chung. Chữ giữ nguyên hoa/thường như viết (không in hoa bằng CSS)
 * để test E2E tìm theo nội dung vẫn khớp.
 */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  to,
  type = "button",
  className = "",
  disabled,
  children,
  ...rest
}) {
  const cls = [BASE, VARIANTS[variant], variant === "link" ? "" : SIZES[size], className]
    .filter(Boolean)
    .join(" ");
  const content = loading ? "Đang xử lý…" : children;

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
```

- [ ] **Step 2: Tạo `Container.jsx`**

```jsx
/** Khung nội dung rộng tối đa 1400px với lề hai bên thống nhất */
export default function Container({ as: Tag = "div", className = "", children }) {
  return <Tag className={`mx-auto w-full max-w-[1400px] px-5 lg:px-8 ${className}`}>{children}</Tag>;
}
```

- [ ] **Step 3: Tạo `SectionHeading.jsx`**

```jsx
/** Nhãn nhỏ + tiêu đề serif, kèm phần điều khiển bên phải (tab, link) nếu có */
export default function SectionHeading({ eyebrow, title, as: Tag = "h2", action, className = "", ...rest }) {
  return (
    <div
      className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${className}`}
      {...rest}
    >
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <Tag className="font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</Tag>
      </div>
      {action}
    </div>
  );
}
```

- [ ] **Step 4: Tạo `Price.jsx`**

```jsx
import { formatCurrency } from "../../utils/formatCurrency";

/** Giá bán, kèm giá gốc gạch ngang và phần trăm giảm khi có giảm giá */
export default function Price({ gia, gia_cu, size = "sm" }) {
  const giam = gia_cu > gia ? Math.round(((gia_cu - gia) / gia_cu) * 100) : 0;
  const chinh = size === "lg" ? "text-2xl" : "text-sm";
  const phu = size === "lg" ? "text-base" : "text-xs";

  return (
    <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      <span className={`${chinh} font-medium tabular-nums text-ink`}>{formatCurrency(gia)}</span>
      {giam > 0 && (
        <>
          <span className={`${phu} tabular-nums text-ink-faint line-through`}>
            <span className="sr-only">Giá gốc </span>
            {formatCurrency(gia_cu)}
          </span>
          <span className="text-xs font-semibold text-sale">−{giam}%</span>
        </>
      )}
    </p>
  );
}
```

- [ ] **Step 5: Tạo `fieldStyles.js` và `Field.jsx`**

`fieldStyles.js`:

```js
/** Class chung cho input, select, textarea trên nền kem */
export const INPUT_CLASS =
  "w-full border border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-ink aria-[invalid=true]:border-sale";
```

`Field.jsx`:

```jsx
import { cloneElement, isValidElement, useId } from "react";

/**
 * Nhãn phía trên, lỗi ngay dưới ô. Gắn id / aria vào ô nhập con để trình đọc
 * màn hình đọc được nhãn và lỗi. Dùng được với {...register("ten")}.
 */
export default function Field({ label, error, hint, className = "", children }) {
  const id = useId();
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": errorId ?? hintId,
      })
    : children;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {control}
      {hintId && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-faint">
          {hint}
        </p>
      )}
      {errorId && (
        <p id={errorId} className="mt-1.5 text-sm text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Tạo `EmptyState.jsx`**

```jsx
/** Thông báo khi không có gì để hiện, kèm hành động gợi ý */
export default function EmptyState({ title, action }) {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <h2 className="font-display text-2xl text-ink sm:text-3xl">{title}</h2>
      {action}
    </div>
  );
}
```

- [ ] **Step 7: Viết lại `LoadingSpinner.jsx`, `StarRating.jsx`, `StatusBadge.jsx`**

`LoadingSpinner.jsx`:

```jsx
export default function LoadingSpinner({ className = "" }) {
  return (
    <div role="status" className={`flex items-center justify-center py-24 ${className}`}>
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-ink" />
      <span className="sr-only">Đang tải</span>
    </div>
  );
}
```

`StarRating.jsx`:

```jsx
import { Star } from "lucide-react";

export default function StarRating({ rating, max = 5, size = 16 }) {
  return (
    <div
      role="img"
      aria-label={`Đánh giá ${Number(rating).toFixed(1)} trên ${max}`}
      className="flex items-center gap-0.5"
    >
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          aria-hidden="true"
          className={i < Math.round(rating) ? "fill-accent text-accent" : "text-line"}
        />
      ))}
    </div>
  );
}
```

`StatusBadge.jsx`:

```jsx
import { ORDER_STATUS } from "../../utils/constants";

export default function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] || { label: status, color: "border border-line bg-tile text-ink-soft" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}
```

- [ ] **Step 8: Lint + build**

Run: `cd C:\laragon\www\Fashion-Shop\fashionshop-web; npm run lint; if ($?) { npm run build }`
Expected: không lỗi, `✓ built`.

- [ ] **Step 9: Xem nhanh**

Mở `http://localhost:5173/orders` (đã đăng nhập) và `http://localhost:5173/products/1`. Expected: spinner, sao (màu nâu đồng), nhãn trạng thái đơn hiện bình thường, không lỗi console.

- [ ] **Step 10: Commit**

```bash
git -C C:\laragon\www\Fashion-Shop add fashionshop-web/src/components/ui
git -C C:\laragon\www\Fashion-Shop commit -m "Add the shared editorial building blocks for the storefront" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Thẻ sản phẩm

**Files:**
- Modify: `tests/e2e/products_test.js:37-42`
- Modify: `fashionshop-web/src/components/ui/ProductCard.jsx` (thay toàn bộ)
- Modify: `fashionshop-web/src/index.css` (thêm khối nút thêm giỏ trước `@media (prefers-reduced-motion`)

**Interfaces:**
- Consumes: `Price`, `StarRating` (Task 2); `imageUrl(ref): string | null` từ `src/utils/imageUrl.js`.
- Produces: `ProductCard({ product, onAddToCart?: (product) => void })` — gốc `<article data-testid="product-item">`; tên SP `h3 > a`; nút `Thêm vào giỏ` có class `add-to-cart`.

- [ ] **Step 1: Sửa test theo chữ mới**

Trong `tests/e2e/products_test.js`, scenario `Product card có nút thêm giỏ`, đổi:

```js
  I.see('Thêm Giỏ');
```

thành:

```js
  I.see('Thêm vào giỏ');
```

- [ ] **Step 2: Chạy test để thấy nó fail**

Run: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/products_test.js -c codecept.e2e.conf.js --grep "Product card có nút thêm giỏ"`
Expected: FAIL — thẻ cũ in hoa bằng CSS (`uppercase`), `innerText` là `THÊM VÀO GIỎ`.

- [ ] **Step 3: Viết lại `ProductCard.jsx`**

```jsx
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import Price from "./Price";
import StarRating from "./StarRating";
import { imageUrl } from "../../utils/imageUrl";

const PLACEHOLDER = "https://placehold.co/600x800/ece6db/6b645a?text=Chưa+có+ảnh";

export default function ProductCard({ product, onAddToCart }) {
  const reviews = product.reviews || [];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const imgSrc = product.hinh_anh ? imageUrl(product.hinh_anh) : PLACEHOLDER;

  return (
    <article data-testid="product-item" className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-tile">
        {/* Ảnh là link phụ (tên SP bên dưới là link chính cho bàn phím) */}
        <Link
          to={`/products/${product.id}`}
          tabIndex={-1}
          aria-hidden="true"
          className="block h-full w-full"
        >
          {/* Ảnh tách nền: contain + đệm để món đồ hiện trọn */}
          <img
            src={imgSrc}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        {onAddToCart && (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            aria-label={`Thêm ${product.ten_sp} vào giỏ`}
            className="add-to-cart absolute inset-x-3 bottom-3 flex min-h-11 items-center justify-center gap-2 bg-ink text-[13px] font-semibold text-white transition-[opacity,transform] duration-200 hover:bg-black"
          >
            <ShoppingBag size={15} strokeWidth={1.5} aria-hidden="true" />
            Thêm vào giỏ
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-3.5">
        <h3 className="text-[15px] font-normal leading-snug tracking-normal text-ink">
          <Link to={`/products/${product.id}`} className="link-underline">
            {product.ten_sp}
          </Link>
        </h3>

        {avgRating > 0 && <StarRating rating={avgRating} size={12} />}

        <div className="mt-auto pt-0.5">
          <Price gia={product.gia} gia_cu={product.gia_cu} />
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Thêm hành vi hiện nút khi rê chuột vào `index.css`**

Chèn ngay trước dòng `@media (prefers-reduced-motion: reduce) {`:

```css
/* Nút thêm giỏ trên thẻ SP: thiết bị có chuột thì hiện khi rê/focus,
   màn hình cảm ứng thì luôn hiện. Opacity 0 vẫn được Playwright coi là nhìn thấy. */
@media (hover: hover) {
  .group .add-to-cart {
    opacity: 0;
    transform: translateY(8px);
  }
  .group:hover .add-to-cart,
  .add-to-cart:focus-visible {
    opacity: 1;
    transform: none;
  }
}

```

- [ ] **Step 5: Lint + build**

Run: `cd C:\laragon\www\Fashion-Shop\fashionshop-web; npm run lint; if ($?) { npm run build }`
Expected: không lỗi.

- [ ] **Step 6: Chạy test để thấy pass**

Run: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/products_test.js -c codecept.e2e.conf.js --grep "Product card có nút thêm giỏ"`
Expected: PASS.

- [ ] **Step 7: Xem trên trình duyệt**

Mở `http://localhost:5173/category`. Expected: thẻ nền `tile`, góc vuông, tên SP có gạch chân khi rê, rê chuột hiện nút "Thêm vào giỏ" (chữ thường), bấm nút thêm được (đã đăng nhập) và không chuyển trang. Tab tới tên SP thấy viền focus; Tab tiếp tới nút thêm giỏ thì nút hiện ra.

- [ ] **Step 8: Commit**

```bash
git -C C:\laragon\www\Fashion-Shop add tests/e2e/products_test.js fashionshop-web/src/components/ui/ProductCard.jsx fashionshop-web/src/index.css
git -C C:\laragon\www\Fashion-Shop commit -m "Redraw the product card in the editorial style" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Header và Footer

**Files:**
- Modify: `fashionshop-web/src/components/layout/Header.jsx` (thay toàn bộ)
- Modify: `fashionshop-web/src/components/layout/Footer.jsx` (thay toàn bộ)

**Interfaces:**
- Consumes: `Button`, `Container` (Task 2); `useAuthStore` (`user`, `token`, `logout`), `useCartStore` (`count`), `logout` từ `src/api/authApi.js`.
- Produces: không có API mới; Header/Footer vẫn được `App.jsx` dùng như cũ.

- [ ] **Step 1: Viết lại `Header.jsx`**

```jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X, LogOut, Package } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import useCartStore from "../../stores/cartStore";
import { logout as logoutApi } from "../../api/authApi";
import Container from "../ui/Container";
import Button from "../ui/Button";

const NAV_LINKS = [
  { label: "Nam", to: "/category?gioi_tinh=1" },
  { label: "Nữ", to: "/category?gioi_tinh=0" },
  { label: "Liên hệ", to: "/contact" },
];

const MENU_ITEM =
  "flex min-h-11 w-full items-center gap-3 px-4 text-sm text-ink-soft transition-colors duration-200 hover:bg-tile hover:text-ink";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { user, token, logout } = useAuthStore();
  const count = useCartStore((s) => s.count);

  const currentPath = pathname + search;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ("");
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch { /* bỏ qua lỗi mạng, vẫn đăng xuất phía client */ }
    logout();
    setUserMenuOpen(false);
    navigate("/");
    toast.success("Đã đăng xuất");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-md">
      <Container>
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-[72px]">
          {/* Cột trái: menu desktop / nút mở menu điện thoại */}
          <div className="flex items-center">
            <nav aria-label="Danh mục chính" className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((l) => {
                const active = currentPath === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    aria-current={active ? "page" : undefined}
                    className={`link-underline text-sm transition-colors duration-200 ${
                      active ? "text-ink" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              className="-ml-2.5 flex h-11 w-11 items-center justify-center text-ink md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>

          <Link to="/" className="font-display text-xl text-ink md:text-2xl">
            Fashion Shop
          </Link>

          {/* Cột phải: tìm kiếm, tài khoản, giỏ */}
          <div className="flex items-center justify-end gap-1 md:gap-3">
            <form
              onSubmit={handleSearch}
              role="search"
              className="hidden items-center gap-2 border-b border-line py-1.5 transition-colors duration-200 focus-within:border-ink lg:flex"
            >
              <Search size={15} strokeWidth={1.5} className="shrink-0 text-ink-faint" aria-hidden="true" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Tìm sản phẩm"
                aria-label="Tìm sản phẩm"
                className="w-36 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
            </form>

            {token ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label="Tài khoản"
                  className="flex h-11 items-center gap-2 px-2 text-ink transition-opacity duration-200 hover:opacity-60"
                >
                  <User size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span className="hidden max-w-24 truncate text-sm md:block">
                    {user?.fullname?.split(" ").pop()}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-52 border border-line bg-surface py-1.5 shadow-lg shadow-black/5">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className={MENU_ITEM}>
                        <User size={15} strokeWidth={1.5} aria-hidden="true" /> Hồ sơ
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className={MENU_ITEM}>
                        <Package size={15} strokeWidth={1.5} aria-hidden="true" /> Đơn hàng
                      </Link>
                      <div className="my-1.5 h-px bg-line" />
                      <button type="button" onClick={handleLogout} className={`${MENU_ITEM} text-sale hover:text-sale`}>
                        <LogOut size={15} strokeWidth={1.5} aria-hidden="true" /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden h-11 items-center px-2 text-sm text-ink-soft transition-colors duration-200 hover:text-ink md:flex"
              >
                Đăng nhập
              </Link>
            )}

            <Link
              to={token ? "/cart" : "/login"}
              aria-label={token && count > 0 ? `Giỏ hàng, ${count} sản phẩm` : "Giỏ hàng"}
              className="relative -mr-2.5 flex h-11 w-11 items-center justify-center text-ink transition-opacity duration-200 hover:opacity-60"
            >
              <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" />
              {token && count > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center bg-ink px-1 text-[10px] font-semibold text-white"
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line py-5 md:hidden">
            <form
              onSubmit={handleSearch}
              role="search"
              className="mb-4 flex items-center gap-2 border-b border-line py-2 focus-within:border-ink"
            >
              <Search size={16} strokeWidth={1.5} className="text-ink-faint" aria-hidden="true" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Tìm sản phẩm"
                aria-label="Tìm sản phẩm"
                className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
              />
            </form>

            <nav aria-label="Danh mục chính" className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 items-center text-base text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {!token && (
              <Button to="/login" onClick={() => setMenuOpen(false)} className="mt-4 w-full">
                Đăng nhập / Đăng ký
              </Button>
            )}
          </div>
        )}
      </Container>
    </header>
  );
}
```

- [ ] **Step 2: Viết lại `Footer.jsx`**

```jsx
import { Link } from "react-router-dom";
import Container from "../ui/Container";

const GROUPS = [
  {
    title: "Mua sắm",
    links: [
      { label: "Thời trang nam", to: "/category?gioi_tinh=1" },
      { label: "Thời trang nữ", to: "/category?gioi_tinh=0" },
      { label: "Tất cả sản phẩm", to: "/category" },
    ],
  },
  { title: "Hỗ trợ", links: [{ label: "Liên hệ", to: "/contact" }] },
  {
    title: "Tài khoản",
    links: [
      { label: "Đơn hàng", to: "/orders" },
      { label: "Hồ sơ", to: "/profile" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container>
        <div className="grid gap-10 py-16 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="font-display text-2xl text-ink">Fashion Shop</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
              Thời trang nam và nữ được tuyển chọn theo phom dáng và chất vải.
              Giá minh bạch, không phụ phí ẩn.
            </p>
          </div>

          {GROUPS.map((g) => (
            <div key={g.title} className="md:col-span-2">
              <p className="eyebrow mb-4">{g.title}</p>
              <ul className="flex flex-col gap-1">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="inline-flex min-h-9 items-center text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-line py-7 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Fashion Shop</span>
          <span>Đồ án môn học · Laravel 11 &amp; React 19</span>
        </div>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 3: Lint + build**

Run: `cd C:\laragon\www\Fashion-Shop\fashionshop-web; npm run lint; if ($?) { npm run build }`
Expected: không lỗi.

- [ ] **Step 4: Chạy lại test E2E liên quan tới Header**

Run: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/cart_test.js -c codecept.e2e.conf.js`
Expected: các scenario pass ở baseline (Task 1 Step 1) vẫn pass (đăng nhập qua localStorage, `/cart` chuyển `/login` khi chưa đăng nhập).

- [ ] **Step 5: Xem trên trình duyệt**

Ở 1440px: logo serif giữa, menu trái, tìm kiếm + tài khoản + giỏ phải; mở menu tài khoản, bấm ra ngoài thì đóng; đăng xuất hoạt động. Ở 375px (DevTools device toolbar): nút menu trái, logo giữa, giỏ phải, mở menu thấy ô tìm kiếm + 3 link + nút đăng nhập; không tràn ngang. Tìm "jean" → chuyển `/search?q=jean`.

- [ ] **Step 6: Commit**

```bash
git -C C:\laragon\www\Fashion-Shop add fashionshop-web/src/components/layout
git -C C:\laragon\www\Fashion-Shop commit -m "Rebuild the storefront header and footer around a centred serif mark" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Trang chủ

**Files:**
- Modify: `tests/e2e/products_test.js:3-19`
- Modify: `fashionshop-web/src/pages/Home.jsx` (thay toàn bộ)
- Modify: `fashionshop-web/src/index.css` (xoá khối marquee)
- Delete: `fashionshop-web/src/components/ui/Reveal.jsx`, `fashionshop-web/src/components/ui/FabricCanvas.jsx`
- Modify: `fashionshop-web/package.json` (gỡ `framer-motion`)

**Interfaces:**
- Consumes: `Button`, `Container`, `SectionHeading`, `LoadingSpinner` (Task 2); `ProductCard` (Task 3); `useReveal` và `PROMISES` (Task 1); `getProducts(params)`, `getHomeCovers()`, `addToCart(body)`; API `home-covers` trả `data.data = { hero|nam|nu: { path, fit, pos } }`.
- Produces: không có.

- [ ] **Step 1: Sửa test theo chữ tab mới**

Trong `tests/e2e/products_test.js`, thay hai scenario đầu bằng:

```js
Scenario('Trang chủ hiển thị danh sách sản phẩm và tabs', async ({ I }) => {
  I.amOnPage('/');
  await I.waitForElement('h3', 10);
  I.see('Nổi bật');
  I.see('Bán chạy');
  I.see('Khuyến mãi');
  I.seeElement('h3');
});

Scenario('Trang chủ - tab Bán chạy hiển thị sản phẩm', async ({ I }) => {
  I.amOnPage('/');
  await I.waitForText('Bán chạy', 8);

  I.click('Bán chạy');
  await I.waitForElement('h3', 8);
  I.seeElement('h3');
});
```

- [ ] **Step 2: Chạy test để kiểm tra trạng thái trước khi sửa trang**

Run: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/products_test.js -c codecept.e2e.conf.js --grep "Trang chủ"`
Expected: chữ tab cũ đã là `Nổi bật / Bán chạy / Khuyến mãi` nên có thể PASS ngay; ghi lại kết quả. Mục đích là khoá lại hành vi để Step 6 xác nhận giao diện mới không làm hỏng.

- [ ] **Step 3: Viết lại `Home.jsx`**

```jsx
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getProducts } from "../api/productApi";
import { getHomeCovers } from "../api/homeApi";
import { addToCart } from "../api/cartApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import ProductCard from "../components/ui/ProductCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import SectionHeading from "../components/ui/SectionHeading";
import useReveal from "../hooks/useReveal";
import { imageUrl } from "../utils/imageUrl";
import { PROMISES } from "../utils/promises";

const TABS = [
  { key: "featured", label: "Nổi bật" },
  { key: "bestseller", label: "Bán chạy" },
  { key: "sale", label: "Khuyến mãi" },
];

const COLLECTIONS = [
  {
    to: "/category?gioi_tinh=1",
    gioiTinh: 1,
    title: "Thời trang nam",
    desc: "Quần tây, jean, kaki, polo, sơ mi",
  },
  {
    to: "/category?gioi_tinh=0",
    gioiTinh: 0,
    title: "Thời trang nữ",
    desc: "Quần suông, kaki, short, áo",
  },
];

const ZOOM = "transition-transform duration-300 ease-out group-hover:scale-[1.03]";

export default function Home() {
  const [tab, setTab] = useState("featured");
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { count, setCount } = useCartStore();

  const heroRef = useRef(null);
  const collectionsRef = useRef(null);
  const productsRef = useRef(null);

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ["products", tab],
    queryFn: () => getProducts({ tab, per_page: 8 }),
  });

  const products = productsRes?.data?.data || [];

  const { data: coverRes } = useQuery({
    queryKey: ["home-covers"],
    queryFn: getHomeCovers,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
  const adminCovers = coverRes?.data?.data ?? {};

  /** Ảnh quản trị viên đặt cho một vị trí, kèm cách hiển thị đã chọn */
  const adminCover = (slot) => {
    const c = adminCovers[slot];
    return c?.path ? c : null;
  };

  const withImg = products.filter((p) => p.hinh_anh);
  const heroProduct = withImg[0] ?? null;

  // Ảnh bìa: ưu tiên ảnh quản trị viên đặt, chưa có thì lấy hàng đang bán
  const covers = (() => {
    const nam = withImg.find((p) => p.gioi_tinh === 1)?.hinh_anh;
    const nu = withImg.find((p) => p.gioi_tinh === 0)?.hinh_anh;
    const spare = withImg.map((p) => p.hinh_anh).filter((h) => h !== nam && h !== nu);

    return {
      1: adminCover("nam")?.path ?? nam ?? spare[0] ?? null,
      0: adminCover("nu")?.path ?? nu ?? spare[0] ?? spare[1] ?? null,
    };
  })();

  // Ảnh quản trị viên đặt là ảnh bìa cắt sẵn nên phủ kín khung theo fit/pos;
  // ảnh sản phẩm tách nền thì giữ nguyên tỉ lệ, tránh cắt cụt món đồ.
  const coverFor = (gioiTinh) => adminCover(gioiTinh === 1 ? "nam" : "nu");

  useReveal(heroRef, { onLoad: true });
  useReveal(collectionsRef);
  useReveal(productsRef, { dependencies: [tab, isLoading] });

  const handleAddToCart = async (product) => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ");
      navigate("/login");
      return;
    }
    try {
      await addToCart({ product_id: product.id, quantity: 1, size: "M" });
      setCount(count + 1);
      toast.success("Đã thêm vào giỏ hàng");
    } catch {
      toast.error("Không thể thêm vào giỏ");
    }
  };

  const hero = adminCover("hero");

  return (
    <div>
      {/* ==================== Hero ==================== */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
          <div
            ref={heroRef}
            className="flex flex-col justify-center px-5 py-16 sm:py-20 lg:px-8 lg:py-28 lg:pr-16"
          >
            <p data-reveal className="eyebrow mb-5">Bộ sưu tập 2026</p>
            <h1
              data-reveal
              className="font-display text-[2.75rem] leading-[1.04] text-ink sm:text-6xl lg:text-7xl"
            >
              Mặc đẹp mỗi ngày,
              <br />
              <em className="text-accent">không cần cố gắng.</em>
            </h1>
            <p data-reveal className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
              Quần áo nam và nữ được chọn theo phom dáng và chất vải. Giao nhanh
              toàn quốc, đổi trả trong 7 ngày, thanh toán khi nhận hàng.
            </p>
            <div data-reveal className="mt-9">
              <Button to="/category" size="lg">
                Mua sắm ngay
              </Button>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden bg-tile lg:min-h-[600px]">
            {hero ? (
              <Link to="/category" aria-label="Xem bộ sưu tập" className="group absolute inset-0 block">
                <img
                  src={imageUrl(hero.path)}
                  alt=""
                  fetchPriority="high"
                  className={`h-full w-full ${ZOOM}`}
                  style={{ objectFit: hero.fit, objectPosition: hero.pos }}
                />
              </Link>
            ) : (
              heroProduct && (
                <Link
                  to={`/products/${heroProduct.id}`}
                  className="group absolute inset-0 flex items-center justify-center p-10"
                >
                  <img
                    src={imageUrl(heroProduct.hinh_anh)}
                    alt={heroProduct.ten_sp}
                    fetchPriority="high"
                    className={`max-h-[85%] w-auto object-contain ${ZOOM}`}
                  />
                  <span className="absolute bottom-6 left-6 bg-paper px-4 py-2 text-sm text-ink">
                    {heroProduct.ten_sp}
                  </span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* ==================== Cam kết ==================== */}
      <section aria-label="Cam kết" className="border-b border-line">
        <Container as="ul" className="grid gap-4 py-6 sm:grid-cols-3 sm:gap-8">
          {PROMISES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-ink-soft sm:justify-center">
              <Icon size={18} strokeWidth={1.5} className="shrink-0 text-ink" aria-hidden="true" />
              {label}
            </li>
          ))}
        </Container>
      </section>

      {/* ==================== Bộ sưu tập ==================== */}
      <Container as="section" className="py-20">
        <div ref={collectionsRef}>
          <SectionHeading data-reveal eyebrow="Danh mục" title="Mua theo phong cách" className="mb-10" />

          <div className="grid gap-x-6 gap-y-12 md:grid-cols-2">
            {COLLECTIONS.map((c) => {
              const cover = coverFor(c.gioiTinh);
              const src = covers[c.gioiTinh];
              return (
                <Link key={c.to} to={c.to} data-reveal className="group block">
                  <div className="aspect-[4/3] overflow-hidden bg-tile">
                    {src && (
                      <img
                        src={imageUrl(src)}
                        alt=""
                        loading="lazy"
                        className={cover ? `h-full w-full ${ZOOM}` : `h-full w-full object-contain p-8 ${ZOOM}`}
                        style={cover ? { objectFit: cover.fit, objectPosition: cover.pos } : undefined}
                      />
                    )}
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl text-ink sm:text-3xl">{c.title}</h3>
                    <span className="shrink-0 text-sm text-ink underline decoration-1 underline-offset-4 transition-colors duration-200 group-hover:text-accent">
                      Xem tất cả
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">{c.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>

      {/* ==================== Sản phẩm ==================== */}
      <Container as="section" className="pb-8">
        <div ref={productsRef}>
          <SectionHeading
            data-reveal
            eyebrow="Sản phẩm"
            title="Đang được chú ý"
            className="mb-10"
            action={
              <div role="group" aria-label="Nhóm sản phẩm" className="flex gap-6">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    aria-pressed={tab === t.key}
                    className={`min-h-11 border-b text-sm transition-colors duration-200 ${
                      tab === t.key
                        ? "border-ink text-ink"
                        : "border-transparent text-ink-soft hover:text-ink"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            }
          />

          {isLoading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <p className="py-24 text-center text-sm text-ink-faint">Không có sản phẩm nào</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {products.map((p) => (
                <div key={p.id} data-reveal>
                  <ProductCard product={p} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-14 flex justify-center">
            <Button to="/category" variant="secondary" size="lg">
              Xem tất cả sản phẩm
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
```

- [ ] **Step 4: Xoá marquee, Reveal, FabricCanvas, framer-motion**

Trong `fashionshop-web/src/index.css`, xoá khối từ dòng `/* Dải ảnh chạy ngang — Trang chủ cũ còn dùng, xoá ở Task 5 */` tới hết rule `.marquee-track:hover { ... }`, và xoá dòng `  .marquee-track { animation: none; }` trong `@media (prefers-reduced-motion: reduce)`.

Run:

```powershell
git -C C:\laragon\www\Fashion-Shop rm -q fashionshop-web/src/components/ui/Reveal.jsx fashionshop-web/src/components/ui/FabricCanvas.jsx
cd C:\laragon\www\Fashion-Shop\fashionshop-web; npm uninstall framer-motion
git -C C:\laragon\www\Fashion-Shop grep -n "framer-motion\|FabricCanvas\|Reveal\b\|marquee" -- fashionshop-web/src fashionshop-web/package.json
```

Expected: lệnh `git grep` cuối không in kết quả nào.

- [ ] **Step 5: Lint + build**

Run: `cd C:\laragon\www\Fashion-Shop\fashionshop-web; npm run lint; if ($?) { npm run build }`
Expected: không lỗi.

- [ ] **Step 6: Chạy test Trang chủ**

Run: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/products_test.js -c codecept.e2e.conf.js --grep "Trang chủ"`
Expected: 2 scenario PASS.

- [ ] **Step 7: Xem trên trình duyệt**

Mở `http://localhost:5173/` ở 1440px và 375px. Expected:
- Hero: chữ hiện lần lượt khi tải; ảnh hero admin phủ khung đúng tiêu điểm (so với trang admin Ảnh trang chủ); nếu gỡ ảnh hero trong admin thì hiện ảnh sản phẩm + nhãn tên.
- Dải 3 cam kết có icon.
- Hai ô Nam/Nữ: ảnh admin theo `fit/pos`, chữ dưới ảnh.
- Tab đổi nhóm sản phẩm, lưới hiện dần khi cuộn tới; 2 cột ở 375px, 4 cột ở 1440px; không tràn ngang.
- DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce", tải lại: không có hiệu ứng, mọi nội dung hiện đủ.

- [ ] **Step 8: Commit**

```bash
git -C C:\laragon\www\Fashion-Shop add tests/e2e/products_test.js fashionshop-web/src/pages/Home.jsx fashionshop-web/src/index.css fashionshop-web/package.json fashionshop-web/package-lock.json
git -C C:\laragon\www\Fashion-Shop commit -m "Rebuild the home page as an editorial spread with quiet reveals" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Danh mục

**Files:**
- Modify: `tests/e2e/products_test.js` (scenario `Kiểm tra sử dụng bộ lọc sản phẩm`)
- Modify: `fashionshop-web/src/pages/Category.jsx` (thay toàn bộ)

**Interfaces:**
- Consumes: `Button`, `Container`, `EmptyState`, `LoadingSpinner` (Task 2); `ProductCard` (Task 3); `useReveal` (Task 1); `getProducts(params)`, `getCategories()` (trả `data.data: Array<{ id, ten_danh_muc }>`), `addToCart(body)`.
- Produces: không có.

- [ ] **Step 1: Sửa test theo chữ mới**

Trong `tests/e2e/products_test.js`, scenario `Kiểm tra sử dụng bộ lọc sản phẩm`, đổi `I.see('Bộ Lọc');` thành:

```js
  I.see('Bộ lọc');
```

- [ ] **Step 2: Chạy test để thấy nó fail**

Run: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/products_test.js -c codecept.e2e.conf.js --grep "bộ lọc"`
Expected: FAIL — trang cũ hiện `Bộ Lọc`.

- [ ] **Step 3: Viết lại `Category.jsx`**

```jsx
import { useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { getProducts, getCategories } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import ProductCard from "../components/ui/ProductCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import useReveal from "../hooks/useReveal";

const GENDERS = [
  { val: "", label: "Tất cả" },
  { val: "1", label: "Nam" },
  { val: "0", label: "Nữ" },
];

const TITLES = { 1: "Thời trang nam", 0: "Thời trang nữ" };

// Radio thật phủ kín nhãn nhưng trong suốt: bàn phím, trình đọc màn hình và
// test E2E (click input[name=...]) đều dùng được, còn mắt thấy chữ/chip.
const RADIO = "absolute inset-0 cursor-pointer appearance-none opacity-0";
const FOCUS_RING =
  "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ink";
const PAGE_BTN =
  "flex min-h-11 min-w-11 items-center justify-center border-b px-2 text-sm transition-colors duration-200";

export default function Category() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { count, setCount } = useCartStore();
  const gridRef = useRef(null);

  const categoryId = searchParams.get("category_id") || "";
  const gioi_tinh = searchParams.get("gioi_tinh") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ["products", "category", categoryId, gioi_tinh, page],
    queryFn: () =>
      getProducts({
        category_id: categoryId || undefined,
        gioi_tinh: gioi_tinh !== "" ? gioi_tinh : undefined,
        page,
        per_page: 12,
      }),
  });

  const { data: catsRes } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: !!productsRes,
  });

  const products = productsRes?.data?.data || [];
  const lastPage = productsRes?.data?.last_page || 1;
  const total = productsRes?.data?.total || 0;
  const categories = catsRes?.data?.data || [];
  const title = TITLES[gioi_tinh] ?? "Tất cả sản phẩm";

  useReveal(gridRef, { dependencies: [categoryId, gioi_tinh, page, isLoading] });

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val === "") next.delete(key);
    else next.set(key, val);
    next.delete("page");
    setSearchParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("category_id");
    next.delete("gioi_tinh");
    next.delete("page");
    setSearchParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    setSearchParams(next);
  };

  const handleAddToCart = async (product) => {
    if (!token) {
      toast.error("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }
    try {
      await addToCart({ product_id: product.id, quantity: 1, size: "M" });
      setCount(count + 1);
      toast.success("Đã thêm vào giỏ!");
    } catch {
      toast.error("Không thể thêm vào giỏ");
    }
  };

  return (
    <div>
      <Container className="pb-8 pt-10">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-faint">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="transition-colors duration-200 hover:text-ink">
                Trang chủ
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink-soft">
              {title}
            </li>
          </ol>
        </nav>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{title}</h1>
          {total > 0 && <p className="text-sm text-ink-soft">{total} sản phẩm</p>}
        </div>
      </Container>

      {/* ==================== Bộ lọc ==================== */}
      <div className="border-y border-line">
        <Container className="flex items-center gap-6 overflow-x-auto py-2 [scrollbar-width:none]">
          <p className="flex shrink-0 items-center gap-2 text-sm font-medium text-ink">
            <SlidersHorizontal size={15} strokeWidth={1.5} aria-hidden="true" />
            Bộ lọc
          </p>

          <fieldset className="flex shrink-0 items-center gap-5">
            <legend className="sr-only">Giới tính</legend>
            {GENDERS.map((g) => {
              const on = gioi_tinh === g.val;
              return (
                <label
                  key={g.val || "all"}
                  className={`relative flex min-h-11 cursor-pointer items-center border-b text-sm transition-colors duration-200 ${FOCUS_RING} ${
                    on ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    checked={on}
                    onChange={() => setFilter("gioi_tinh", g.val)}
                    className={RADIO}
                  />
                  {g.label}
                </label>
              );
            })}
          </fieldset>

          <span aria-hidden="true" className="h-5 w-px shrink-0 bg-line" />

          <fieldset className="flex shrink-0 items-center gap-2">
            <legend className="sr-only">Danh mục</legend>
            {[{ id: "", ten_danh_muc: "Tất cả" }, ...categories].map((c) => {
              const val = String(c.id);
              const on = categoryId === val;
              return (
                <label
                  key={val || "all"}
                  className={`relative flex min-h-11 cursor-pointer items-center border px-4 text-sm transition-colors duration-200 ${FOCUS_RING} ${
                    on
                      ? "border-ink bg-ink text-white"
                      : "border-line text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    checked={on}
                    onChange={() => setFilter("category_id", val)}
                    className={RADIO}
                  />
                  {c.ten_danh_muc}
                </label>
              );
            })}
          </fieldset>
        </Container>
      </div>

      {/* ==================== Sản phẩm ==================== */}
      <Container className="pt-10">
        <div ref={gridRef}>
          {isLoading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <EmptyState
              title="Không có sản phẩm phù hợp"
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Xoá bộ lọc
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {products.map((p) => (
                <div key={p.id} data-reveal>
                  <ProductCard product={p} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
          )}

          {!isLoading && lastPage > 1 && (
            <nav aria-label="Phân trang" className="mt-16 flex items-center justify-center gap-1">
              {page > 1 && (
                <button
                  type="button"
                  onClick={() => setPage(page - 1)}
                  className={`${PAGE_BTN} border-transparent text-ink-soft hover:text-ink`}
                >
                  Trước
                </button>
              )}
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={page === p ? "page" : undefined}
                  className={`${PAGE_BTN} ${
                    page === p ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  {p}
                </button>
              ))}
              {page < lastPage && (
                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  className={`${PAGE_BTN} border-transparent text-ink-soft hover:text-ink`}
                >
                  Tiếp
                </button>
              )}
            </nav>
          )}
        </div>
      </Container>
    </div>
  );
}
```

- [ ] **Step 4: Lint + build**

Run: `cd C:\laragon\www\Fashion-Shop\fashionshop-web; npm run lint; if ($?) { npm run build }`
Expected: không lỗi.

- [ ] **Step 5: Chạy toàn bộ `products_test.js`**

Run: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/products_test.js -c codecept.e2e.conf.js`
Expected: `Kiểm tra sử dụng bộ lọc sản phẩm`, `Trang category hiển thị danh sách sản phẩm`, `Product card có nút thêm giỏ` và 2 scenario Trang chủ PASS. Scenario nào khác fail phải trùng danh sách baseline.

- [ ] **Step 6: Xem trên trình duyệt**

Mở `http://localhost:5173/category`. Expected:
- Bấm "Nam" → URL có `gioi_tinh=1`, tiêu đề "Thời trang nam", số lượng cập nhật, bộ lọc giữ trạng thái khi tải lại trang.
- Bấm chip danh mục → URL có `category_id`, chip đổi nền `ink`.
- Chọn tổ hợp không có hàng (vd. Nữ + một danh mục chỉ có hàng nam) → "Không có sản phẩm phù hợp" + "Xoá bộ lọc"; bấm thì về tất cả. **Không còn** sản phẩm giả "Váy hoa mùa hè".
- Có nhiều trang: "Tiếp" → `page=2`.
- Tab bàn phím qua các radio: dùng phím mũi tên đổi lựa chọn, thấy viền focus.
- 375px: thanh lọc cuộn ngang, trang không tràn ngang.

- [ ] **Step 7: Commit**

```bash
git -C C:\laragon\www\Fashion-Shop add tests/e2e/products_test.js fashionshop-web/src/pages/Category.jsx
git -C C:\laragon\www\Fashion-Shop commit -m "Rebuild the category page with an inline filter bar and a real empty state" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Chi tiết sản phẩm

**Files:**
- Modify: `tests/e2e/cart_test.js` (scenario `Thêm sản phẩm vào giỏ từ trang chi tiết`)
- Modify: `fashionshop-web/src/pages/ProductDetail.jsx` (thay toàn bộ)
- Delete: `fashionshop-web/src/components/ui/SaleBadge.jsx`

**Interfaces:**
- Consumes: `Button`, `Container`, `EmptyState`, `Field`, `INPUT_CLASS`, `LoadingSpinner`, `Price`, `StarRating` (Task 2); `useReveal`, `PROMISES` (Task 1); `SIZES`, `GENDER_MAP` từ `src/utils/constants.js`; `getProduct(id)` (trả `data` là sản phẩm), `getProductReviews(id)` (trả `data` là mảng), `addToCart(body)`, `postReview(id, form)`.
- Produces: không có.

- [ ] **Step 1: Sửa test theo chữ nút mới**

Trong `tests/e2e/cart_test.js`, scenario `Thêm sản phẩm vào giỏ từ trang chi tiết`, đổi hai dòng:

```js
  await I.waitForText('Thêm Vào Giỏ', 8);
  I.click(locate('button').withText('Thêm Vào Giỏ').first());
```

thành:

```js
  await I.waitForText('Thêm vào giỏ', 8);
  I.click(locate('button').withText('Thêm vào giỏ').first());
```

- [ ] **Step 2: Chạy test để thấy nó fail**

Run: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/cart_test.js -c codecept.e2e.conf.js --grep "trang chi tiết"`
Expected: FAIL — nút trang cũ là `Thêm Vào Giỏ`.

- [ ] **Step 3: Viết lại `ProductDetail.jsx`**

```jsx
import { useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { getProduct, getProductReviews } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import { postReview } from "../api/reviewApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import { SIZES, GENDER_MAP } from "../utils/constants";
import { imageUrl } from "../utils/imageUrl";
import { PROMISES } from "../utils/promises";
import useReveal from "../hooks/useReveal";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import Field from "../components/ui/Field";
import { INPUT_CLASS } from "../components/ui/fieldStyles";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Price from "../components/ui/Price";
import StarRating from "../components/ui/StarRating";

// API chặn mỗi lần thêm giỏ tối đa 50 sản phẩm, xem CartController.
const MAX_PER_ADD = 50;

const PLACEHOLDER = "https://placehold.co/800x1000/ece6db/6b645a?text=Chưa+có+ảnh";

const QTY_BTN =
  "flex h-12 w-11 items-center justify-center text-ink transition-colors duration-200 hover:bg-tile disabled:cursor-not-allowed disabled:opacity-40";

const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5, "Nhận xét ít nhất 5 ký tự"),
});

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { count, setCount } = useCartStore();
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const infoRef = useRef(null);

  const { data: productRes, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    retry: false,
  });

  // Tải đánh giá ngay, không chờ
  const { data: reviewsRes, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getProductReviews(id),
    enabled: Boolean(id),
    retry: false,
  });

  // Product detail trả về trực tiếp (không wrap)
  const product = productRes?.data;
  // Reviews: direct array
  const reviews = reviewsRes?.data || [];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5 },
  });

  useReveal(infoRef, { onLoad: true, dependencies: [Boolean(product)] });

  const handleAddToCart = async (goCheckout = false) => {
    if (!token) {
      toast.error("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }
    try {
      await addToCart({ product_id: product.id, quantity: qty, size });
      setCount(count + qty);
      if (goCheckout) navigate("/checkout");
      else toast.success("Đã thêm vào giỏ hàng!");
    } catch {
      toast.error("Không thể thêm vào giỏ");
    }
  };

  const onReviewSubmit = async (form) => {
    setReviewLoading(true);
    try {
      await postReview(id, form);
      toast.success("Đã gửi đánh giá!");
      reset();
      setShowReviewForm(false);
      refetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setReviewLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!product) {
    return (
      <Container>
        <EmptyState
          title="Không tìm thấy sản phẩm"
          action={<Button to="/category" variant="secondary">Xem sản phẩm khác</Button>}
        />
      </Container>
    );
  }

  const imgSrc = product.hinh_anh ? imageUrl(product.hinh_anh) : PLACEHOLDER;
  const gender = GENDER_MAP[product.gioi_tinh];
  const maxQty = Math.min(product.so_luong, MAX_PER_ADD);

  return (
    <div>
      <Container className="py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="aspect-[4/5] bg-tile">
            <img
              src={imgSrc}
              alt={product.ten_sp}
              fetchPriority="high"
              className="h-full w-full object-contain p-8 sm:p-12"
            />
          </div>

          <div ref={infoRef} className="lg:sticky lg:top-28 lg:self-start">
            <nav data-reveal aria-label="Breadcrumb" className="text-sm text-ink-faint">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link to="/" className="transition-colors duration-200 hover:text-ink">Trang chủ</Link>
                </li>
                {gender && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li>
                      <Link
                        to={`/category?gioi_tinh=${product.gioi_tinh}`}
                        className="transition-colors duration-200 hover:text-ink"
                      >
                        {gender}
                      </Link>
                    </li>
                  </>
                )}
                {product.category?.ten_danh_muc && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li>{product.category.ten_danh_muc}</li>
                  </>
                )}
              </ol>
            </nav>

            <h1 data-reveal className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {product.ten_sp}
            </h1>

            {avgRating > 0 && (
              <div data-reveal className="mt-4 flex items-center gap-2">
                <StarRating rating={avgRating} size={14} />
                <a href="#danh-gia" className="text-sm text-ink-soft underline-offset-4 hover:underline">
                  {reviews.length} đánh giá
                </a>
              </div>
            )}

            <div data-reveal className="mt-6">
              <Price gia={product.gia} gia_cu={product.gia_cu} size="lg" />
            </div>

            {product.mo_ta && (
              <p data-reveal className="mt-6 max-w-prose text-base leading-relaxed text-ink-soft">
                {product.mo_ta}
              </p>
            )}

            <div data-reveal className="mt-8">
              <div className="flex items-baseline justify-between">
                <p id="size-label" className="text-sm font-medium text-ink">Kích cỡ</p>
                <p className="text-sm text-ink-faint">Còn {product.so_luong} sản phẩm</p>
              </div>
              <div role="group" aria-labelledby="size-label" className="mt-3 flex gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`flex h-12 w-12 items-center justify-center border text-sm font-medium transition-colors duration-200 ${
                      size === s ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div data-reveal className="mt-8 flex gap-3">
              <div className="flex items-center border border-line">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Giảm số lượng"
                  className={QTY_BTN}
                >
                  <Minus size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <span aria-live="polite" className="w-10 text-center text-sm tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  aria-label="Tăng số lượng"
                  className={QTY_BTN}
                >
                  <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
              <Button size="lg" className="flex-1" onClick={() => handleAddToCart(false)}>
                Thêm vào giỏ
              </Button>
            </div>

            <Button
              data-reveal
              variant="secondary"
              size="lg"
              className="mt-3 w-full"
              onClick={() => handleAddToCart(true)}
            >
              Mua ngay
            </Button>

            <ul data-reveal className="mt-10 flex flex-col gap-3 border-t border-line pt-6">
              {PROMISES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-ink-soft">
                  <Icon size={17} strokeWidth={1.5} className="shrink-0 text-ink" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ==================== Đánh giá ==================== */}
      <section id="danh-gia" className="border-t border-line">
        <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <h2 className="font-display text-3xl text-ink">Đánh giá</h2>
            {reviews.length > 0 && (
              <p className="mt-4 text-4xl tabular-nums text-ink">
                {avgRating.toFixed(1)}
                <span className="text-base text-ink-faint"> / 5</span>
              </p>
            )}
            <p className="mt-1 text-sm text-ink-soft">{reviews.length} đánh giá</p>

            {token && (
              <Button
                variant="secondary"
                className="mt-6"
                onClick={() => setShowReviewForm((o) => !o)}
                aria-expanded={showReviewForm}
                aria-controls="form-danh-gia"
              >
                {showReviewForm ? "Đóng" : "Viết đánh giá"}
              </Button>
            )}

            {token && showReviewForm && (
              <form
                id="form-danh-gia"
                onSubmit={handleSubmit(onReviewSubmit)}
                noValidate
                className="mt-6 flex flex-col gap-5"
              >
                <Field label="Số sao">
                  <select {...register("rating")} className={INPUT_CLASS}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} sao</option>
                    ))}
                  </select>
                </Field>
                <Field label="Nhận xét" error={errors.comment?.message}>
                  <textarea
                    {...register("comment")}
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn"
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </Field>
                <Button type="submit" loading={reviewLoading}>
                  Gửi đánh giá
                </Button>
              </form>
            )}
          </div>

          <div>
            {reviews.length === 0 ? (
              <p className="text-ink-faint">Chưa có đánh giá nào</p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {reviews.map((r) => (
                  <li key={r.id} className="py-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-medium text-ink">{r.user?.fullname || "Ẩn danh"}</span>
                      <StarRating rating={r.rating} size={12} />
                      <span className="text-sm text-ink-faint">
                        {new Date(r.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className="mt-2 text-base leading-relaxed text-ink-soft">{r.comment}</p>
                    {r.shop_reply && (
                      <div className="mt-4 border-l-2 border-accent pl-4">
                        <p className="text-sm font-medium text-ink">Phản hồi từ shop</p>
                        <p className="mt-1 text-sm text-ink-soft">{r.shop_reply}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Xoá `SaleBadge.jsx`**

Run:

```powershell
git -C C:\laragon\www\Fashion-Shop rm -q fashionshop-web/src/components/ui/SaleBadge.jsx
git -C C:\laragon\www\Fashion-Shop grep -n "SaleBadge\|reviewsReady" -- fashionshop-web/src
```

Expected: `git grep` không in kết quả.

- [ ] **Step 5: Lint + build**

Run: `cd C:\laragon\www\Fashion-Shop\fashionshop-web; npm run lint; if ($?) { npm run build }`
Expected: không lỗi.

- [ ] **Step 6: Chạy test để thấy pass**

Run: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/cart_test.js -c codecept.e2e.conf.js --grep "trang chi tiết"`
Expected: PASS (bấm nút, thấy toast "Đã thêm vào giỏ hàng!").

- [ ] **Step 7: Xem trên trình duyệt**

Mở một sản phẩm có giảm giá và có đánh giá. Expected:
- Tên serif, giá lớn + giá gốc gạch ngang + "−N%".
- Đánh giá hiện ngay khi tải trang (không chờ 4 giây — xem tab Network: request `/reviews` bắt đầu cùng lúc request sản phẩm).
- Chọn size đổi nền; `−` bị mờ ở 1, `+` bị mờ ở tồn kho hoặc 50.
- "Thêm vào giỏ" → toast + số trên Header tăng đúng số lượng; "Mua ngay" → `/checkout`.
- Cuộn trang desktop: cột thông tin dính theo.
- Đã đăng nhập: "Viết đánh giá" mở form; gửi nhận xét 3 ký tự → lỗi "Nhận xét ít nhất 5 ký tự" dưới ô; gửi hợp lệ → form đóng, danh sách cập nhật.
- `/products/999999` → "Không tìm thấy sản phẩm" + nút "Xem sản phẩm khác".
- 375px: ảnh trên, thông tin dưới, không tràn ngang.

- [ ] **Step 8: Commit**

```bash
git -C C:\laragon\www\Fashion-Shop add tests/e2e/cart_test.js fashionshop-web/src/pages/ProductDetail.jsx
git -C C:\laragon\www\Fashion-Shop commit -m "Rebuild the product page and load its reviews straight away" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

(`SaleBadge.jsx` đã được stage bởi `git rm` ở Step 4.)

---

### Task 8: Kiểm chứng cuối đợt 1

**Files:**
- Không sửa file dự án. Ảnh chụp lưu ở thư mục tạm ngoài repo.

**Interfaces:**
- Consumes: toàn bộ Task 1–7; API ở `http://127.0.0.1:8000`, web ở `http://localhost:5173`.

- [ ] **Step 1: Quét phần sót**

Run: `git -C C:\laragon\www\Fashion-Shop grep -n "framer-motion\|FabricCanvas\|Reveal\b\|SaleBadge\|MOCK_PRODUCTS\|reviewsReady\|marquee\|Be Vietnam" -- fashionshop-web/src fashionshop-web/index.html fashionshop-web/package.json`
Expected: không có kết quả.

- [ ] **Step 2: Lint + build lần cuối**

Run: `cd C:\laragon\www\Fashion-Shop\fashionshop-web; npm run lint; if ($?) { npm run build }`
Expected: không lỗi.

- [ ] **Step 3: Chụp ảnh 3 trang ở 3 kích thước và kiểm tra tràn ngang**

Tạo file tạm `C:\Users\tridi\AppData\Local\Temp\fashionshop-shots\shoot.cjs` (ngoài repo):

```js
// Chạy từ thư mục tests để dùng playwright đã cài sẵn ở đó
const { chromium } = require("C:/laragon/www/Fashion-Shop/tests/node_modules/playwright");

const OUT = "C:/Users/tridi/AppData/Local/Temp/fashionshop-shots";
const PAGES = [
  ["home", "http://localhost:5173/"],
  ["category", "http://localhost:5173/category"],
  ["detail", "http://localhost:5173/products/1"],
];
const WIDTHS = [375, 768, 1440];

(async () => {
  const browser = await chromium.launch();
  for (const reduced of [false, true]) {
    for (const w of WIDTHS) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: 900 },
        reducedMotion: reduced ? "reduce" : "no-preference",
      });
      const page = await ctx.newPage();
      for (const [name, url] of PAGES) {
        await page.goto(url, { waitUntil: "networkidle" });
        // Cuộn hết trang để kích hoạt các hiệu ứng cuộn, rồi chờ chúng xong
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 400) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(800);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        const hidden = await page.evaluate(
          () => [...document.querySelectorAll("[data-reveal]")].filter(
            (el) => Number(getComputedStyle(el).opacity) < 0.99
          ).length
        );
        const tag = `${name}-${w}${reduced ? "-reduced" : ""}`;
        await page.screenshot({ path: `${OUT}/${tag}.png`, fullPage: true });
        console.log(`${tag}: tràn ngang ${overflow}px, phần tử còn mờ ${hidden}`);
      }
      await ctx.close();
    }
  }
  await browser.close();
})();
```

Run: `New-Item -ItemType Directory -Force C:\Users\tridi\AppData\Local\Temp\fashionshop-shots | Out-Null; node C:\Users\tridi\AppData\Local\Temp\fashionshop-shots\shoot.cjs`
Expected: 18 dòng, mọi dòng `tràn ngang 0px, phần tử còn mờ 0`.

- [ ] **Step 4: Tự xem lại ảnh chụp**

Mở từng ảnh `*-375.png`, `*-768.png`, `*-1440.png` (công cụ Read xem được ảnh). Kiểm tra: không chữ đè ảnh, không nút bị cắt, ảnh admin hero/nam/nữ đúng khung, lưới đúng số cột (2 / 3 hoặc 2 / 4), chữ tiếng Việt có dấu đầy đủ ở tiêu đề serif. Ghi lại vấn đề nếu có và sửa trong task tương ứng trước khi đi tiếp.

- [ ] **Step 5: Kiểm tra bàn phím**

Trên `http://localhost:5173/` (1440px), bấm Tab từ đầu trang: menu → logo → ô tìm kiếm → tài khoản → giỏ → nút "Mua sắm ngay" → ô Nam/Nữ → tab sản phẩm → tên SP → nút thêm giỏ. Expected: mọi điểm dừng có viền focus nhìn thấy; nút thêm giỏ hiện ra khi được focus. Lặp lại trên `/category` (radio đổi bằng mũi tên) và `/products/1` (size, `−`/`+`, hai nút).

- [ ] **Step 6: Chạy 2 file test E2E**

Run: `cd C:\laragon\www\Fashion-Shop\tests; $env:HEADLESS='true'; npx codeceptjs run e2e/products_test.js -c codecept.e2e.conf.js; npx codeceptjs run e2e/cart_test.js -c codecept.e2e.conf.js`
Expected: mọi scenario thuộc Trang chủ, Danh mục, thẻ SP, trang chi tiết PASS. Scenario fail nào khác phải có trong danh sách baseline của Task 1 Step 1 và thuộc trang đợt 2–3 (vd. `Giỏ Hàng`, `img.object-cover` ở trang giỏ).

- [ ] **Step 7: Báo cáo**

Tổng hợp cho người dùng: danh sách commit, kết quả lint/build, 18 dòng đo tràn ngang/phần tử mờ, kết quả E2E so với baseline, các vấn đề đã thấy trong ảnh chụp. Không push; hỏi người dùng trước khi push (push sẽ làm Render deploy web).
