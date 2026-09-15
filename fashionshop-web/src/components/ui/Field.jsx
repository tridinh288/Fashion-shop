import { cloneElement, isValidElement, useId } from "react";

/**
 * Nhãn phía trên, lỗi ngay dưới ô. Gắn id / aria vào ô nhập con để trình đọc
 * màn hình đọc được nhãn và lỗi. Dùng được với {...register("ten")}.
 */
export default function Field({ label, error, hint, className = "", children }) {
  const id = useId();
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": errorId ?? hintId,
      })
    : children;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {control}
      {hintId && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-faint">
          {hint}
        </p>
      )}
      {errorId && (
        <p id={errorId} className="mt-1.5 text-sm text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
