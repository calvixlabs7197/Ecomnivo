/**
 * Shown while a screen's server data resolves.
 *
 * Skeleton blocks rather than a spinner: the shell is already painted, so the
 * honest thing to show is the shape of what is arriving.
 */
export default function AdminLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-56 rounded-md bg-surface-strong" />
        <div className="h-4 w-80 rounded-md bg-surface-strong" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-24 rounded-lg border border-rule bg-page" />
        ))}
      </div>

      <div className="h-64 rounded-lg border border-rule bg-page" />
    </div>
  );
}
