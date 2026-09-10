import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown, ArrowUpRight, Truck, Headphones, ShieldCheck, RotateCcw } from "lucide-react";
import { getProducts } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import ProductCard from "../components/ui/ProductCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import FabricCanvas from "../components/ui/FabricCanvas";
import Reveal from "../components/ui/Reveal";
import toast from "react-hot-toast";

const IMG_BASE = `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/storage/`;

const TABS = [
  { key: "featured", label: "Nổi bật" },
  { key: "bestseller", label: "Bán chạy" },
  { key: "sale", label: "Khuyến mãi" },
];

const SERVICES = [
  { icon: Truck, title: "Miễn phí giao hàng", desc: "Đơn từ 500.000đ" },
  { icon: RotateCcw, title: "Hoàn trả 7 ngày", desc: "Không cần lý do" },
  { icon: ShieldCheck, title: "Hàng chính hãng", desc: "Cam kết chất lượng" },
  { icon: Headphones, title: "Hỗ trợ 24/7", desc: "Tư vấn mọi lúc" },
];

const COLLECTIONS = [
  {
    to: "/category?gioi_tinh=1",
    index: "01",
    title: "Nam",
    desc: "Quần tây, jean, kaki, polo, sơ mi",
  },
  {
    to: "/category?gioi_tinh=0",
    index: "02",
    title: "Nữ",
    desc: "Quần suông, kaki, short, áo",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
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

  // Dải ảnh chạy ngang cần đủ dài để nối vòng không thấy điểm nối
  const marquee = products.filter((p) => p.hinh_anh).slice(0, 6);

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
      {/* ==================== Hero ==================== */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden border-b border-line">
        {/* Nền vải chuyển động */}
        <div className="absolute inset-0">
          <FabricCanvas />
        </div>
        {/* Lớp tối để chữ luôn tương phản đủ, bất kể shader sáng tới đâu */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink" />

        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
          className="relative mx-auto w-full max-w-7xl px-6 py-28 lg:px-10"
        >
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow mb-8"
          >
            Bộ sưu tập 2026
          </motion.p>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 max-w-5xl text-5xl leading-[0.98] sm:text-6xl md:text-7xl lg:text-[5.75rem]"
          >
            Chất liệu kể
            <br />
            <span className="italic text-accent">câu chuyện</span> của bạn
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12 max-w-md text-sm leading-relaxed text-neutral-400 md:text-base"
          >
            Thời trang nam và nữ được tuyển chọn theo phom dáng và chất vải.
            Giao nhanh toàn quốc, đổi trả trong 7 ngày.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              to="/category"
              className="group inline-flex items-center gap-3 bg-neutral-50 px-8 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-colors duration-300 hover:bg-accent hover:text-white"
            >
              Xem bộ sưu tập
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              to="/category?gioi_tinh=1"
              className="hover-line inline-flex items-center border border-line-strong px-8 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-300 transition-colors duration-300 hover:text-white"
            >
              Hàng nam
            </Link>
          </motion.div>
        </motion.div>

        {/* Gợi ý cuộn xuống */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={18} className="text-neutral-600" />
          </motion.div>
        </motion.div>
      </section>

      {/* ==================== Dải ảnh chạy ngang ==================== */}
      {marquee.length > 0 && (
        <section className="overflow-hidden border-b border-line py-6">
          <div className="marquee-track gap-6">
            {[...marquee, ...marquee].map((p, i) => (
              <Link
                key={`${p.id}-${i}`}
                to={`/products/${p.id}`}
                className="group relative h-40 w-32 shrink-0 overflow-hidden bg-ink-1 md:h-52 md:w-40"
                aria-hidden={i >= marquee.length}
                tabIndex={i >= marquee.length ? -1 : 0}
              >
                <img
                  src={`${IMG_BASE}${p.hinh_anh}`}
                  alt={p.ten_sp}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-60 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ==================== Cam kết ==================== */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ icon: Icon, title, desc }, i) => (
            <Reveal
              key={title}
              delay={i * 0.07}
              className={`border-line px-6 py-10 lg:px-10 ${
                i % 2 === 1 ? "" : "border-r"
              } ${i < 2 ? "border-b lg:border-b-0" : ""} ${
                i === 1 ? "lg:border-r" : ""
              } ${i === 2 ? "border-r" : ""}`}
            >
              <Icon size={20} className="mb-5 text-accent" strokeWidth={1.5} />
              <p className="mb-1.5 text-sm font-medium text-neutral-100">{title}</p>
              <p className="text-xs text-neutral-500">{desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ==================== Bộ sưu tập ==================== */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
        <Reveal className="mb-14">
          <p className="eyebrow mb-5">Bộ sưu tập</p>
          <h2 className="text-4xl md:text-5xl">Chọn theo phong cách</h2>
        </Reveal>

        <div className="grid gap-px bg-line md:grid-cols-2">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.to} delay={i * 0.12}>
              <Link
                to={c.to}
                className="group relative flex h-72 flex-col justify-between bg-ink p-10 transition-colors duration-300 hover:bg-ink-1"
              >
                <div className="flex items-start justify-between">
                  <span className="eyebrow">{c.index}</span>
                  <ArrowUpRight
                    size={24}
                    strokeWidth={1.2}
                    className="text-neutral-700 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
                  />
                </div>
                <div>
                  <h3 className="mb-3 text-5xl transition-colors duration-300 group-hover:text-accent">
                    {c.title}
                  </h3>
                  <p className="text-sm text-neutral-500">{c.desc}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ==================== Sản phẩm ==================== */}
      <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-10">
        <Reveal className="mb-12 flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-5">Sản phẩm</p>
            <h2 className="text-4xl md:text-5xl">Đang được chú ý</h2>
          </div>

          <div className="flex gap-8">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`link-underline pb-1 text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${
                  tab === t.key
                    ? "text-accent"
                    : "text-neutral-500 hover:text-neutral-200"
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
          <p className="py-24 text-center text-sm text-neutral-600">
            Không có sản phẩm nào
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
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
