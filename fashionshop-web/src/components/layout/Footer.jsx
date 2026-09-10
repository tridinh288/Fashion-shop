import { Link } from "react-router-dom";

const LINKS = [
  { label: "Trang chủ", to: "/" },
  { label: "Thời trang nam", to: "/category?gioi_tinh=1" },
  { label: "Thời trang nữ", to: "/category?gioi_tinh=0" },
  { label: "Liên hệ", to: "/contact" },
];

const POLICIES = [
  "Miễn phí vận chuyển đơn từ 500.000đ",
  "Đổi trả trong 7 ngày",
  "Thanh toán khi nhận hàng",
  "Hỗ trợ 24/7",
];

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-14 py-20 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="mb-5 font-display text-3xl text-white">
              Fashion<span className="text-accent">Shop</span>
            </p>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
              Thời trang nam và nữ được tuyển chọn theo phom dáng và chất vải.
              Giá minh bạch, không phụ phí ẩn.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow mb-6">Khám phá</p>
            <ul className="flex flex-col gap-4">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="link-underline text-sm text-neutral-400 transition-colors duration-300 hover:text-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="eyebrow mb-6">Chính sách</p>
            <ul className="flex flex-col gap-4">
              {POLICIES.map((p) => (
                <li key={p} className="text-sm text-neutral-400">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-8 text-xs text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} FashionShop</span>
          <span>Đồ án môn học · Laravel 11 &amp; React 19</span>
        </div>
      </div>
    </footer>
  );
}
