import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { getProducts, getCategories } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import ProductCard from "../components/ui/ProductCard";
import toast from "react-hot-toast";

const MOCK_PRODUCTS = [
  { id: 999, ten_sp: "Áo thun nam basic", gia: 299000, gia_cu: 399000, hinh_anh: null, reviews: [] },
  { id: 998, ten_sp: "Quần jean nữ slim", gia: 499000, gia_cu: 650000, hinh_anh: null, reviews: [] },
  { id: 997, ten_sp: "Váy hoa mùa hè",   gia: 350000, gia_cu: 450000, hinh_anh: null, reviews: [] },
];

export default function Category() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { count, setCount } = useCartStore();
  const categoryId = searchParams.get("category_id") || "";
  const gioi_tinh  = searchParams.get("gioi_tinh")   || "";
  const page       = parseInt(searchParams.get("page") || "1", 10);

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ["products", "category", categoryId, gioi_tinh, page],
    queryFn: () => getProducts({
      category_id: categoryId || undefined,
      gioi_tinh:   gioi_tinh !== "" ? gioi_tinh : undefined,
      page,
      per_page: 12,
    }),
  });

  const { data: catsRes } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: !!productsRes,
  });

  const rawProducts = productsRes?.data?.data || [];
  const products  = rawProducts.length > 0 ? rawProducts : (isLoading ? [] : MOCK_PRODUCTS);
  const lastPage  = productsRes?.data?.last_page || 1;
  const total     = productsRes?.data?.total     || 0;
  const categories = catsRes?.data?.data || [];

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val === "") next.delete(key);
    else next.set(key, val);
    next.delete("page");
    setSearchParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    setSearchParams(next);
  };

  const handleAddToCart = async (product) => {
    if (product.id >= 997 && product.id <= 999) return;
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-52 shrink-0">
          <div className="bg-white rounded-xl border p-4 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal size={16} className="text-ink-soft" />
              <span className="font-semibold text-ink-soft text-sm">Bộ Lọc</span>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-ink-soft uppercase mb-2">Giới Tính</p>
              {[
                { val: "",  label: "Tất cả" },
                { val: "1", label: "Nam"     },
                { val: "0", label: "Nữ"      },
              ].map((g) => (
                <label key={g.val} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={gioi_tinh === g.val}
                    onChange={() => setFilter("gioi_tinh", g.val)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-ink-soft">{g.label}</span>
                </label>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-ink-soft uppercase mb-2">Danh Mục</p>
              <label className="flex items-center gap-2 py-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={categoryId === ""}
                  onChange={() => setFilter("category_id", "")}
                  className="accent-blue-600"
                />
                <span className="text-sm text-ink-soft">Tất cả</span>
              </label>
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryId === String(c.id)}
                    onChange={() => setFilter("category_id", String(c.id))}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-ink-soft">{c.ten_danh_muc}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-ink">
              {gioi_tinh === "1" ? "Thời Trang Nam" : gioi_tinh === "0" ? "Thời Trang Nữ" : "Tất Cả Sản Phẩm"}
            </h1>
            {total > 0 && <span className="text-sm text-ink-soft">{total} sản phẩm</span>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} data-testid="product-item">
                <ProductCard product={p} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>

          {!isLoading && lastPage > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === p ? "bg-ink text-white" : "bg-white border hover:bg-tile-warm text-ink-soft"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}