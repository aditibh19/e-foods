import React from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone, LogOut, Settings, Heart, Bell, MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetMe({ query: { queryKey: ["auth"] } });
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("efoods_token");
        setAuthTokenGetter(() => "");
        queryClient.setQueryData(["auth"], null);
        setLocation("/auth/login");
      }
    });
  };

  if (isLoading) return <div className="p-4"><Skeleton className="h-[200px] rounded-3xl" /></div>;

  if (!user) {
    setLocation("/auth/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <Header title="Profile" />
      
      <div className="p-4 pb-8">
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-6 text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-[4px] border-card shadow-lg">
            <span className="text-3xl font-serif text-primary uppercase">{user.name.charAt(0)}</span>
          </div>
          <h2 className="text-2xl font-bold font-serif mb-1">{user.name}</h2>
          <div className="inline-block px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            {user.role}
          </div>
          
          <div className="flex flex-col gap-3 mt-4 text-left border-t border-border/50 pt-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-5 h-5 text-primary/70" />
              <span className="text-sm font-medium text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="w-5 h-5 text-primary/70" />
              <span className="text-sm font-medium text-foreground">{user.phone || "No phone added"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <button className="w-full bg-card rounded-2xl p-4 flex items-center justify-between shadow-sm border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-semibold">Saved Restaurants</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <button className="w-full bg-card rounded-2xl p-4 flex items-center justify-between shadow-sm border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-semibold">Delivery Addresses</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button className="w-full bg-card rounded-2xl p-4 flex items-center justify-between shadow-sm border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-semibold">Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-14 rounded-2xl border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold text-lg"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {logout.isPending ? "Logging out..." : "Log Out"}
        </Button>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
}
