export default function SaleBadge({ price, originalPrice }) {
  if (!originalPrice || originalPrice <= price) return null;
  const pct = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <span className="bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
      −{pct}%
    </span>
  );
}
