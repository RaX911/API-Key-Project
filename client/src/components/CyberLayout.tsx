import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  ShieldCheck, 
  Radio, 
  Search, 
  Key, 
  LogOut, 
  Menu,
  Activity,
  Map as MapIcon,
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function CyberLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/bts", label: "BTS Network", icon: Radio },
    { href: "/msisdn", label: "MSISDN Lookup", icon: Search },
    { href: "/keys", label: "API Access", icon: Key },
    { href: "/regional", label: "Geo Data", icon: MapIcon },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-black/90 text-primary border-r border-primary/20">
      <div className="p-6 flex items-center gap-3 border-b border-primary/20">
        <div className="w-10 h-10 bg-primary/20 rounded-none flex items-center justify-center border border-primary animate-pulse">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-white font-display">NET.ADMIN</h1>
          <p className="text-xs text-primary/60 font-mono">SYS.V.2.0.4</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="block">
              <div 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 border-l-2 cursor-pointer font-mono",
                  isActive 
                    ? "bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(0,255,157,0.1)]" 
                    : "border-transparent text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/50"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive && "animate-pulse")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary/20 bg-black/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
            <span className="font-mono text-xs font-bold text-primary">OP</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate font-display">{user?.firstName || 'Operator'}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">ID: {user?.id?.slice(0, 8)}...</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive font-mono uppercase text-xs"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Scanline Effect */}
      <div className="scanline z-50 pointer-events-none" />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 z-40">
        <NavContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-black/80 border-primary/50 text-primary">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r-primary/20 bg-black w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden relative">
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}
