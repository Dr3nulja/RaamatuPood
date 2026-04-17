export default function LoadingAccountPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <section className="hidden rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm lg:block animate-pulse">
          <div className="h-4 w-24 rounded bg-amber-100" />
          <div className="mt-4 space-y-2">
            <div className="h-12 rounded-2xl bg-amber-50" />
            <div className="h-12 rounded-2xl bg-amber-50" />
            <div className="h-12 rounded-2xl bg-amber-50" />
          </div>
        </section>

        <div className="space-y-6 animate-pulse">
          <section className="rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 text-center md:flex-row md:items-center md:text-left">
              <div className="mx-auto h-24 w-24 rounded-full bg-amber-100 md:mx-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-28 rounded bg-amber-100" />
                <div className="h-10 w-56 rounded bg-amber-50" />
                <div className="h-4 w-40 rounded bg-amber-50" />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm md:p-8">
            <div className="h-4 w-24 rounded bg-amber-100" />
            <div className="mt-4 space-y-4">
              <div className="h-36 rounded-3xl bg-amber-50" />
              <div className="h-36 rounded-3xl bg-amber-50" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
