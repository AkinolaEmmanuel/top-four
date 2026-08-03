"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Renders a team logo with a graceful SVG fallback if the image fails to load
 * or if no valid URL is provided. Shows the first two letters of the team name
 * inside a circle.
 */
export function TeamLogo({
  src,
  teamName,
  size = 36,
  className = "object-contain",
}: {
  src: string | null | undefined;
  teamName: string;
  size?: number;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  // A logo is "valid" only if it's an absolute URL (http/https) — relative
  // paths like "/football/teams/default.svg" 404 in the frontend.
  const isValid = src && (src.startsWith("http://") || src.startsWith("https://"));

  if (!isValid || hasError) {
    const initials = teamName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        className="flex items-center justify-center rounded-full bg-white/10 border border-white/10 font-mono font-bold text-white/60 text-xs"
        style={{ width: size, height: size }}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={teamName}
      width={size}
      height={size}
      className={className}
      onError={() => setHasError(true)}
      unoptimized
    />
  );
}
