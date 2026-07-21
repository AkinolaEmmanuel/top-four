import { FootballBall } from "@/components/brand/football-ball";
import { GREEN } from "@/lib/brand/colors";

const TICKER_ITEMS = [
  "GROUP CHAT PREDICTIONS",
  "PREMIER LEAGUE",
  "CHAMPIONS LEAGUE",
  "LA LIGA",
  "FA CUP",
  "SUPER CUP",
  "SEASON AWARDS",
];

export function Ticker() {
  return (
    <div
      aria-hidden
      className="overflow-hidden border-y-4 border-black py-3"
      style={{ backgroundColor: GREEN }}
    >
      <div className="flex w-max animate-marquee items-center gap-10 text-sm font-extrabold uppercase tracking-widest text-black">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex shrink-0 items-center gap-10">
            {TICKER_ITEMS.map((item) => (
              <span key={item} className="flex items-center gap-10">
                {item}
                <FootballBall className="h-4 w-4" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
