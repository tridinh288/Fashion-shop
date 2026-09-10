export default function LoadingSpinner({ className = "" }) {
  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-accent" />
    </div>
  );
}
