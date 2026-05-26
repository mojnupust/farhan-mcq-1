export default function MemberLoading() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="absolute inset-0 grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative h-24 overflow-hidden rounded-xl border bg-card/60"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent [animation:shimmer_1.4s_infinite]" />
          </div>
        ))}
      </div>

      <div className="relative z-10 rounded-2xl border bg-background/80 px-8 py-6 text-center shadow-xl backdrop-blur-sm">
        <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-600" />
        <p className="text-xl font-bold gradient-text">লোড হচ্ছে...</p>
      </div>
    </div>
  );
}
