export default function PublicLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center page-enter">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full border-4 border-primary/10 opacity-20" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">লোড হচ্ছে...</p>
      </div>
    </div>
  );
}
