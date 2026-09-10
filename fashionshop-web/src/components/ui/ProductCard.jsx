import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import SaleBadge from "./SaleBadge";
import StarRating from "./StarRating";

const IMG_BASE = `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/storage/`;

export default function ProductCard({ product, onAddToCart }) {
  const imgSrc = product.hinh_anh
    ? `${IMG_BASE}${product.hinh_anh}`
    : "https://placehold.co/600x760/f4f4f5/a1a1aa?text=Chưa+có+ảnh";

  const reviews = product.reviews || [];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const hasDiscount = product.gia_cu > product.gia;

  return (
    <article className="group flex flex-col">
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-[3/4] overflow-hidden bg-tile"
      >
        {/* Ảnh sản phẩm là ảnh tách nền: dùng contain kèm khoảng đệm để món đồ
            hiện trọn vẹn, không bị cắt hai bên như khi dùng cover. */}
        <img
          src={imgSrc}
          alt={product.ten_sp}
          loading="lazy"
          className="h-full w-full object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {hasDiscount && (
          <div className="absolute left-3 top-3">
            <SaleBadge price={product.gia} originalPrice={product.gia_cu} />
          </div>
        )}

        {/* Nút thêm nhanh, trượt lên khi rê chuột */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.(product);
          }}
          className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 bg-ink py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white opacity-0 transition-all duration-300 hover:bg-black group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          <ShoppingBag size={14} strokeWidth={2} />
          Thêm vào giỏ
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 pt-3.5">
        <h3 className="text-[13.5px] font-medium leading-snug text-ink">
          <Link to={`/products/${product.id}`} className="link-underline">
            {product.ten_sp}
          </Link>
        </h3>

        {avgRating > 0 && <StarRating rating={avgRating} size={11} />}

        <div className="mt-auto flex items-baseline gap-2.5 pt-0.5">
          <span className="text-[13.5px] font-semibold tabular-nums text-ink">
            {formatCurrency(product.gia)}
          </span>
          {hasDiscount && (
            <span className="text-xs tabular-nums text-ink-faint line-through">
              {formatCurrency(product.gia_cu)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
