import { Button } from "@/components/ui/Button";
import { Hand, Terminal } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,128,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,128,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

      <div className="relative z-10 max-w-lg w-full p-8 text-center space-y-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/10 border border-primary/30 shadow-[0_0_40px_rgba(0,255,128,0.3)] mb-6 animate-pulse">
          <Hand className="w-12 h-12 text-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter text-white">
            GESTURE<span className="text-primary text-shadow-neon">NEO</span>
          </h1>
          <p className="text-lg text-muted-foreground font-light max-w-md mx-auto leading-relaxed">
            Advanced neural-interface bridge. Map hand gestures to digital actions with zero latency.
          </p>
        </div>

        <div className="pt-8">
          <Button 
            size="lg" 
            className="w-full max-w-xs h-16 text-lg tracking-widest font-bold shadow-[0_0_30px_rgba(0,255,128,0.4)] hover:shadow-[0_0_50px_rgba(0,255,128,0.6)]"
            onClick={handleLogin}
          >
            <Terminal className="w-5 h-5 mr-3" />
            INITIALIZE LINK
          </Button>
          <p className="mt-4 text-xs text-muted-foreground font-mono uppercase opacity-50">
            Secure Authentication via Replit Identity
          </p>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
    </div>
  );
}
