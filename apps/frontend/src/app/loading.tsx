export default function Loading() {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-bounce rounded-full bg-primary-600 [animation-delay:-0.3s]"></div>
        <div className="h-4 w-4 animate-bounce rounded-full bg-primary-600 [animation-delay:-0.15s]"></div>
        <div className="h-4 w-4 animate-bounce rounded-full bg-primary-600"></div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading content...</p>
    </div>
  )
}
