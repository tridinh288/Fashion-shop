import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, RotateCcw, Headphones, ArrowRight, ArrowUpRight } from "lucide-react";
import { getProducts } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import ProductCard from "../components/ui/ProductCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Reveal from "../components/ui/Reveal";
import toast from "react-hot-toast";

const TABS = [
  { key: "featured", label: "Nổi Bật" },
  { key: "bestseller", label: "Bán Chạy" },
  { key: "sale", label: "Khuyến Mãi" },
];

const SERVICES = [
  { icon: Truck, title: "Miễn phí giao hàng", desc: "Đơn từ 500.000đ" },
  { icon: Headphones, title: "Hỗ trợ 24/7", desc: "Tư vấn mọi lúc" },
  { icon: ShieldCheck, title: "Bảo hành chính hãng", desc: "Cam kết chất lượng" },
  { icon: RotateCcw, title: "Hoàn trả dễ dàng", desc: "Trong vòng 7 ngày" },
];

const COLLECTIONS = [
  {
    to: "/category?gioi_tinh=1",
    title: "Thời Trang Nam",
    desc: "Quần tây, jean, polo, sơ mi",
    count: "4 danh mục",
  },
  {
    to: "/category?gioi_tinh=0",
    title: "Thời Trang Nữ",
    desc: "Quần suông, kaki, short, áo",
    count: "4 danh mục",
  },
];

// Hiệu ứng vào của khối hero: các phần tử nối tiếp nhau
const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const [tab, setTab] = useState("featured");
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { count, setCount } = useCartStore();

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ["products", tab],
    queryFn: () => getProducts({ tab, per_page: 8 }),
  });

  const products = productsRes?.data?.data || [];

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

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden border-b border-zinc-900">
        <div className="hero-glow" />
        <div className="absolute inset-0 grid-pattern" />

        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.09 }}
          className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-28 text-center sm:px-6 md:py-36"
        >
          <motion.div
            variants={heroItem}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Bộ sưu tập mới đã có mặt
          </motion.div>

          <motion.h1
            variants={heroItem}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white md:text-7xl"
          >
            Thời trang hiện đại,
            <br />
            <span className="text-zinc-500">phong cách của bạn.</span>
          </motion.h1>

          <motion.p
            variants={heroItem}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg"
          >
            Chất liệu tốt, phom dáng chuẩn, giá minh bạch. Tuyển chọn cho cả nam
            và nữ — giao nhanh, đổi trả trong 7 ngày.
          </motion.p>

          <motion.div
            variants={heroItem}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/category"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:bg-accent hover:text-white"
            >
              Khám phá ngay
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              to="/category?gioi_tinh=1"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-800 px-7 py-3.5 text-sm font-semibold text-zinc-300 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
            >
              Xem hàng nam
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------------- Cam kết dịch vụ ---------------- */}
      <section className="border-b border-zinc-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-zinc-900 sm:px-6 md:grid-cols-4">
          {SERVICES.map(({ icon: Icon, title, desc }, i) => (
            <Reveal
              key={title}
              delay={i * 0.06}
              className="flex items-center gap-3 bg-zinc-950 px-4 py-6"
            >
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5">
                <Icon size={18} className="text-accent" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-100">{title}</p>
                <p className="truncate text-xs text-zinc-500">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Bộ sưu tập theo giới tính ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Bộ sưu tập
          </p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Chọn theo phong cách
          </h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.to} delay={i * 0.1}>
              <Link
                to={c.to}
                className="group glow-border relative flex h-56 flex-col justify-end overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8"
              >
                <span className="absolute right-7 top-7 text-zinc-600 transition-all duration-300 group-hover:text-accent">
                  <ArrowUpRight
                    size={22}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">
                  {c.count}
                </p>
                <h3 className="mb-1.5 text-2xl font-bold text-white">{c.title}</h3>
                <p className="text-sm text-zinc-500">{c.desc}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Danh sách sản phẩm ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Reveal className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Sản phẩm
            </p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Đang được chú ý</h2>
          </div>

          <div className="flex gap-1 self-start rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 sm:self-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  tab === t.key
                    ? "bg-zinc-100 text-zinc-950"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>

        {isLoading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <p className="py-20 text-center text-sm text-zinc-600">Không có sản phẩm nào</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 7) * 0.05}>
                <ProductCard product={p} onAddToCart={handleAddToCart} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
