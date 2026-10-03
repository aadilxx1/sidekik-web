export function ReplayModal({ title, src, onClose }: { title: string; src: string | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="w-full max-w-3xl rounded-lg bg-background p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm hover:bg-accent">Close</button>
        </div>
        {src ? (
          <video src={src} controls autoPlay className="aspect-video w-full rounded-md bg-muted" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
            The recording will play here
          </div>
        )}
      </div>
    </div>
  );
}
