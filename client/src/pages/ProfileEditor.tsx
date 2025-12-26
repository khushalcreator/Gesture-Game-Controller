import { useGameProfile, useUpdateGameProfile } from "@/hooks/use-game-profiles";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { ChevronLeft, Save, Trash2, PlusCircle, Keyboard, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameProfileSchema, type InsertGameProfile } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type GestureType } from "@/lib/gesture-recognition";

// Available gestures for mapping
const AVAILABLE_GESTURES: GestureType[] = [
  "Open_Palm", "Closed_Fist", "Pointing_Up", "Victory", "Thumb_Up", "Thumb_Down", "Rock_Sign"
];

const AVAILABLE_KEYS = [
  "Space", "Enter", "W", "A", "S", "D", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Shift", "Control", "MouseLeft"
];

export default function ProfileEditor() {
  const [, params] = useRoute("/profile/:id");
  const id = parseInt(params?.id || "0");
  const { data: profile, isLoading } = useGameProfile(id);
  const updateMutation = useUpdateGameProfile();

  const form = useForm<InsertGameProfile>({
    resolver: zodResolver(insertGameProfileSchema.omit({ userId: true })),
    defaultValues: {
      name: "",
      description: "",
      keyMappings: {},
      settings: { sensitivity: 1, smoothFactor: 0.5 }
    }
  });

  // Load data into form when fetched
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        description: profile.description || "",
        keyMappings: profile.keyMappings,
        settings: profile.settings
      });
    }
  }, [profile, form]);

  // Handle Key Mappings as an array for easier UI rendering, then convert back to object
  const [mappings, setMappings] = useState<{ gesture: string; key: string }[]>([]);

  useEffect(() => {
    if (profile?.keyMappings) {
      setMappings(
        Object.entries(profile.keyMappings).map(([gesture, key]) => ({
          gesture,
          key: String(key)
        }))
      );
    }
  }, [profile]);

  const addMapping = () => {
    setMappings([...mappings, { gesture: AVAILABLE_GESTURES[0], key: AVAILABLE_KEYS[0] }]);
  };

  const removeMapping = (index: number) => {
    const newMappings = [...mappings];
    newMappings.splice(index, 1);
    setMappings(newMappings);
  };

  const updateMapping = (index: number, field: 'gesture' | 'key', value: string) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setMappings(newMappings);
  };

  const onSubmit = (data: any) => {
    // Convert array back to object
    const keyMappings = mappings.reduce((acc, curr) => {
      acc[curr.gesture] = curr.key;
      return acc;
    }, {} as Record<string, string>);

    updateMutation.mutate({
      id,
      ...data,
      keyMappings
    });
  };

  if (isLoading) {
    return <div className="text-center py-20 text-primary animate-pulse font-mono">LOADING CONFIGURATION...</div>;
  }

  if (!profile) {
    return <div className="text-center py-20 text-destructive">PROFILE NOT FOUND</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-white uppercase tracking-wider">
            CONFIG: <span className="text-primary">{profile.name}</span>
          </h1>
          <p className="text-sm text-muted-foreground font-mono">System ID: {profile.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="bg-card/40 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-display text-white mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> GENERAL SETTINGS
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PROFILE NAME</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DESCRIPTION</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-card/40 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-display text-white flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-primary" /> NEURAL MAPPING
                  </h3>
                  <Button type="button" variant="neon" size="sm" onClick={addMapping} className="text-xs h-8">
                    <PlusCircle className="w-3 h-3 mr-2" /> ADD LINK
                  </Button>
                </div>
                
                {mappings.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded bg-white/5 text-muted-foreground text-sm">
                    No active neural links. Add a gesture mapping to begin.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mappings.map((mapping, index) => (
                      <div key={index} className="flex gap-4 items-center bg-black/40 p-3 rounded border border-white/5 hover:border-primary/30 transition-colors">
                        <div className="flex-1">
                          <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Gesture</label>
                          <Select 
                            value={mapping.gesture} 
                            onValueChange={(val) => updateMapping(index, 'gesture', val)}
                          >
                            <SelectTrigger className="h-9 border-white/10 bg-card">
                              <SelectValue placeholder="Select Gesture" />
                            </SelectTrigger>
                            <SelectContent>
                              {AVAILABLE_GESTURES.map(g => (
                                <SelectItem key={g} value={g}>{g.replace('_', ' ')}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-center pt-5 text-muted-foreground">→</div>
                        
                        <div className="flex-1">
                          <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Input Action</label>
                          <Select 
                            value={mapping.key} 
                            onValueChange={(val) => updateMapping(index, 'key', val)}
                          >
                            <SelectTrigger className="h-9 border-white/10 bg-card">
                              <SelectValue placeholder="Select Key" />
                            </SelectTrigger>
                            <SelectContent>
                              {AVAILABLE_KEYS.map(k => (
                                <SelectItem key={k} value={k}>{k}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="mt-5 text-muted-foreground hover:text-destructive h-9 w-9"
                          onClick={() => removeMapping(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={updateMutation.isPending}>
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? "SAVING CONFIGURATION..." : "SAVE CONFIGURATION"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Sensitivity / Advanced Panel */}
        <div className="space-y-6">
           <div className="bg-card/40 border border-white/5 rounded-xl p-6 backdrop-blur-sm sticky top-24">
              <h3 className="text-lg font-display text-white mb-6 text-neon-cyan">CALIBRATION</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Recognition Confidence</label>
                    <span className="text-xs text-primary font-mono">{form.watch('settings.sensitivity') || 1}x</span>
                  </div>
                  <Slider 
                    defaultValue={[1]} 
                    max={2} 
                    step={0.1}
                    value={[form.watch('settings.sensitivity') || 1]}
                    onValueChange={(vals) => form.setValue('settings.sensitivity', vals[0])}
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Adjusts how strictly gestures are matched. Lower values are stricter.
                  </p>
                </div>

                <div>
                   <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Smooth Factor</label>
                    <span className="text-xs text-primary font-mono">{form.watch('settings.smoothFactor') || 0.5}</span>
                  </div>
                  <Slider 
                    defaultValue={[0.5]} 
                    max={1} 
                    step={0.1}
                    value={[form.watch('settings.smoothFactor') || 0.5]}
                    onValueChange={(vals) => form.setValue('settings.smoothFactor', vals[0])}
                  />
                   <p className="text-[10px] text-muted-foreground mt-2">
                    Higher values reduce jitter but add slight latency.
                  </p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
