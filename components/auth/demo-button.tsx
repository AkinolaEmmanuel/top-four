"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoSignIn } from "@/lib/mock-auth/client";
import { toast } from "sonner";

export function DemoButton({
  variant = "glow",
  className,
}: {
  variant?: "glow" | "sky" | "crown" | "outline" | "ghost";
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDemoAccess() {
    setLoading(true);
    try {
      await demoSignIn();
      toast.success("Welcome! Demo mode active. Redirecting to Predictor...");
      router.push("/predict");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to start demo access.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant as any}
      onClick={handleDemoAccess}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
      ) : (
        <Zap className="h-4 w-4 mr-1.5 text-crown fill-crown" />
      )}
      <span>{loading ? "STARTING DEMO..." : "TRY DEMO MODE"}</span>
    </Button>
  );
}
