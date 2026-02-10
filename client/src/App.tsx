import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import BtsDatabase from "@/pages/BtsDatabase";
import MsisdnLookup from "@/pages/MsisdnLookup";
import ApiKeys from "@/pages/ApiKeys";
import RegionalData from "@/pages/RegionalData";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  // Handle redirect from login page if already authenticated
  if (!isLoading && user && window.location.pathname === "/login") {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/bts" component={() => <ProtectedRoute component={BtsDatabase} />} />
      <Route path="/msisdn" component={() => <ProtectedRoute component={MsisdnLookup} />} />
      <Route path="/keys" component={() => <ProtectedRoute component={ApiKeys} />} />
      <Route path="/regional" component={() => <ProtectedRoute component={RegionalData} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
