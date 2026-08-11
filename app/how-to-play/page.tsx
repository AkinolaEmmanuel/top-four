import Link from "next/link";
import { Activity, Receipt, Trophy, Users, Zap, CheckCircle2, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoButton } from "@/components/auth/demo-button";

export const metadata = {
  title: "How to Play · topfour.app",
  description: "Learn how to make predictions, generate thermal receipt slips, double down, and compete in private clubs.",
};

export default function HowToPlayPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 sm:space-y-12 px-4 py-6 sm:py-12 pb-24 sm:pb-8">
      
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-xs font-mono font-bold text-sky-400">
          <Zap className="h-3.5 w-3.5 text-crown fill-crown" />
          OFFICIAL RULEBOOK & GUIDE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground uppercase font-heading">
          How to Play <span className="text-sky-500">TopFour</span>
        </h1>
        <p className="text-base text-muted-foreground font-sans">
          Master match predictions, collect thermal tickets, use 2X Double Down multipliers, and climb private group leaderboards.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <DemoButton variant="glow" className="px-6 py-3 h-12 text-sm" />
        </div>
      </div>

      {/* Step-by-Step Guide Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        
        {/* Step 1 */}
        <div className="rounded-3xl border border-border bg-card p-8 space-y-4 shadow-elevation-dark-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 font-mono font-black text-base border border-sky-500/20">
              01
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase">STEP 1</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground font-heading">Pick Match Outcomes</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Select 1X2 outcomes (Home Win, Draw, Away Win), exact scorelines, or over/under total goals for upcoming Premier League, La Liga, Serie A, and Champions League fixtures.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/50 p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Arsenal vs Chelsea</span>
              <span className="text-emerald-400 font-bold">1 (Home Win)</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Liverpool vs Man Utd</span>
              <span className="text-sky-400 font-bold">Over 2.5 Goals</span>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-3xl border border-border bg-card p-8 space-y-4 shadow-elevation-dark-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 font-mono font-black text-base border border-emerald-500/20">
              02
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase">STEP 2</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground font-heading">Print Thermal Ticket</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Submit your matchday picks to generate an authentic digital thermal receipt ticket. Download your slip image or share it directly into your WhatsApp/Discord group chats.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/50 p-4 font-mono text-xs flex items-center justify-between text-foreground">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-sky-500" />
              <span>COLLECTIBLE TICKET #8492</span>
            </div>
            <span className="text-emerald-400 font-bold">LOCKED IN</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-3xl border border-border bg-card p-8 space-y-4 shadow-elevation-dark-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 font-mono font-black text-base border border-sky-500/20">
              03
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase">STEP 3</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground font-heading">Climb Private Room Standings</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create custom prediction rooms for your friends, office leagues, or fan clubs. Track live accuracy, win streaks, and claim the #1 Crown Gold spot.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/50 p-4 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-crown font-bold">
              <Trophy className="h-4 w-4 text-crown" />
              <span>RANK #1 GOLD CROWN</span>
            </div>
            <span className="text-foreground font-black">1,250 PTS</span>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900 to-sky-950/40 p-8 sm:p-10 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-black text-white uppercase font-heading">
          Ready to Test Your Football IQ?
        </h2>
        <p className="text-slate-300 max-w-xl mx-auto font-sans">
          Jump into predictor mode or launch a instant demo to start making picks right away.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <DemoButton variant="glow" className="px-6 py-3 h-12" />
          <Link href="/predict">
            <Button variant="outline" size="lg" className="gap-2">
              <Activity className="h-4 w-4 text-sky-400" />
              OPEN PREDICTOR
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
