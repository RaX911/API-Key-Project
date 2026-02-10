import { CyberLayout } from "@/components/CyberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, MapPin, Globe } from "lucide-react";
import { useState } from "react";

// Mock Data for Regional Visualization since no endpoint provided in manifest
const regions = [
  { id: 1, name: "JAVA ISLAND", type: "ISLAND", btsCount: 14502, status: "OPTIMAL" },
  { id: 2, name: "SUMATRA", type: "ISLAND", btsCount: 8932, status: "WARNING" },
  { id: 3, name: "KALIMANTAN", type: "ISLAND", btsCount: 5120, status: "OPTIMAL" },
  { id: 4, name: "SULAWESI", type: "ISLAND", btsCount: 4201, status: "OPTIMAL" },
  { id: 5, name: "PAPUA", type: "ISLAND", btsCount: 2105, status: "CRITICAL" },
];

export default function RegionalData() {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  return (
    <CyberLayout>
      <div className="border-b border-primary/20 pb-6 mb-6">
        <h2 className="text-2xl font-bold text-white font-display flex items-center gap-3">
          <Globe className="text-primary w-6 h-6" />
          GEOSPATIAL GRID
        </h2>
        <p className="text-muted-foreground font-mono text-xs mt-1">
          Regional infrastructure density and coverage heatmaps.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar Region List */}
        <div className="space-y-4">
          {regions.map((region) => (
            <div
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`
                cyber-box p-4 rounded cursor-pointer transition-all duration-300
                ${selectedRegion === region.id ? 'bg-primary/10 border-primary' : 'bg-black/40 border-white/5 hover:border-primary/50'}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-display font-bold text-white">{region.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  region.status === 'OPTIMAL' ? 'text-green-400 bg-green-500/10' : 
                  region.status === 'WARNING' ? 'text-yellow-400 bg-yellow-500/10' : 
                  'text-red-400 bg-red-500/10'
                }`}>
                  {region.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
                <MapPin className="w-3 h-3" />
                <span>{region.btsCount.toLocaleString()} Nodes Active</span>
              </div>
            </div>
          ))}
        </div>

        {/* Map Visualizer Area */}
        <div className="md:col-span-2">
          <Card className="bg-black/40 border-primary/20 h-[600px] flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
              style={{
                backgroundImage: `
                  linear-gradient(to right, #333 1px, transparent 1px),
                  linear-gradient(to bottom, #333 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />
            
            <CardHeader className="relative z-10 border-b border-white/5 bg-black/50 backdrop-blur">
              <CardTitle className="font-mono text-sm text-primary flex items-center gap-2">
                <Map className="w-4 h-4" /> 
                {selectedRegion ? `SECTOR VIEW: ${regions.find(r => r.id === selectedRegion)?.name}` : "GLOBAL OVERVIEW"}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 relative flex items-center justify-center">
              {/* Abstract Map Graphic */}
              <div className="relative w-full h-full max-w-lg mx-auto opacity-50 group-hover:opacity-80 transition-opacity duration-500">
                <svg viewBox="0 0 400 300" className="w-full h-full text-primary fill-none stroke-current stroke-[0.5]">
                  {/* Simplified Indonesia-ish shapes */}
                  <path d="M50,150 Q80,120 120,130 T180,160 T250,150 T320,140" className="animate-pulse" />
                  <circle cx="100" cy="140" r="2" className="fill-current" />
                  <circle cx="180" cy="160" r="3" className="fill-current" />
                  <circle cx="280" cy="150" r="2" className="fill-current" />
                  
                  {selectedRegion && (
                    <g className="animate-ping origin-center">
                      <circle cx="180" cy="160" r="20" className="stroke-accent stroke-[0.5]" />
                      <circle cx="180" cy="160" r="15" className="stroke-accent stroke-[0.5]" />
                    </g>
                  )}
                </svg>

                {/* Data Overlays */}
                <div className="absolute top-10 right-10 text-xs font-mono text-primary/70 space-y-1">
                  <div>LAT: -6.200000</div>
                  <div>LNG: 106.816666</div>
                  <div>ZOOM: 12x</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CyberLayout>
  );
}
