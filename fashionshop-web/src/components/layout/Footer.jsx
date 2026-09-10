import { Link } from "react-router-dom";
import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";

const SERVICES = [
  { icon: Truck, title: "Miễn phí giao hàng", desc: "Đơn từ 500.000đ" },
  { icon: RotateCcw, title: "Hoàn trả 7 ngày", desc: "Không cần lý do" },
  { icon: ShieldCheck, title: "Hàng chính hãng", desc: "Cam kết chất lượng" },
  { icon: Headphones, title: "Hỗ trợ 24/7", desc: "Tư vấn mọi lúc" },
];

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
];

export default function Footer() {
  return (
    <footer className="mt-20">
      {/* Cam kết dịch vụ, đặt ngay trên chân trang */}
      <div className="border-y border-line bg-tile-warm">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {SERVICES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3.5">
              <Icon size={20} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink" />
              <div>
                <p className="text-[13.5px] font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
        <div className="grid gap-10 py-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="mb-3 text-lg font-bold tracking-tight text-ink">
              FASHION<span className="font-light">SHOP</span>
            </p>
            <p className="max-w-xs text-[13.5px] leading-relaxed text-ink-soft">
              Thời trang nam và nữ được tuyển chọn theo phom dáng và chất vải.
              Giá minh bạch, không phụ phí ẩn.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Khám phá</p>
            <ul className="flex flex-col gap-3">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="link-underline text-[13.5px] text-ink-soft transition-colors duration-300 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="eyebrow mb-4">Chính sách</p>
            <ul className="flex flex-col gap-3">
              {POLICIES.map((p) => (
                <li key={p} className="text-[13.5px] text-ink-soft">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-line py-7 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} FashionShop</span>
          <span>Đồ án môn học · Laravel 11 &amp; React 19</span>
        </div>
      </div>
    </footer>
  );
}
