"use client";

import Link from "next/link";
import { ArrowRight, Flame, ShieldCheck } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import { Button } from "@/components/ui/button";

const MOCK_UPCOMING = [
  {
    id: "fix-up-1",
    time: "15:00",
    competition: "Premier League",
    teams: {
      home: { name: "Liverpool", logo: "/football/teams/3.svg" },
      away: { name: "Arsenal", logo: "/football/teams/1.svg" }
    }
  },
  {
    id: "fix-up-2",
    time: "17:30",
    competition: "Premier League",
    teams: {
      home: { name: "Aston Villa", logo: "/football/teams/8.svg" },
      away: { name: "Man City", logo: "/football/teams/2.svg" }
    }
  },
  {
    id: "fix-up-3",
    time: "20:00",
    competition: "Champions League",
    teams: {
      home: { name: "Real Madrid", logo: "/football/teams/20.svg" },
      away: { name: "Bayern", logo: "/football/teams/40.svg" }
    }
  }
];

export function QuickPickPanel() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 border border-border bg-card p-4 rounded-2xl shadow-elevation-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-foreground text-sm sm:text-base">Predict today</h3>
          <p className="font-sans text-xs text-muted-foreground mt-0.5">Top upcoming fixtures</p>
        </div>
        <Link href="/predict" className="shrink-0">
          <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-sky-500 hover:text-sky-600 px-2 justify-between gap-1">
            <span>Predict all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {MOCK_UPCOMING.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-secondary border border-border hover:border-sky-500/30 transition-colors group">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-sans text-muted-foreground mb-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                {f.time} · {f.competition}
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-foreground font-heading truncate">
                <span className="truncate">{f.teams.home.name}</span>
                <span className="text-[10px] text-muted-foreground font-sans px-1">vs</span>
                <span className="truncate">{f.teams.away.name}</span>
              </div>
            </div>
            
            <Link href={`/predict?fixture=${f.id}`} className="shrink-0">
              <Button size="sm" className="h-8 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-[10px] sm:text-xs shadow-glow-sky px-3 opacity-90 group-hover:opacity-100 transition-opacity">
                Pick
              </Button>
            </Link>
          </div>
        ))}
      </div>
      
      <div className="pt-2 border-t border-border/50 flex justify-between items-center text-[10px] font-sans text-muted-foreground">
        <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-400" /> Secure</span>
        <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-amber-500" /> 10k+ picks made</span>
      </div>
    </div>
  );
}
