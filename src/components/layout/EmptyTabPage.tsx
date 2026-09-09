export function EmptyTabPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 pb-24 text-center">
      <p className="font-[family-name:var(--font-hand)] text-2xl text-neutral-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">{description}</p>
    </main>
  );
}
