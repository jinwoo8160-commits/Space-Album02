export function MissingMapboxToken({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "flex h-full w-full items-center justify-center bg-white px-3 text-center text-[11px] leading-relaxed text-neutral-500"
          : "flex h-full w-full items-center justify-center bg-white px-8 text-center text-sm leading-relaxed text-neutral-600"
      }
    >
      Mapbox 토큰이 없습니다. 로컬은 `.env.local`, Vercel은 Environment Variables에
      `NEXT_PUBLIC_MAPBOX_TOKEN`을 넣고 다시 빌드해 주세요.
    </div>
  );
}
