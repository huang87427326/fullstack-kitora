import { Button } from '@kitora/ui';

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center p-12">
      <div className="max-w-xl text-center space-y-6">
        <p className="text-xs uppercase tracking-widest text-zinc-500">apps/marketing</p>
        <h1 className="text-4xl font-semibold tracking-tight">Kitora</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Public marketing site placeholder. Landing, pricing, blog, and docs will live here.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button>Start free trial</Button>
          <Button variant="ghost">View pricing</Button>
        </div>
      </div>
    </main>
  );
}
