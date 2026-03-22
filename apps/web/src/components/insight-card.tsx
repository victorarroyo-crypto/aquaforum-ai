import { Droplets, TrendingUp, Scale, Leaf } from "lucide-react";

interface InsightCardProps {
  title: string;
  content: string;
  type?: "technical" | "economic" | "regulatory" | "environmental";
}

const typeConfig = {
  technical: {
    icon: Droplets,
    color: "ocean",
    border: "border-l-ocean/40",
    bg: "bg-ocean/[0.03]",
    iconBg: "bg-ocean/10",
  },
  economic: {
    icon: TrendingUp,
    color: "amber",
    border: "border-l-amber/40",
    bg: "bg-amber/[0.03]",
    iconBg: "bg-amber/10",
  },
  regulatory: {
    icon: Scale,
    color: "violet",
    border: "border-l-violet/40",
    bg: "bg-violet/[0.03]",
    iconBg: "bg-violet/10",
  },
  environmental: {
    icon: Leaf,
    color: "emerald",
    border: "border-l-emerald/40",
    bg: "bg-emerald/[0.03]",
    iconBg: "bg-emerald/10",
  },
};

export function InsightCard({ title, content, type = "technical" }: InsightCardProps) {
  const cfg = typeConfig[type];
  const Icon = cfg.icon;

  return (
    <div
      className={`rounded-lg border-l-[3px] ${cfg.border} ${cfg.bg} border border-l-0 border-white/[0.04] p-4`}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <div className={`flex h-6 w-6 items-center justify-center rounded-md ${cfg.iconBg}`}>
          <Icon className={`h-3.5 w-3.5 text-${cfg.color}`} />
        </div>
        <h4 className="text-sm font-semibold text-foreground/90">{title}</h4>
      </div>
      <p className="pl-[34px] text-xs leading-relaxed text-foreground/60">{content}</p>
    </div>
  );
}
