import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingCart, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { getProduct, getProductReviews } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import { postReview } from "../api/reviewApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import { formatCurrency } from "../utils/formatCurrency";
import { SIZES } from "../utils/constants";
import StarRating from "../components/ui/StarRating";
import SaleBadge from "../components/ui/SaleBadge";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const IMG_BASE = `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/storage/`;

const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5, "Nhận xét ít nhất 5 ký tự"),
});

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { count, setCount } = useCartStore();
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewsReady, setReviewsReady] = useState(false);

  const { data: productRes, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    retry: false,
  });

  const hasProduct = !!productRes?.data;
  useEffect(() => {
    if (!hasProduct) return;
    const timer = setTimeout(() => setReviewsReady(true), 4000);
    return () => clearTimeout(timer);
  }, [hasProduct]);

  const { data: reviewsRes, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getProductReviews(id),
    enabled: reviewsReady,
    retry: false,
  });

  // Product detail trả về trực tiếp (không wrap)
  const product = productRes?.data;
  // Reviews: direct array
  const reviews = reviewsRes?.data || [];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5 },
  });

  const handleAddToCart = async (goCheckout = false) => {
    if (!token) {
      toast.error("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }
    try {
      await addToCart({ product_id: product.id, quantity: qty, size });
      setCount(count + qty);
      if (goCheckout) navigate("/checkout");
      else toast.success("Đã thêm vào giỏ hàng!");
    } catch {
      toast.error("Không thể thêm vào giỏ");
    }
  };

  const onReviewSubmit = async (form) => {
    setReviewLoading(true);
    try {
      await postReview(id, form);
      toast.success("Đã gửi đánh giá!");
      reset();
      refetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setReviewLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-20 text-ink-faint">Không tìm thấy sản phẩm</div>;

  const imgSrc = product.hinh_anh
    ? `${IMG_BASE}${product.hinh_anh}`
    : "https://placehold.co/500x600?text=No+Image";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-tile">
          <img src={imgSrc} alt={product.ten_sp} className="w-full h-auto object-cover" />
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start gap-2 mb-2">
            <h1 className="text-2xl font-bold text-ink flex-1">{product.ten_sp}</h1>
            <SaleBadge price={product.gia} originalPrice={product.gia_cu} />
          </div>

          {avgRating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={avgRating} />
              <span className="text-sm text-ink-soft">({reviews.length} đánh giá)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-ink">{formatCurrency(product.gia)}</span>
            {product.gia_cu > product.gia && (
              <span className="text-lg text-ink-faint line-through">{formatCurrency(product.gia_cu)}</span>
            )}
          </div>

          <p className="text-ink-soft text-sm leading-relaxed mb-6">{product.mo_ta}</p>

          {/* Size */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-ink-soft mb-2">Kích Cỡ</p>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-12 h-12 rounded-lg border-2 text-sm font-semibold transition-colors ${
                    size === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-ink-soft mb-2">Số Lượng</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-lg border flex items-center justify-center text-lg font-bold hover:bg-tile-warm"
              >−</button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.so_luong, q + 1))}
                className="w-10 h-10 rounded-lg border flex items-center justify-center text-lg font-bold hover:bg-tile-warm"
              >+</button>
              <span className="text-sm text-ink-faint ml-2">Còn {product.so_luong} sản phẩm</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleAddToCart(false)}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-ink text-ink font-semibold py-3 rounded-xl hover:bg-tile transition-colors"
            >
              <ShoppingCart size={18} /> Thêm Vào Giỏ
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-ink hover:bg-black text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <Zap size={18} /> Mua Ngay
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-14">
        <h2 className="text-xl font-bold text-ink mb-6">Đánh Giá Sản Phẩm</h2>

        {token && (
          <form onSubmit={handleSubmit(onReviewSubmit)} className="bg-tile-warm rounded-xl p-5 mb-8 border">
            <p className="font-semibold text-ink-soft mb-3">Viết đánh giá của bạn</p>
            <div className="mb-3">
              <label className="text-sm text-ink-soft mb-1 block">Sao đánh giá</label>
              <select {...register("rating")} className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-ink">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} sao</option>
                ))}
              </select>
            </div>
            <textarea
              {...register("comment")}
              rows={3}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-ink resize-none"
            />
            {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment.message}</p>}
            <button
              type="submit"
              disabled={reviewLoading}
              className="mt-3 bg-ink hover:bg-black disabled:bg-ink/40 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              {reviewLoading ? "Đang gửi..." : "Gửi Đánh Giá"}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-ink-faint text-center py-8">Chưa có đánh giá nào</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-ink">{r.user?.fullname || "Ẩn danh"}</span>
                  <span className="text-xs text-ink-faint">{new Date(r.created_at).toLocaleDateString("vi-VN")}</span>
                </div>
                <StarRating rating={r.rating} size={14} />
                <p className="text-sm text-ink-soft mt-2">{r.comment}</p>
                {r.shop_reply && (
                  <div className="mt-3 bg-tile rounded-lg p-3 border-l-4 border-ink">
                    <p className="text-xs font-semibold text-ink mb-1">Phản hồi từ Shop</p>
                    <p className="text-sm text-ink-soft">{r.shop_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
