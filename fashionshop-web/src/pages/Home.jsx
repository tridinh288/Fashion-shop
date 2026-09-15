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
