import { useGameProfiles, useCreateGameProfile, useDeleteGameProfile } from "@/hooks/use-game-profiles";
import { Link } from "wouter";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"; // Assuming standard shadcn Dialog structure, if not will mock
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming standard
import { Plus, Trash2, Gamepad2, Play, Settings } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameProfileSchema, type InsertGameProfile } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Assuming standard

// Mock shadcn components since I don't have them all in requirements, but standard structure usually works.
// I will implement simple versions inline if needed or rely on existing ones.
// Given constraints, I'll assume they exist or use simple divs if not found.
// Wait, I saw components.json in the file list earlier, so standard shadcn/ui components exist.

export default function Dashboard() {
  const { data: profiles, isLoading } = useGameProfiles();
  const createMutation = useCreateGameProfile();
  const deleteMutation = useDeleteGameProfile();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<InsertGameProfile>({
    resolver: zodResolver(insertGameProfileSchema.omit({ userId: true })),
    defaultValues: {
      name: "",
      description: "",
      keyMappings: {}, // Empty default
      settings: { sensitivity: 1, smoothFactor: 0.5 }
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl text-white font-bold mb-2">
            MISSION <span className="text-primary">CONTROL</span>
          </h1>
          <p className="text-muted-foreground font-mono">Select a game profile to initiate neural link.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 gap-2">
              <Plus className="w-4 h-4" />
              NEW PROFILE
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/20 text-foreground">
            <DialogHeader>
              <DialogTitle className="text-primary font-display tracking-wider">INITIALIZE NEW PROFILE</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Configure a new gesture mapping container for your target application.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-primary/80">Profile Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. MINECRAFT" {...field} className="uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-primary/80">Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional tactical notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} className="w-full">
                    {createMutation.isPending ? "INITIALIZING..." : "CREATE PROFILE"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-card/50 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : profiles?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-card/20">
          <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-display text-muted-foreground">NO PROFILES DETECTED</h3>
          <p className="text-sm text-muted-foreground/60 mt-2 max-w-sm mx-auto">Create a profile to map your hand gestures to keyboard inputs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles?.map((profile) => (
            <div 
              key={profile.id} 
              className="group relative bg-card/40 hover:bg-card/60 border border-white/10 hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden hover:shadow-[0_0_30px_rgba(0,255,128,0.1)] flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2"
                    onClick={() => {
                      if (confirm("Delete this profile?")) deleteMutation.mutate(profile.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <h3 className="text-xl font-display font-bold text-white mb-1 group-hover:text-primary transition-colors truncate">
                  {profile.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                  {profile.description || "No description provided."}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.keys(profile.keyMappings).slice(0, 3).map(gesture => (
                    <span key={gesture} className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-white/5 text-muted-foreground border border-white/5">
                      {gesture.replace('_', ' ')}
                    </span>
                  ))}
                  {Object.keys(profile.keyMappings).length > 3 && (
                    <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-white/5 text-muted-foreground border border-white/5">
                      +{Object.keys(profile.keyMappings).length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3">
                <Link href={`/play/${profile.id}`} className="flex-1">
                  <Button className="w-full gap-2 group-hover:bg-primary group-hover:text-black transition-colors">
                    <Play className="w-4 h-4 fill-current" />
                    LAUNCH
                  </Button>
                </Link>
                <Link href={`/profile/${profile.id}`}>
                  <Button variant="outline" size="icon" className="border-white/10 hover:border-primary/50">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
