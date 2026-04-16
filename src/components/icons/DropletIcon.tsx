type DropletIconProps = {
  filled: boolean;
  className?: string;
};

export function DropletIcon({
  filled,
  className = 'w-5 h-5',
}: DropletIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
        fill={filled ? 'var(--color-accent-gold)' : 'var(--color-surface)'}
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
