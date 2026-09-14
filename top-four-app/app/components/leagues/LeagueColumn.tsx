/**
 * The 1080px column a league screen's content sits in.
 *
 * It belongs to the screen rather than to the layout, because the layout wraps
 * bands as well as content: with the cap up there, League Overview's hero was
 * a dark panel inset in a lighter page instead of a band spanning it. The
 * design's own arrangement is the other way round — a band runs the full width
 * and puts this column inside itself.
 */
export function LeagueColumn({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`md:max-w-[1080px] md:mx-auto md:px-[24px] ${className}`}>
      {children}
    </div>
  );
}
