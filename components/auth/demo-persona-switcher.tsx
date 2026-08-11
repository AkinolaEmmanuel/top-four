"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { UserCheck, Shield, ChevronDown, Check } from "lucide-react";
import { DEMO_PERSONAS, getActiveDemoPersona, setActiveDemoPersona, type DemoPersona } from "@/lib/mock-auth/personas";
import { toast } from "sonner";

export function DemoPersonaSwitcher({ className = "" }: { className?: string }) {
  const [activePersona, setActivePersona] = useState<DemoPersona>(DEMO_PERSONAS[0]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    setActivePersona(getActiveDemoPersona());
    function handlePersonaChange() {
      setActivePersona(getActiveDemoPersona());
    }
    window.addEventListener("topfour:persona_changed", handlePersonaChange);
    return () => window.removeEventListener("topfour:persona_changed", handlePersonaChange);
  }, []);

  function handleSelectPersona(personaId: string) {
    const persona = setActiveDemoPersona(personaId);
    setActivePersona(persona);
    setIsOpen(false);
    queryClient.invalidateQueries();
    toast.success(`Switched to demo persona: ${persona.displayName}`);
    router.refresh();
  }

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Switcher Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition-all active:scale-95 shadow-sm font-sans"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white font-black text-[9px] shrink-0">
          {activePersona.avatar}
        </div>
        <div className="flex flex-col text-left min-w-0">
          <span className="truncate max-w-[130px] font-bold text-foreground leading-tight">
            {activePersona.displayName}
          </span>
          <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[130px]">
            {activePersona.roleDescription}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-sky-400 shrink-0 ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-72 rounded-2xl border border-border bg-card p-2 shadow-2xl space-y-1 text-xs">
            <div className="px-3 py-2 border-b border-border mb-1">
              <span className="text-[10px] font-mono font-bold text-sky-500 uppercase tracking-wider block">
                ⚡ DEMO TESTING PERSONAS
              </span>
              <p className="text-[11px] text-muted-foreground">Click any user to test different permissions & views.</p>
            </div>

            {DEMO_PERSONAS.map((persona) => {
              const isSelected = persona.id === activePersona.id;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => handleSelectPersona(persona.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-sky-500/15 border border-sky-500/40 text-sky-500 font-bold"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {persona.avatar}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-foreground block truncate">{persona.displayName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono block truncate">
                        {persona.roleDescription}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check className="h-4 w-4 text-sky-500 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
