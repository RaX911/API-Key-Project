import { CyberLayout } from "@/components/CyberLayout";
import { useState } from "react";
import { useMsisdnLookup } from "@/hooks/use-msisdn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Smartphone, MapPin, User, Hash, Globe, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MsisdnLookup() {
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const { data, isLoading, isError, error } = useMsisdnLookup(activeSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length > 5) {
      setActiveSearch(query);
    }
  };

  return (
    <CyberLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white font-display">MSISDN INTEL LOOKUP</h2>
          <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto">
            Trace subscriber identity parameters and last known location triangulation.
            Authorized personnel only.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 relative">
          <Input
            placeholder="Enter MSISDN (e.g. 628123456789)..."
            className="h-14 bg-black/50 border-primary/30 text-lg font-mono text-primary pl-12 shadow-[0_0_20px_rgba(0,255,157,0.05)] focus:border-primary focus:shadow-[0_0_20px_rgba(0,255,157,0.2)]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/50" />
          <Button type="submit" size="lg" className="h-14 w-32 bg-primary text-black font-bold font-mono text-lg hover:bg-primary/90">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "TRACE"}
          </Button>
        </form>

        {isError && (
          <div className="bg-destructive/10 border border-destructive/50 p-4 rounded text-destructive flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-mono text-sm">Target not found in active registry. Signal lost.</span>
          </div>
        )}

        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Subscriber Info */}
              <Card className="cyber-box bg-black/40 border-primary/30">
                <CardHeader className="border-b border-primary/10 pb-3">
                  <CardTitle className="text-primary font-mono text-sm uppercase flex items-center gap-2">
                    <User className="w-4 h-4" /> Target Identity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-mono block">Registered Name</label>
                      <div className="text-lg font-bold text-white font-display">{data.registeredName || "UNKNOWN"}</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-mono block">NIK / ID</label>
                      <div className="text-lg font-bold text-white font-mono tracking-wider">{data.registeredNik || "N/A"}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${data.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-sm font-mono text-white uppercase">{data.status} SUBSCRIBER</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Data */}
              <Card className="cyber-box bg-black/40 border-white/10">
                <CardHeader className="border-b border-white/10 pb-3">
                  <CardTitle className="text-secondary font-mono text-sm uppercase flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Technical Params
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 font-mono text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="text-white font-bold">{data.provider}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">IMSI</span>
                    <span className="text-white">{data.imsi}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">IMEI</span>
                    <span className="text-white">{data.imei}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ICCID</span>
                    <span className="text-white">{data.iccid}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Location Data */}
              <Card className="col-span-1 md:col-span-2 cyber-box bg-black/40 border-accent/30">
                <CardHeader className="border-b border-accent/10 pb-3">
                  <CardTitle className="text-accent font-mono text-sm uppercase flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Last Known Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-mono block">Connected BTS</label>
                      <div className="text-white font-bold text-lg">{data.location?.towerInfo?.cellId || "NO SIGNAL"}</div>
                      <div className="text-xs text-accent mt-1">
                        LAC: {data.location?.towerInfo?.lac} | {data.location?.towerInfo?.operator}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-mono block">Estimated Region</label>
                      <div className="text-white">
                        {data.region?.village}, {data.region?.district}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.region?.regency}, {data.region?.province}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock Map Visualization */}
                  <div className="bg-black/80 rounded border border-accent/20 h-40 relative overflow-hidden flex items-center justify-center group">
                     <div className="absolute inset-0 opacity-20" style={{
                       backgroundImage: 'radial-gradient(circle, var(--accent) 1px, transparent 1px)',
                       backgroundSize: '20px 20px'
                     }} />
                     <div className="w-32 h-32 border border-accent/30 rounded-full flex items-center justify-center animate-ping absolute" />
                     <div className="w-2 h-2 bg-accent rounded-full z-10 shadow-[0_0_10px_var(--accent)]" />
                     <span className="absolute bottom-2 right-2 text-[10px] font-mono text-accent">
                       LAT: {data.location?.lat.toFixed(6)} | LNG: {data.location?.long.toFixed(6)}
                     </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </CyberLayout>
  );
}
