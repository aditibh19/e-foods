import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Compass, ShoppingCart, Clock, User, Shield } from "lucide-react";
import { useGetCart, useGetMe } from "@workspace/api-client-react";

export function BottomNav() {
  const [location] = useLocation();
  const { data: cart } = useGetCart({ query: { queryKey: ["cart"] } });
  const { data: user } = useGetMe({ query: { queryKey: ["auth"] } });

  const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const isActive = (path: string) => {
    if (path === "/" && location !== "/") return false;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] mx-auto bg-card border-t border-border z-50 px-6 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl">
      <Link href="/" className="flex flex-col items-center gap-1 group">
        <div className={`p-2 rounded-xl transition-colors ${isActive("/") ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
          <Home className="w-6 h-6" strokeWidth={isActive("/") ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] font-medium ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}>Home</span>
      </Link>

      <Link href="/restaurants" className="flex flex-col items-center gap-1 group">
        <div className={`p-2 rounded-xl transition-colors ${isActive("/restaurants") ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
          <Compass className="w-6 h-6" strokeWidth={isActive("/restaurants") ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] font-medium ${isActive("/restaurants") ? "text-primary" : "text-muted-foreground"}`}>Browse</span>
      </Link>

      <Link href="/cart" className="flex flex-col items-center gap-1 group relative -mt-5">
        <div className={`p-4 rounded-full shadow-lg transition-transform active:scale-95 ${isActive("/cart") ? "bg-primary text-primary-foreground shadow-primary/30" : "bg-card text-foreground"}`}>
          <ShoppingCart className="w-6 h-6" strokeWidth={2.5} />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 bg-secondary text-secondary-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-card">
              {totalItems}
            </span>
          )}
        </div>
        <span className={`text-[10px] font-medium mt-1 ${isActive("/cart") ? "text-primary" : "text-muted-foreground"}`}>Cart</span>
      </Link>

      <Link href="/orders" className="flex flex-col items-center gap-1 group">
        <div className={`p-2 rounded-xl transition-colors ${isActive("/orders") ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
          <Clock className="w-6 h-6" strokeWidth={isActive("/orders") ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] font-medium ${isActive("/orders") ? "text-primary" : "text-muted-foreground"}`}>Orders</span>
      </Link>

      {user?.role === "admin" ? (
        <Link href="/admin" className="flex flex-col items-center gap-1 group">
          <div className={`p-2 rounded-xl transition-colors ${isActive("/admin") ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
            <Shield className="w-6 h-6" strokeWidth={isActive("/admin") ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-medium ${isActive("/admin") ? "text-primary" : "text-muted-foreground"}`}>Admin</span>
        </Link>
      ) : (
        <Link href="/profile" className="flex flex-col items-center gap-1 group">
          <div className={`p-2 rounded-xl transition-colors ${isActive("/profile") ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
            <User className="w-6 h-6" strokeWidth={isActive("/profile") ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-medium ${isActive("/profile") ? "text-primary" : "text-muted-foreground"}`}>Profile</span>
        </Link>
      )}
    </nav>
  );
}
