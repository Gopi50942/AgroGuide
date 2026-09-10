import Link from "next/link";

export function Logo({ className = "", withTagline = false }: { className?: string; withTagline?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 4C20 4 8 10 8 22C8 29.7 13.4 36 20 36C26.6 36 32 29.7 32 22C32 10 20 4 20 4Z"
          fill="#3F6B2E"
          className="transition-transform duration-500 group-hover:rotate-[8deg] origin-center"
        />
        <path
          d="M20 10C20 10 14 15 14 22.5C14 27 16.7 31 20 31"
          stroke="#F7F3E9"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20 15C20.5 17 22.5 17.5 24 16.5"
          stroke="#F7F3E9"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M20 21C20.5 23 22.5 23.5 24 22.5"
          stroke="#F7F3E9"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-semibold text-ink tracking-tight">
          AgroGuide
        </span>
        {withTagline && (
          <span className="text-[11px] text-ink-light/70 font-medium tracking-wide">
            Intelligence for every stage of farming
          </span>
        )}
      </span>
    </Link>
  );
}
