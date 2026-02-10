import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
  delay?: number;
}

export function StatsCard({ title, value, icon, trend, className, delay = 0 }: StatsCardProps) {
  return (
    <Card 
      className={cn(
        "cyber-box border-l-4 bg-card/50",
        "animate-in fade-in slide-in-from-bottom-4 duration-500",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-mono text-muted-foreground uppercase tracking-widest">
          {title}
        </CardTitle>
        <div className="text-primary opacity-80">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white font-display tabular-nums tracking-tight">
          {value}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
