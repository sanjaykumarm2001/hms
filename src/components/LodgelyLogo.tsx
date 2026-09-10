export function LodgelyLogo({
  className = 'h-9 w-auto',
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center justify-center">
        <img
          src="/lodgely-logo.jpg"
          alt="Lodgely"
          className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-sm transition-transform duration-200 hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/lodgely-logo.jpg"
        alt="Lodgely Hotel Management"
        className="h-10 w-auto shrink-0 rounded-lg object-contain transition-transform duration-200 hover:scale-[1.02]"
      />
    </div>
  );
}

