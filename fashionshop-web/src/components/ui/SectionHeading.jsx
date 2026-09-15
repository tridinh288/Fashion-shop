/** Nhãn nhỏ + tiêu đề serif, kèm phần điều khiển bên phải (tab, link) nếu có */
export default function SectionHeading({ eyebrow, title, as: Tag = "h2", action, className = "", ...rest }) {
  return (
    <div
      className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${className}`}
      {...rest}
    >
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <Tag className="font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</Tag>
      </div>
      {action}
    </div>
  );
}
