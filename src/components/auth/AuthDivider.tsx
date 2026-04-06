/**
 * AuthDivider component
 * Neo-brutalist visual separator between form and OAuth options
 */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-0.5 bg-border" />
      <span className="text-xs font-bold text-muted uppercase tracking-wider">
        Or
      </span>
      <div className="flex-1 h-0.5 bg-border" />
    </div>
  );
}
