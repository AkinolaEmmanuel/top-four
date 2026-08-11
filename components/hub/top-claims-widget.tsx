"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, ThumbsUp, ThumbsDown, Flame, TrendingUp, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Claim {
  id: string;
  author: string;
  avatar: string;
  roomName: string;
  title: string;
  agreeCount: number;
  disagreeCount: number;
  totalVotes: number;
  timeAgo: string;
  isHot?: boolean;
}

const INITIAL_CLAIMS: Claim[] = [
  {
    id: "claim-1",
    author: "Akinola Emmanuel",
    avatar: "AE",
    roomName: "Premier League Pundits",
    title: "Arsenal will win the Premier League by 5+ points this season.",
    agreeCount: 342,
    disagreeCount: 68,
    totalVotes: 410,
    timeAgo: "2h ago",
    isHot: true,
  },
  {
    id: "claim-2",
    author: "Dave_Gooner99",
    avatar: "DG",
    roomName: "Champions League Elite",
    title: "Real Madrid will keep a clean sheet in all home knockout matches.",
    agreeCount: 189,
    disagreeCount: 142,
    totalVotes: 331,
    timeAgo: "4h ago",
    isHot: false,
  },
  {
    id: "claim-3",
    author: "Tactical_Guru",
    avatar: "TG",
    roomName: "Global Pundits Arena",
    title: "Cole Palmer to register 25+ G/A before Matchday 30.",
    agreeCount: 512,
    disagreeCount: 48,
    totalVotes: 560,
    timeAgo: "6h ago",
    isHot: true,
  },
];

export function TopClaimsWidget({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [votedClaims, setVotedClaims] = useState<Record<string, "agree" | "disagree">>({});

  function handleVote(claimId: string, type: "agree" | "disagree") {
    if (votedClaims[claimId]) {
      toast.info("You already voted on this claim!");
      return;
    }

    setVotedClaims((prev) => ({ ...prev, [claimId]: type }));

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        return {
          ...c,
          agreeCount: type === "agree" ? c.agreeCount + 1 : c.agreeCount,
          disagreeCount: type === "disagree" ? c.disagreeCount + 1 : c.disagreeCount,
          totalVotes: c.totalVotes + 1,
        };
      })
    );

    toast.success(type === "agree" ? "You agreed with this claim! 👍" : "You disagreed with this claim! 👎");
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-5 shadow-sm dark:shadow-elevation-dark-1 w-full max-w-full min-w-0 overflow-hidden">
      {/* Widget Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground font-heading truncate">Top Pundit Claims & Banter</h3>
            <p className="text-[11px] text-muted-foreground font-mono truncate">COMMUNITY BOLD PREDICTIONS</p>
          </div>
        </div>

        <Link
          href="/rooms"
          className="text-xs font-bold text-sky-500 hover:text-sky-400 shrink-0 flex items-center gap-1"
        >
          <span>All Claims</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Claim Cards Stack */}
      <div className="space-y-3.5">
        {claims.map((claim) => {
          const agreePercentage = Math.round((claim.agreeCount / claim.totalVotes) * 100);
          const userVote = votedClaims[claim.id];

          return (
            <div
              key={claim.id}
              className="rounded-2xl border border-border bg-slate-50/80 dark:bg-slate-900/60 p-4 space-y-3 shadow-xs hover:border-sky-500/30 transition-all duration-200"
            >
              {/* Author & Room Tag */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-sky-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    {claim.avatar}
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="font-bold text-foreground truncate block">{claim.author}</span>
                    <span className="text-[10px] text-muted-foreground font-mono block truncate">{claim.roomName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {claim.isHot && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      HOT
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground font-mono">{claim.timeAgo}</span>
                </div>
              </div>

              {/* Claim Title */}
              <p className="text-xs sm:text-sm font-bold text-foreground font-sans leading-snug">
                "{claim.title}"
              </p>

              {/* Voting Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">{agreePercentage}% AGREE</span>
                  <span className="text-rose-600 dark:text-rose-400">{100 - agreePercentage}% DISAGREE</span>
                </div>

                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden flex border border-border">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${agreePercentage}%` }}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${100 - agreePercentage}%` }}
                  />
                </div>
              </div>

              {/* Voting Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote(claim.id, "agree")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                      userVote === "agree"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-secondary border-border text-foreground hover:bg-emerald-500/10 hover:text-emerald-400"
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>Agree ({claim.agreeCount})</span>
                  </button>

                  <button
                    onClick={() => handleVote(claim.id, "disagree")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                      userVote === "disagree"
                        ? "bg-rose-500/20 border-rose-500 text-rose-400"
                        : "bg-secondary border-border text-foreground hover:bg-rose-500/10 hover:text-rose-400"
                    }`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    <span>Disagree ({claim.disagreeCount})</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-muted-foreground">
                  {claim.totalVotes} votes
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guest Sign In CTA */}
      {!isLoggedIn && (
        <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-sky-500/5 p-3.5 rounded-2xl border border-sky-500/20">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-foreground">Want to create your own matchday claims?</p>
            <p className="text-[11px] text-muted-foreground font-mono">Join thousands of pundits competing in private clubs.</p>
          </div>
          <Link href="/signup">
            <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-glow-sky">
              Get Started Free
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
