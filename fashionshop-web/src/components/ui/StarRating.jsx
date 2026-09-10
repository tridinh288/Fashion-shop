import { Star } from "lucide-react";

export default function StarRating({ rating, max = 5, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          className={
            i < Math.round(rating)
              ? "fill-accent text-accent"
              : "text-neutral-700"
          }
        />
      ))}
    </div>
  );
}
