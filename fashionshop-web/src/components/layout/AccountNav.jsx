import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/profile", label: "Hồ sơ" },
  { to: "/address", label: "Địa chỉ" },
  { to: "/orders", label: "Đơn hàng" },
];

/** Tab điều hướng giữa các trang tài khoản */
export default function AccountNav() {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Tài khoản" className="mb-10 flex gap-6 overflow-x-auto border-b border-line">
      {LINKS.map((l) => {
        const on = pathname === l.to;
        return (
          <Link
            key={l.to}
            to={l.to}
            aria-current={on ? "page" : undefined}
            className={`-mb-px flex min-h-11 shrink-0 items-center border-b text-sm transition-colors duration-200 ${
              on ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
