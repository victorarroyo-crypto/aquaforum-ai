import { Droplets, TrendingUp, Scale, Leaf } from "lucide-react";

interface InsightCardProps { title: string; content: string; type?: "technical" | "economic" | "regulatory" | "environmental"; }

const C = {
  technical:     { icon: Droplets,   color: "#0D9488", label: "Técnico" },
  economic:      { icon: TrendingUp, color: "#D97706", label: "Económico" },
  regulatory:    { icon: Scale,      color: "#4338CA", label: "Regulatorio" },
  environmental: { icon: Leaf,       color: "#059669", label: "Ambiental" },
};

export function InsightCard({ title, content, type = "technical" }: InsightCardProps) {
  const c = C[type];
  const Icon = c.icon;
  return (
    <div className="border border-edge rounded p-4 hover:border-faint transition-colors" style={{ borderLeft: `2px solid ${c.color}` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5" style={{ color: c.color }} />
        <h4 className="text-xs font-bold text-dark">{title}</h4>
        <span className="ml-auto text-[8px] font-black uppercase tracking-widest" style={{ color: c.color }}>{c.label}</span>
      </div>
      <p className="text-[13px] leading-relaxed text-mid pl-5">{content}</p>
    </div>
  );
}
