"use client";

import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Scale, Shield, Ambulance, BrushCleaning, GraduationCap, Lock, Clock } from "lucide-react";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const iconMap: Record<string, React.ReactNode> = {
  scale:      <Scale className="w-8 h-8" />,
  shield:     <Shield className="w-8 h-8" />,
  ambulance:  <Ambulance className="w-8 h-8" />,
  broom:      <BrushCleaning className="w-8 h-8" />,
  graduation: <GraduationCap className="w-8 h-8" />,
};

type Status = "live" | "coming" | "beta";

export default function AppCard({
  name,
  description,
  icon,
  color,
  status,
}: {
  name: string;
  description: string;
  icon: string;
  color: string;
  status: Status;
}) {
  const [hovered, setHovered] = useState(false);

  const statusConfig: Record<Status, { text: string; class: string }> = {
    live:   { text: "Live Now",         class: "bg-green-500/20 text-green-400 border-green-500/40" },
    beta:   { text: "Beta",             class: "bg-doc-gold/20 text-doc-gold border-doc-gold/40" },
    coming: { text: "Coming July 2026", class: "bg-doc-card text-doc-text/50 border-doc-border/30" },
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative p-6 rounded-xl border transition-all duration-300 cursor-pointer bg-doc-card border-doc-green/30",
        hovered && "border-doc-gold/60 -translate-y-1 shadow-lg shadow-doc-green/20"
      )}
    >
      <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center mb-4", color)}>
        {iconMap[icon]}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
      <p className="text-doc-text/70 text-sm mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className={cn("px-3 py-1 rounded-full text-xs border", statusConfig[status].class)}>
          {statusConfig[status].text}
        </span>
        <span className="flex items-center gap-1 text-doc-text/40 text-sm">
          <Lock className="w-4 h-4" /> <Clock className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}
