import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/Button";
import { Loader2, LogOut, Terminal, Hand } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  // Hide nav on login page
  if (location === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-body text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 border border-primary bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Hand className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider text-white group-hover:text-primary transition-colors">
              GESTURE<span className="text-primary">NEO</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground font-mono">
                  <span className="text-xs text-primary/70">OPERATOR:</span>
                  <span className="text-white">{user.firstName || user.username}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => logout()}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  DISCONNECT
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">
                  <Terminal className="w-4 h-4 mr-2" />
                  CONNECT
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-white/5 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground font-mono">
          SYSTEM STATUS: ONLINE // GESTURE_NEO v1.0.0
        </div>
      </footer>
    </div>
  );
}
