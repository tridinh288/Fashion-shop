import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getProducts } from "../api/productApi";
import { getHomeCovers } from "../api/homeApi";
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

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
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
  const marquee = withImg.slice(0, 6);

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

  // Ảnh quản trị viên đặt là ảnh bìa cắt sẵn nên phủ kín khung; ảnh sản phẩm
  // tách nền thì giữ nguyên tỉ lệ, tránh cắt cụt món đồ.
  const isAdminCover = (gioiTinh) => Boolean(adminCover(gioiTinh === 1 ? "nam" : "nu"));

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
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] gap-0 px-5 lg:grid-cols-2 lg:px-8">
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.09 }}
            className="flex flex-col justify-center py-16 lg:py-24 lg:pr-14"
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="eyebrow mb-5"
            >
              Bộ sưu tập 2026
            </motion.p>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl lg:text-[3.4rem]"
            >
              Mặc đẹp mỗi ngày,
              <br />
              không cần cố gắng
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-9 max-w-md text-[15px] leading-relaxed text-ink-soft"
            >
              Quần áo nam và nữ được chọn theo phom dáng và chất vải. Giao nhanh
              toàn quốc, đổi trả trong 7 ngày, thanh toán khi nhận hàng.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-3"
            >
              <Link
                to="/category"
                className="group inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-[13px] font-semibold text-white transition-opacity duration-300 hover:opacity-85"
              >
                Mua sắm ngay
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/category?gioi_tinh=1"
                className="inline-flex items-center rounded-full border border-ink/15 px-7 py-3.5 text-[13px] font-semibold text-ink transition-colors duration-300 hover:border-ink hover:bg-tile"
              >
                Hàng nam
              </Link>
            </motion.div>
          </motion.div>

          {/* Ảnh sản phẩm nổi bật đặt trên nền vải chuyển động */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-[340px] overflow-hidden lg:min-h-[560px]"
          >
            <div className="absolute inset-0">
              <FabricCanvas />
            </div>

            {/* Ảnh quản trị viên đặt là ảnh quảng bá tự do nên phủ kín khung và
                dẫn tới trang danh mục; nếu chưa đặt thì lấy một sản phẩm đang
                bán, giữ nguyên tỉ lệ kèm nhãn tên và dẫn thẳng tới sản phẩm. */}
            {adminCover("hero") ? (
              <Link to="/category" className="group relative block h-full overflow-hidden">
                <img
                  src={`${IMG_BASE}${adminCover("hero").path}`}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  style={{
                    objectFit: adminCover("hero").fit,
                    objectPosition: adminCover("hero").pos,
                  }}
                />
              </Link>
            ) : (
              heroProduct && (
                <Link
                  to={`/products/${heroProduct.id}`}
                  className="group relative flex h-full items-center justify-center p-10"
                >
                  <img
                    src={`${IMG_BASE}${heroProduct.hinh_anh}`}
                    alt={heroProduct.ten_sp}
                    className="max-h-[85%] w-auto object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.16)] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute bottom-7 left-7 rounded-full bg-paper/85 px-4 py-2 text-[12px] font-medium text-ink backdrop-blur-sm">
                    {heroProduct.ten_sp}
                  </span>
                </Link>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* ==================== Dải ảnh chạy ngang ==================== */}
      {marquee.length > 0 && (
        <section className="overflow-hidden border-b border-line bg-tile-warm py-5">
          <div className="marquee-track gap-5">
            {[...marquee, ...marquee].map((p, i) => (
              <Link
                key={`${p.id}-${i}`}
                to={`/products/${p.id}`}
                className="group h-28 w-24 shrink-0 overflow-hidden bg-paper md:h-36 md:w-28"
                aria-hidden={i >= marquee.length}
                tabIndex={i >= marquee.length ? -1 : 0}
              >
                <img
                  src={`${IMG_BASE}${p.hinh_anh}`}
                  alt={p.ten_sp}
                  loading="lazy"
                  className="h-full w-full object-contain p-2.5 transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ==================== Bộ sưu tập ==================== */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
        <Reveal className="mb-8">
          <p className="eyebrow mb-3">Danh mục</p>
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">Mua theo phong cách</h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.to} delay={i * 0.1}>
              <Link
                to={c.to}
                className="group relative flex h-64 items-center overflow-hidden bg-tile sm:h-72"
              >
                {covers[c.gioiTinh] && (
                  <img
                    src={`${IMG_BASE}${covers[c.gioiTinh]}`}
                    alt=""
                    aria-hidden="true"
                    className={
                      isAdminCover(c.gioiTinh)
                        ? "absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                        : "absolute right-4 top-1/2 h-[92%] w-1/2 -translate-y-1/2 object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                    }
                    style={
                      isAdminCover(c.gioiTinh)
                        ? {
                            objectFit: adminCover(c.gioiTinh === 1 ? "nam" : "nu").fit,
                            objectPosition: adminCover(c.gioiTinh === 1 ? "nam" : "nu").pos,
                          }
                        : undefined
                    }
                  />
                )}

                {/* Chỉ cần lớp phủ khi nền là ảnh bìa phủ kín khung */}
                {isAdminCover(c.gioiTinh) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
                )}

                <div className="relative z-10 max-w-[55%] p-8 sm:p-10">
                  <h3
                    className={`mb-2 text-2xl font-semibold sm:text-[28px] ${
                      isAdminCover(c.gioiTinh) ? "text-white" : "text-ink"
                    }`}
                  >
                    {c.title}
                  </h3>
                  <p
                    className={`mb-5 text-[13px] ${
                      isAdminCover(c.gioiTinh) ? "text-white/80" : "text-ink-soft"
                    }`}
                  >
                    {c.desc}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold ${
                      isAdminCover(c.gioiTinh) ? "text-white" : "text-ink"
                    }`}
                  >
                    Xem tất cả
                    <ArrowUpRight
                      size={15}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ==================== Sản phẩm ==================== */}
      <section className="mx-auto max-w-[1400px] px-5 pb-8 lg:px-8">
        <Reveal className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">Sản phẩm</p>
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">Đang được chú ý</h2>
          </div>

          <div className="flex gap-1 self-start rounded-full bg-tile p-1 sm:self-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-5 py-2 text-[12.5px] font-semibold transition-all duration-300 ${
                  tab === t.key ? "bg-paper text-ink shadow-sm" : "text-ink-soft hover:text-ink"
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
          <p className="py-24 text-center text-sm text-ink-faint">Không có sản phẩm nào</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-x-5">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 7) * 0.05}>
                <ProductCard product={p} onAddToCart={handleAddToCart} />
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            to="/category"
            className="group inline-flex items-center gap-2.5 rounded-full border border-ink/15 px-8 py-3.5 text-[13px] font-semibold text-ink transition-colors duration-300 hover:border-ink hover:bg-tile"
          >
            Xem tất cả sản phẩm
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
