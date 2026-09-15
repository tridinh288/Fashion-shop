import { useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { getProduct, getProductReviews } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import { postReview } from "../api/reviewApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import { SIZES, GENDER_MAP } from "../utils/constants";
import { imageUrl } from "../utils/imageUrl";
import { PROMISES } from "../utils/promises";
import useReveal from "../hooks/useReveal";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import Field from "../components/ui/Field";
import { INPUT_CLASS } from "../components/ui/fieldStyles";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Price from "../components/ui/Price";
import StarRating from "../components/ui/StarRating";

// API chặn mỗi lần thêm giỏ tối đa 50 sản phẩm, xem CartController.
const MAX_PER_ADD = 50;

const PLACEHOLDER = "https://placehold.co/800x1000/ece6db/6b645a?text=Chưa+có+ảnh";

const QTY_BTN =
  "flex h-12 w-11 items-center justify-center text-ink transition-colors duration-200 hover:bg-tile disabled:cursor-not-allowed disabled:opacity-40";

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
  const [showReviewForm, setShowReviewForm] = useState(false);
  const infoRef = useRef(null);

  const { data: productRes, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    retry: false,
  });

  // Tải đánh giá ngay, không chờ
  const { data: reviewsRes, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getProductReviews(id),
    enabled: Boolean(id),
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

  useReveal(infoRef, { onLoad: true, dependencies: [Boolean(product)] });

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
      setShowReviewForm(false);
      refetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setReviewLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!product) {
    return (
      <Container>
        <EmptyState
          title="Không tìm thấy sản phẩm"
          action={<Button to="/category" variant="secondary">Xem sản phẩm khác</Button>}
        />
      </Container>
    );
  }

  const imgSrc = product.hinh_anh ? imageUrl(product.hinh_anh) : PLACEHOLDER;
  const gender = GENDER_MAP[product.gioi_tinh];
  const maxQty = Math.min(product.so_luong, MAX_PER_ADD);

  return (
    <div>
      <Container className="py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="aspect-[4/5] bg-tile">
            <img
              src={imgSrc}
              alt={product.ten_sp}
              fetchPriority="high"
              className="h-full w-full object-contain p-8 sm:p-12"
            />
          </div>

          <div ref={infoRef} className="lg:sticky lg:top-28 lg:self-start">
            <nav data-reveal aria-label="Breadcrumb" className="text-sm text-ink-faint">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link to="/" className="transition-colors duration-200 hover:text-ink">Trang chủ</Link>
                </li>
                {gender && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li>
                      <Link
                        to={`/category?gioi_tinh=${product.gioi_tinh}`}
                        className="transition-colors duration-200 hover:text-ink"
                      >
                        {gender}
                      </Link>
                    </li>
                  </>
                )}
                {product.category?.ten_danh_muc && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li>{product.category.ten_danh_muc}</li>
                  </>
                )}
              </ol>
            </nav>

            <h1 data-reveal className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {product.ten_sp}
            </h1>

            {avgRating > 0 && (
              <div data-reveal className="mt-4 flex items-center gap-2">
                <StarRating rating={avgRating} size={14} />
                <a href="#danh-gia" className="text-sm text-ink-soft underline-offset-4 hover:underline">
                  {reviews.length} đánh giá
                </a>
              </div>
            )}

            <div data-reveal className="mt-6">
              <Price gia={product.gia} gia_cu={product.gia_cu} size="lg" />
            </div>

            {product.mo_ta && (
              <p data-reveal className="mt-6 max-w-prose text-base leading-relaxed text-ink-soft">
                {product.mo_ta}
              </p>
            )}

            <div data-reveal className="mt-8">
              <div className="flex items-baseline justify-between">
                <p id="size-label" className="text-sm font-medium text-ink">Kích cỡ</p>
                <p className="text-sm text-ink-faint">Còn {product.so_luong} sản phẩm</p>
              </div>
              <div role="group" aria-labelledby="size-label" className="mt-3 flex gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`flex h-12 w-12 items-center justify-center border text-sm font-medium transition-colors duration-200 ${
                      size === s ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div data-reveal className="mt-8 flex gap-3">
              <div className="flex items-center border border-line">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Giảm số lượng"
                  className={QTY_BTN}
                >
                  <Minus size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <span aria-live="polite" className="w-10 text-center text-sm tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  aria-label="Tăng số lượng"
                  className={QTY_BTN}
                >
                  <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
              <Button size="lg" className="flex-1" onClick={() => handleAddToCart(false)}>
                Thêm vào giỏ
              </Button>
            </div>

            <Button
              data-reveal
              variant="secondary"
              size="lg"
              className="mt-3 w-full"
              onClick={() => handleAddToCart(true)}
            >
              Mua ngay
            </Button>

            <ul data-reveal className="mt-10 flex flex-col gap-3 border-t border-line pt-6">
              {PROMISES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-ink-soft">
                  <Icon size={17} strokeWidth={1.5} className="shrink-0 text-ink" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ==================== Đánh giá ==================== */}
      <section id="danh-gia" className="border-t border-line">
        <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <h2 className="font-display text-3xl text-ink">Đánh giá</h2>
            {reviews.length > 0 && (
              <p className="mt-4 text-4xl tabular-nums text-ink">
                {avgRating.toFixed(1)}
                <span className="text-base text-ink-faint"> / 5</span>
              </p>
            )}
            <p className="mt-1 text-sm text-ink-soft">{reviews.length} đánh giá</p>

            {token && (
              <Button
                variant="secondary"
                className="mt-6"
                onClick={() => setShowReviewForm((o) => !o)}
                aria-expanded={showReviewForm}
                aria-controls="form-danh-gia"
              >
                {showReviewForm ? "Đóng" : "Viết đánh giá"}
              </Button>
            )}

            {token && showReviewForm && (
              <form
                id="form-danh-gia"
                onSubmit={handleSubmit(onReviewSubmit)}
                noValidate
                className="mt-6 flex flex-col gap-5"
              >
                <Field label="Số sao">
                  <select {...register("rating")} className={INPUT_CLASS}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} sao</option>
                    ))}
                  </select>
                </Field>
                <Field label="Nhận xét" error={errors.comment?.message}>
                  <textarea
                    {...register("comment")}
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn"
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </Field>
                <Button type="submit" loading={reviewLoading}>
                  Gửi đánh giá
                </Button>
              </form>
            )}
          </div>

          <div>
            {reviews.length === 0 ? (
              <p className="text-ink-faint">Chưa có đánh giá nào</p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {reviews.map((r) => (
                  <li key={r.id} className="py-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-medium text-ink">{r.user?.fullname || "Ẩn danh"}</span>
                      <StarRating rating={r.rating} size={12} />
                      <span className="text-sm text-ink-faint">
                        {new Date(r.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className="mt-2 text-base leading-relaxed text-ink-soft">{r.comment}</p>
                    {r.shop_reply && (
                      <div className="mt-4 border-l-2 border-accent pl-4">
                        <p className="text-sm font-medium text-ink">Phản hồi từ shop</p>
                        <p className="mt-1 text-sm text-ink-soft">{r.shop_reply}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
