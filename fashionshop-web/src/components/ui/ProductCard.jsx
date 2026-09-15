import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import Price from "./Price";
import StarRating from "./StarRating";
import { imageUrl } from "../../utils/imageUrl";

const PLACEHOLDER = "https://placehold.co/600x800/ece6db/6b645a?text=Chưa+có+ảnh";

export default function ProductCard({ product, onAddToCart }) {
  const reviews = product.reviews || [];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const imgSrc = product.hinh_anh ? imageUrl(product.hinh_anh) : PLACEHOLDER;

  return (
    <article data-testid="product-item" className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-tile">
        {/* Ảnh là link phụ (tên SP bên dưới là link chính cho bàn phím) */}
        <Link
          to={`/products/${product.id}`}
          tabIndex={-1}
          aria-hidden="true"
          className="block h-full w-full"
        >
          {/* Ảnh tách nền: contain + đệm để món đồ hiện trọn */}
          <img
            src={imgSrc}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        {onAddToCart && (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            aria-label={`Thêm ${product.ten_sp} vào giỏ`}
            className="add-to-cart absolute inset-x-3 bottom-3 flex min-h-11 items-center justify-center gap-2 bg-ink text-[13px] font-semibold text-white transition-[opacity,transform] duration-200 hover:bg-black"
          >
            <ShoppingBag size={15} strokeWidth={1.5} aria-hidden="true" />
            Thêm vào giỏ
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-3.5">
        <h3 className="text-[15px] font-normal leading-snug tracking-normal text-ink">
          <Link to={`/products/${product.id}`} className="link-underline">
            {product.ten_sp}
          </Link>
        </h3>

        {avgRating > 0 && <StarRating rating={avgRating} size={12} />}

        <div className="mt-auto pt-0.5">
          <Price gia={product.gia} gia_cu={product.gia_cu} />
        </div>
      </div>
    </article>
  );
}
