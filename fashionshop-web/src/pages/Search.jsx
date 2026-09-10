import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { getProducts } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import ProductCard from "../components/ui/ProductCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { count, setCount } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ["products", "search", q],
    queryFn: () => getProducts({ keyword: q, per_page: 20 }),
    enabled: q.length > 0,
  });

  const products = data?.data?.data || [];

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <SearchIcon size={20} className="text-ink-faint" />
        <h1 className="text-xl font-bold text-ink">
          Kết quả tìm kiếm: <span className="text-ink">"{q}"</span>
        </h1>
      </div>

      {!q ? (
        <p className="text-ink-faint text-center py-16">Nhập từ khóa để tìm kiếm sản phẩm</p>
      ) : isLoading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-soft text-lg mb-2">Không tìm thấy kết quả cho "{q}"</p>
          <p className="text-ink-faint text-sm">Thử tìm với từ khóa khác</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-ink-soft mb-4">Tìm thấy {products.length} sản phẩm</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
