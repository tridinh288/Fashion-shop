export default function SaleBadge({ price, originalPrice }) {
  if (!originalPrice || originalPrice <= price) return null;
  const pct = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <span className="rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-[11px] font-semibold tracking-tight text-accent backdrop-blur-sm">
      −{pct}%
    </span>
  );
}
