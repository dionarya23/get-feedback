export default function LoadingDots() {
  return (
    <div className="flex gap-2 items-center justify-center p-4">
      <div className="w-3 h-3 bg-black animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-black animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-black animate-pulse"></div>
      <span className="ml-2 font-mono text-sm text-black uppercase tracking-widest">Capturing</span>
    </div>
  );
}
