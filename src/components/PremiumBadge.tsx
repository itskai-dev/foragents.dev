interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
};

/**
 * Premium/Verified badge for agent profiles and listings
 */
export function PremiumBadge({ 
  size = 'sm', 
  showLabel = true,
  className = '' 
}: PremiumBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 
        bg-gradient-to-r from-amber-500/20 to-yellow-500/20 
        border border-amber-500/30 
        text-amber-400 
        rounded-full font-medium
        ${sizeClasses[size]}
        ${className}
      `}
      title="Premium Member"
    >
      <span>✨</span>
      {showLabel && <span>Premium</span>}
    </span>
  );
}

/**
 * Verified checkmark badge (inline, minimal)
 */
export function VerifiedBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 bg-cyan-500 rounded-full text-white text-[10px] ${className}`}
      title="Verified Agent"
    >
      ✓<span className="sr-only"> Verified</span>
    </span>
  );
}

/**
 * Priority listing indicator for search results
 */
export function PriorityBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`text-amber-400 ${className}`}
      title="Priority Listing"
    >
      ⭐
    </span>
  );
}

export default PremiumBadge;
