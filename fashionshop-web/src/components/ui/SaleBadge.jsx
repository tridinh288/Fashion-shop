export default function SaleBadge({ price, originalPrice }) {
  if (!originalPrice || originalPrice <= price) return null;
  const pct = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <span className="bg-sale px-2 py-1 text-[11px] font-bold leading-none text-white">
      −{pct}%
    </span>
  );
}
