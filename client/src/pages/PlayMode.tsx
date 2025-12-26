import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useGameProfile } from "@/hooks/use-game-profiles";
import CameraFrame from "@/components/CameraFrame";
import { type GestureType } from "@/lib/gesture-recognition";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Keyboard, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlayMode() {
  const [, params] = useRoute("/play/:id");
  const id = parseInt(params?.id || "0");
  const { data: profile } = useGameProfile(id);

  const [currentGesture, setCurrentGesture] = useState<GestureType>("None");
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // This would ideally interface with a desktop agent or websocket to actually press keys.
  // For this web MVP, we simulate the visual feedback and log to console.
  const handleGesture = (gesture: GestureType) => {
    setCurrentGesture(gesture);
    
    if (profile?.keyMappings && profile.keyMappings[gesture]) {
      const actionKey = profile.keyMappings[gesture];
      setLastAction(actionKey);
      setActiveKey(actionKey);
      
      // Reset active key visual after a short delay to simulate "press and release" or continuous
      // For continuous gestures like "Fist", we might want to keep it active.
      // For MVP, we'll just flash it.
    } else {
      setActiveKey(null);
    }
  };

  if (!profile) return null;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" /> EXIT SESSION
          </Button>
        </Link>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
             <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#00ff80]"></span>
             <span className="text-xs font-mono text-primary font-bold tracking-widest">SYSTEM ONLINE</span>
           </div>
           <h2 className="text-xl font-display font-bold uppercase">{profile.name}</h2>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Main Camera View */}
        <div className="lg:col-span-3 flex flex-col min-h-0 relative">
          <CameraFrame onGestureDetected={handleGesture} />
          
          {/* Heads Up Display Overlay on bottom of camera frame container */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-4 pointer-events-none">
             <div className="bg-black/80 backdrop-blur-md border border-primary/50 p-4 rounded-xl text-center min-w-[200px] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Detected Gesture</span>
                <span className={cn(
                  "text-2xl font-display font-bold uppercase transition-all duration-200",
                  currentGesture !== "None" ? "text-primary text-shadow-neon" : "text-muted-foreground"
                )}>
                  {currentGesture.replace('_', ' ')}
                </span>
             </div>

             {activeKey && (
               <div className="bg-primary/20 backdrop-blur-md border border-primary p-4 rounded-xl text-center min-w-[150px] animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <span className="text-[10px] text-primary-foreground uppercase tracking-widest block mb-1">Action Triggered</span>
                  <span className="text-3xl font-mono font-bold text-white uppercase flex items-center justify-center gap-2">
                    <Keyboard className="w-6 h-6" /> {activeKey}
                  </span>
               </div>
             )}
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="bg-card/30 border border-white/5 rounded-xl p-4 overflow-y-auto backdrop-blur-sm">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Active Mappings</h3>
          
          <div className="space-y-2">
            {Object.entries(profile.keyMappings).map(([gesture, key]) => (
              <div 
                key={gesture} 
                className={cn(
                  "p-3 rounded border transition-all duration-200 flex justify-between items-center",
                  currentGesture === gesture 
                    ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,255,128,0.2)]" 
                    : "bg-black/20 border-white/5"
                )}
              >
                <span className={cn(
                  "text-xs font-bold uppercase",
                  currentGesture === gesture ? "text-white" : "text-muted-foreground"
                )}>
                  {gesture.replace('_', ' ')}
                </span>
                <span className={cn(
                  "text-xs font-mono bg-black/40 px-2 py-1 rounded",
                   currentGesture === gesture ? "text-primary" : "text-muted-foreground"
                )}>
                  {key}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="text-xs text-primary font-bold uppercase mb-2">Debug Info</h4>
            <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
              <div className="flex justify-between">
                <span>FPS:</span>
                <span className="text-white">60</span>
              </div>
              <div className="flex justify-between">
                <span>Latency:</span>
                <span className="text-white">~15ms</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span className="text-white">98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
