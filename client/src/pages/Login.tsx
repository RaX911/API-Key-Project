import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, Fingerprint, Lock, ChevronRight } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00ff9d 1px, transparent 1px),
            linear-gradient(to bottom, #00ff9d 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Scanline */}
      <div className="scanline" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/50 mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter font-display mb-1">
            NET.ADMIN <span className="text-primary text-sm align-top">SYS</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm">SECURE ACCESS GATEWAY</p>
        </div>

        <Card className="bg-black/80 border-primary/30 backdrop-blur-xl cyber-box shadow-[0_0_50px_rgba(0,255,157,0.1)]">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">SYSTEM LOCKED</span>
              </div>
              <span className="text-xs font-mono text-primary">ENC: AES-256</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white font-display">Authentication Required</h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Identify verification via secure OIDC protocol required to access internal network grid.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full h-12 bg-primary text-black hover:bg-primary/90 font-bold tracking-wide uppercase font-mono group"
            >
              <Fingerprint className="w-4 h-4 mr-2" />
              Initialize Login
              <ChevronRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>
            
            <div className="mt-4 flex justify-between text-[10px] font-mono text-muted-foreground uppercase">
              <span>Node: JK-01</span>
              <span>Latency: 24ms</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
