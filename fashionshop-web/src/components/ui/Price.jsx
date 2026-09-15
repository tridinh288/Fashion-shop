import { formatCurrency } from "../../utils/formatCurrency";

/** Giá bán, kèm giá gốc gạch ngang và phần trăm giảm khi có giảm giá */
export default function Price({ gia, gia_cu, size = "sm" }) {
  const giam = gia_cu > gia ? Math.round(((gia_cu - gia) / gia_cu) * 100) : 0;
  const chinh = size === "lg" ? "text-2xl" : "text-sm";
  const phu = size === "lg" ? "text-base" : "text-xs";

  return (
    <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      <span className={`${chinh} font-medium tabular-nums text-ink`}>{formatCurrency(gia)}</span>
      {giam > 0 && (
        <>
          <span className={`${phu} tabular-nums text-ink-faint line-through`}>
            <span className="sr-only">Giá gốc </span>
            {formatCurrency(gia_cu)}
          </span>
          <span className="text-xs font-semibold text-sale">−{giam}%</span>
        </>
      )}
    </p>
  );
}
