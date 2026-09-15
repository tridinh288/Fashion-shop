import { Star } from "lucide-react";

export default function StarRating({ rating, max = 5, size = 16 }) {
  return (
    <div
      role="img"
      aria-label={`Đánh giá ${Number(rating).toFixed(1)} trên ${max}`}
      className="flex items-center gap-0.5"
    >
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          aria-hidden="true"
          className={i < Math.round(rating) ? "fill-accent text-accent" : "text-line"}
        />
      ))}
    </div>
  );
}
