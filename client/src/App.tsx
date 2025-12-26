import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ProfileEditor from "@/pages/ProfileEditor";
import PlayMode from "@/pages/PlayMode";
import Login from "@/pages/Login";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function PrivateRoute({ component: Component, ...rest }: { component: React.ComponentType<any> } & any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!user) {
    // Redirect logic handled by component or here
    window.location.href = "/login";
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/">
          {() => <PrivateRoute component={Dashboard} />}
        </Route>
        <Route path="/profile/:id">
          {(params) => <PrivateRoute component={ProfileEditor} params={params} />}
        </Route>
        <Route path="/play/:id">
          {(params) => <PrivateRoute component={PlayMode} params={params} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
