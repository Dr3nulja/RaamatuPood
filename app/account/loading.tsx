export default function LoadingAccountPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F0] px-4 py-10">
      <section className="mx-auto max-w-2xl rounded-2xl border border-amber-100 bg-white p-6 shadow-sm animate-pulse">
        <div className="h-8 w-56 rounded bg-amber-100" />
        <div className="mt-3 h-4 w-72 rounded bg-amber-50" />

        <div className="mt-6 space-y-3">
          <div className="h-12 rounded bg-amber-50" />
          <div className="h-12 rounded bg-amber-50" />
          <div className="h-12 rounded bg-amber-50" />
        </div>

        <div className="mt-6 flex gap-3">
          <div className="h-11 w-44 rounded bg-amber-100" />
          <div className="h-11 w-36 rounded bg-amber-50" />
        </div>
      </section>
    </main>
  );
}
