import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";
import SaleBadge from "./SaleBadge";
import StarRating from "./StarRating";

const IMG_BASE = `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/storage/`;

export default function ProductCard({ product, onAddToCart }) {
  const imgSrc = product.hinh_anh
    ? `${IMG_BASE}${product.hinh_anh}`
    : "https://placehold.co/600x760/121212/404040?text=No+Image";

  const reviews = product.reviews || [];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const hasDiscount = product.gia_cu > product.gia;

  return (
    <article className="group flex flex-col">
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-[3/4] overflow-hidden bg-ink-1"
      >
        <img
          src={imgSrc}
          alt={product.ten_sp}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {hasDiscount && (
          <div className="absolute left-0 top-0">
            <SaleBadge price={product.gia} originalPrice={product.gia_cu} />
          </div>
        )}

        {/* Nút thêm giỏ trượt lên từ đáy ảnh khi rê chuột */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.(product);
          }}
          className="absolute inset-x-0 bottom-0 translate-y-full bg-neutral-50 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink opacity-0 transition-all duration-300 hover:bg-accent hover:text-white group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          Thêm vào giỏ
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2 pt-4">
        <h3 className="text-sm font-medium leading-snug text-neutral-200">
          <Link
            to={`/products/${product.id}`}
            className="transition-colors duration-300 hover:text-accent"
          >
            {product.ten_sp}
          </Link>
        </h3>

        {avgRating > 0 && <StarRating rating={avgRating} size={11} />}

        <div className="mt-auto flex items-baseline gap-3 pt-1">
          <span className="text-sm font-semibold tabular-nums text-white">
            {formatCurrency(product.gia)}
          </span>
          {hasDiscount && (
            <span className="text-xs tabular-nums text-neutral-600 line-through">
              {formatCurrency(product.gia_cu)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
