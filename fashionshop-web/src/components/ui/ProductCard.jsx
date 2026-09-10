import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import SaleBadge from "./SaleBadge";
import StarRating from "./StarRating";

const IMG_BASE = `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/storage/`;

export default function ProductCard({ product, onAddToCart }) {
  const imgSrc = product.hinh_anh
    ? `${IMG_BASE}${product.hinh_anh}`
    : "https://placehold.co/600x760/18181b/52525b?text=No+Image";

  const reviews = product.reviews || [];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const hasDiscount = product.gia_cu > product.gia;

  return (
    <article className="group glow-border flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden bg-zinc-800/40"
      >
        <img
          src={imgSrc}
          alt={product.ten_sp}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />

        {/* Lớp phủ tối dần ở đáy ảnh để chữ bên dưới không bị chói */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {hasDiscount && (
          <div className="absolute left-3 top-3">
            <SaleBadge price={product.gia} originalPrice={product.gia_cu} />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-zinc-100">
          <Link
            to={`/products/${product.id}`}
            className="transition-colors duration-300 hover:text-accent"
          >
            {product.ten_sp}
          </Link>
        </h3>

        {avgRating > 0 && <StarRating rating={avgRating} size={12} />}

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-[15px] font-semibold tabular-nums text-white">
            {formatCurrency(product.gia)}
          </span>
          {hasDiscount && (
            <span className="text-xs tabular-nums text-zinc-500 line-through">
              {formatCurrency(product.gia_cu)}
            </span>
          )}
        </div>

        <button
          onClick={() => onAddToCart?.(product)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/70 py-2.5 text-xs font-semibold text-zinc-200 transition-all duration-300 hover:border-accent/50 hover:bg-accent hover:text-white"
        >
          <ShoppingBag size={14} strokeWidth={2.2} />
          Thêm vào giỏ
        </button>
      </div>
    </article>
  );
}
