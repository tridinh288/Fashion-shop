import { useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getProducts } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import ProductCard from "../components/ui/ProductCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import useReveal from "../hooks/useReveal";

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { count, setCount } = useCartStore();
  const gridRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", "search", q],
    queryFn: () => getProducts({ keyword: q, per_page: 20 }),
    enabled: q.length > 0,
  });

  const products = data?.data?.data || [];

  useReveal(gridRef, { dependencies: [q, isLoading] });

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
      <div className="border-b border-line">
        <Container className="py-10">
          <p className="eyebrow">Tìm kiếm</p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            {q ? <>Kết quả cho “{q}”</> : "Tìm sản phẩm"}
          </h1>
          {q && !isLoading && products.length > 0 && (
            <p className="mt-3 text-sm text-ink-soft">Tìm thấy {products.length} sản phẩm</p>
          )}
        </Container>
      </div>

      <Container className="pt-10">
        <div ref={gridRef}>
          {!q ? (
            <EmptyState title="Nhập từ khóa để tìm kiếm sản phẩm" />
          ) : isLoading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <EmptyState
              title={`Không tìm thấy kết quả cho “${q}”`}
              action={<Button to="/category" variant="secondary">Xem tất cả sản phẩm</Button>}
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
        </div>
      </Container>
    </div>
  );
}
