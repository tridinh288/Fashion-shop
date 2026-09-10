export default function LoadingSpinner({ className = "" }) {
  return (
    <div className={`flex items-center justify-center py-24 ${className}`}>
      <div className="h-7 w-7 animate-spin rounded-full border border-neutral-800 border-t-accent" />
    </div>
  );
}
