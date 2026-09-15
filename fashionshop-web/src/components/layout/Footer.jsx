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
