/** Thông báo khi không có gì để hiện, kèm hành động gợi ý */
export default function EmptyState({ title, action }) {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <h2 className="font-display text-2xl text-ink sm:text-3xl">{title}</h2>
      {action}
    </div>
  );
}
