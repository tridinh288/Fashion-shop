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
