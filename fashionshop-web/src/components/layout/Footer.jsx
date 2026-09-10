import { Link } from "react-router-dom";

const LINKS = [
  { label: "Trang Chủ", to: "/" },
  { label: "Thời Trang Nam", to: "/category?gioi_tinh=1" },
  { label: "Thời Trang Nữ", to: "/category?gioi_tinh=0" },
  { label: "Liên Hệ", to: "/contact" },
];

const POLICIES = [
  "Miễn phí vận chuyển đơn từ 500.000đ",
  "Đổi trả trong 7 ngày",
  "Hỗ trợ 24/7",
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-900 bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-[15px] font-bold tracking-tight text-white">
              FASHION<span className="text-zinc-500">SHOP</span>
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
            Thời trang nam &amp; nữ chọn lọc. Chất liệu tốt, phom dáng chuẩn,
            giá minh bạch.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">
            Khám phá
          </h4>
          <ul className="space-y-3">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-zinc-400 transition-colors duration-300 hover:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">
            Chính sách
          </h4>
          <ul className="space-y-3">
            {POLICIES.map((p) => (
              <li key={p} className="text-sm text-zinc-400">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-zinc-600 sm:px-6">
          © {new Date().getFullYear()} FashionShop. Đồ án môn học.
        </div>
      </div>
    </footer>
  );
}
