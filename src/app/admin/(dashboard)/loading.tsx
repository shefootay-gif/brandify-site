export default function Loading() {
  return (
    <div aria-busy="true" aria-label="جارٍ التحميل" className="animate-pulse space-y-4">
      <div className="h-8 w-56 rounded-md bg-paper-2" />
      <div className="h-4 w-96 max-w-full rounded-md bg-paper-2" />
      <div className="grid gap-3 pt-4 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-24 rounded-[var(--radius-lg)] bg-paper-2" />
        ))}
      </div>
    </div>
  );
}
