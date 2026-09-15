export default function LoadingSpinner({ className = "" }) {
  return (
    <div role="status" className={`flex items-center justify-center py-24 ${className}`}>
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-ink" />
      <span className="sr-only">Đang tải</span>
    </div>
  );
}
