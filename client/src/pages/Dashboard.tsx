import { useDashboardStats } from "@/hooks/use-stats";
import { CyberLayout } from "@/components/CyberLayout";
import { StatsCard } from "@/components/StatsCard";
import { Activity, Radio, Users, Map, Cpu, Database, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const chartData = [
    { name: '00:00', load: 45 },
    { name: '04:00', load: 30 },
    { name: '08:00', load: 65 },
    { name: '12:00', load: 85 },
    { name: '16:00', load: 75 },
    { name: '20:00', load: 90 },
    { name: '23:59', load: 55 },
  ];

  if (isLoading) {
    return (
      <CyberLayout>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 bg-primary/10" />
          ))}
        </div>
      </CyberLayout>
    );
  }

  return (
    <CyberLayout>
      <div className="flex items-end justify-between border-b border-primary/20 pb-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white font-display tracking-tight">COMMAND CENTER</h2>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            System Status: <span className="text-primary animate-pulse">OPTIMAL</span>
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-mono text-muted-foreground">LAST SYNC</p>
          <p className="text-sm font-bold text-primary">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Active BTS Towers" 
          value={stats?.totalBts ?? 0}
          icon={<Radio className="w-5 h-5" />}
          trend="+2.5% vs last week"
          className="border-primary/50"
          delay={0}
        />
        <StatsCard 
          title="Registered MSISDN" 
          value={stats?.totalMsisdn.toLocaleString() ?? 0}
          icon={<Users className="w-5 h-5" />}
          trend="+124 new today"
          delay={100}
        />
        <StatsCard 
          title="API Keys Active" 
          value={stats?.activeKeys ?? 0}
          icon={<Cpu className="w-5 h-5" />}
          trend="98.5% uptime"
          delay={200}
        />
        <StatsCard 
          title="Regions Covered" 
          value={stats?.regionsCovered ?? 0}
          icon={<Map className="w-5 h-5" />}
          trend="100% capacity"
          delay={300}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
        {/* Network Load Chart */}
        <div className="col-span-4 cyber-box bg-black/40 p-6 rounded-lg border border-primary/20 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Network Traffic Load
            </h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <span className="text-xs font-mono text-primary">LIVE</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="name" 
                  stroke="#666" 
                  tick={{ fill: '#666', fontSize: 12, fontFamily: 'JetBrains Mono' }} 
                />
                <YAxis 
                  stroke="#666" 
                  tick={{ fill: '#666', fontSize: 12, fontFamily: 'JetBrains Mono' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000', 
                    borderColor: 'var(--primary)', 
                    color: '#fff',
                    fontFamily: 'JetBrains Mono'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="load" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#000', stroke: 'var(--primary)', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'var(--primary)' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Logs */}
        <div className="col-span-3 cyber-box bg-black/40 p-0 rounded-lg border border-white/10 flex flex-col h-[400px]">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Database className="w-5 h-5 text-secondary" />
              System Event Log
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
            {[
              { time: "10:42:05", level: "INFO", msg: "BTS-8492 connection re-established" },
              { time: "10:41:12", level: "WARN", msg: "High latency detected in Region: JAVA-WEST" },
              { time: "10:38:55", level: "INFO", msg: "User ADMIN_01 logged in" },
              { time: "10:35:20", level: "ERR", msg: "API Rate limit exceeded for key: EXT_SVC_04" },
              { time: "10:30:00", level: "INFO", msg: "Daily backup completed successfully" },
              { time: "10:15:22", level: "INFO", msg: "New firmware rollout initiated for Series-X Towers" },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 text-xs border-l-2 border-white/10 pl-3 hover:bg-white/5 p-2 transition-colors">
                <span className="text-muted-foreground opacity-60">{log.time}</span>
                <span className={cn(
                  "font-bold",
                  log.level === "INFO" && "text-blue-400",
                  log.level === "WARN" && "text-yellow-400",
                  log.level === "ERR" && "text-red-500"
                )}>{log.level}</span>
                <span className="text-white/80 truncate">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Alert Banner */}
      <div className="mt-6 border border-yellow-500/30 bg-yellow-500/10 p-4 rounded flex items-start gap-4 animate-pulse">
        <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0" />
        <div>
          <h4 className="text-yellow-500 font-bold font-display text-sm">SYSTEM ADVISORY</h4>
          <p className="text-yellow-500/80 text-xs font-mono mt-1">
            Scheduled maintenance for database shard #04 occurring at 02:00 UTC. Expect minor latency during migration window.
          </p>
        </div>
      </div>
    </CyberLayout>
  );
}
