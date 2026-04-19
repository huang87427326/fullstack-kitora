export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center p-12">
      <div className="max-w-xl text-center space-y-4">
        <p className="text-xs uppercase tracking-widest text-zinc-500">apps/admin</p>
        <h1 className="text-4xl font-semibold tracking-tight">Kitora Admin</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Internal admin console placeholder. Staff-only operations and data dashboards live here.
        </p>
      </div>
    </main>
  );
}
