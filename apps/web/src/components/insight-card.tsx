"use client";

import { AlertTriangle, TrendingUp, Lightbulb, Shield, Zap, Droplets, Scale, Leaf } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  warning: AlertTriangle,
  trend: TrendingUp,
  insight: Lightbulb,
  risk: Shield,
  action: Zap,
  technical: Droplets,
  economic: TrendingUp,
  regulatory: Scale,
  environmental: Leaf,
};

const colorMap: Record<string, string> = {
  warning: "#F59E0B",
  trend: "#14B8A6",
  insight: "#8B5CF6",
  risk: "#EF4444",
  action: "#22C55E",
  technical: "#14B8A6",
  economic: "#F59E0B",
  regulatory: "#6366F1",
  environmental: "#22C55E",
};

interface InsightCardProps {
  type: string;
  title: string;
  content: string;
  label?: string;
}

export function InsightCard({ type, title, content, label }: InsightCardProps) {
  const Icon = iconMap[type] || Lightbulb;
  const borderColor = colorMap[type] || "#14B8A6";

  return (
    <div
      className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-4"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${borderColor}15` }}
        >
          <Icon size={16} style={{ color: borderColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-[14px] font-semibold text-[#FAFAFA]">{title}</h4>
            {label && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  color: borderColor,
                  backgroundColor: `${borderColor}15`,
                }}
              >
                {label}
              </span>
            )}
          </div>
          <p className="text-[14px] leading-relaxed text-[#A1A1AA]">{content}</p>
        </div>
      </div>
    </div>
  );
}
