import { ORDER_STATUS } from "../../utils/constants";

export default function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] || { label: status, color: "border border-line bg-tile text-ink-soft" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}
