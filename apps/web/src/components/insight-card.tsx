import { Lightbulb } from "lucide-react";

interface InsightCardProps {
  title: string;
  content: string;
  type?: "technical" | "economic" | "regulatory" | "environmental";
}

const typeColors: Record<string, string> = {
  technical: "border-ocean",
  economic: "border-amber",
  regulatory: "border-violet",
  environmental: "border-emerald",
};

export function InsightCard({ title, content, type = "technical" }: InsightCardProps) {
  return (
    <div
      className={`rounded-lg border-l-4 ${
        typeColors[type] || typeColors.technical
      } bg-white/5 p-4 backdrop-blur-md`}
    >
      <div className="mb-2 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber" />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <p className="text-sm leading-relaxed text-foreground/80">{content}</p>
    </div>
  );
}
