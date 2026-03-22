import { Droplets, TrendingUp, Scale, Leaf } from "lucide-react";

interface InsightCardProps {
  title: string;
  content: string;
  type?: "technical" | "economic" | "regulatory" | "environmental";
}

const cfg = {
  technical:     { icon: Droplets,   color: "#06B6D4", label: "Técnico" },
  economic:      { icon: TrendingUp, color: "#FBBF24", label: "Económico" },
  regulatory:    { icon: Scale,      color: "#A78BFA", label: "Regulatorio" },
  environmental: { icon: Leaf,       color: "#34D399", label: "Ambiental" },
};

export function InsightCard({ title, content, type = "technical" }: InsightCardProps) {
  const c = cfg[type];
  const Icon = c.icon;

  return (
    <div
      className="rounded-xl border border-white/[0.03] p-4 transition-all hover:border-white/[0.06]"
      style={{
        borderLeft: `3px solid ${c.color}30`,
        background: `linear-gradient(135deg, ${c.color}03, transparent)`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ backgroundColor: `${c.color}10` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: c.color }} />
        </div>
        <h4 className="text-sm font-semibold text-foreground/85">{title}</h4>
        <span
          className="ml-auto text-[9px] font-medium uppercase tracking-wider rounded px-1.5 py-0.5"
          style={{ color: `${c.color}80`, backgroundColor: `${c.color}08` }}
        >
          {c.label}
        </span>
      </div>
      <p className="pl-[34px] text-xs leading-relaxed text-foreground/50">{content}</p>
    </div>
  );
}
