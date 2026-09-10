export function LodgelyLogo({
  className = '',
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-line">
        <img
          src="/lodgely-logo.jpg"
          alt="Lodgely"
          className="h-8 w-8 shrink-0 rounded-lg object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-line">
        <img
          src="/lodgely-logo.jpg"
          alt="Lodgely Hotel Management"
          className="h-9 w-auto max-w-[130px] shrink-0 rounded-lg object-contain"
        />
      </div>
    </div>
  );
}

