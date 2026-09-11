export function LodgelyLogo({
  className = '',
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-line">
          <img
            src="/lodgely-logo.jpg"
            alt="Lodgely"
            className="h-8 w-8 shrink-0 rounded-lg object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <div className="flex items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-line shrink-0">
        <img
          src="/lodgely-logo.jpg"
          alt="Lodgely Hotel Management"
          className="h-8 w-8 shrink-0 rounded-lg object-contain"
        />
      </div>
      <span className="font-fell-french text-2xl font-bold tracking-wider text-[#1c4d28] select-none truncate">
        Lodgely
      </span>
    </div>
  );
}

