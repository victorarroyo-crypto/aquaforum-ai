import { Droplets, TrendingUp, Scale, Leaf } from "lucide-react";

interface InsightCardProps {
  title: string;
  content: string;
  type?: "technical" | "economic" | "regulatory" | "environmental";
}

const cfg = {
  technical: {
    icon: Droplets,
    color: "#0F766E",
    label: "T\u00e9cnico",
    bgClass: "bg-teal-50",
  },
  economic: {
    icon: TrendingUp,
    color: "#D97706",
    label: "Econ\u00f3mico",
    bgClass: "bg-amber-50",
  },
  regulatory: {
    icon: Scale,
    color: "#4338CA",
    label: "Regulatorio",
    bgClass: "bg-indigo-50",
  },
  environmental: {
    icon: Leaf,
    color: "#059669",
    label: "Ambiental",
    bgClass: "bg-emerald-50",
  },
};

export function InsightCard({
  title,
  content,
  type = "technical",
}: InsightCardProps) {
  const c = cfg[type];
  const Icon = c.icon;

  return (
    <div
      className="rounded-lg border border-stone-200 p-4 transition-all hover:border-stone-300 hover:shadow-sm"
      style={{ borderLeft: `3px solid ${c.color}` }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-md ${c.bgClass}`}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: c.color }} />
        </div>
        <h4 className="text-sm font-semibold text-stone-800">{title}</h4>
        <span
          className="ml-auto text-[9px] font-semibold uppercase tracking-wider rounded px-1.5 py-0.5"
          style={{
            color: c.color,
            backgroundColor: `${c.color}08`,
          }}
        >
          {c.label}
        </span>
      </div>
      <p className="pl-[34px] text-xs leading-relaxed text-stone-500">
        {content}
      </p>
    </div>
  );
}
