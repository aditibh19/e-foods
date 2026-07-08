import React, { useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Header } from "@/components/header";
import { useGetRestaurant, useGetRestaurantMenu, useAddCartItem } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Clock, Bike, Info, ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem } from "@workspace/api-client-react";

function MenuItemCard({ item, onAdd }: { item: MenuItem, onAdd: (id: number) => void }) {
  return (
    <div className="flex gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm mb-4">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${item.isVeg ? "border-green-600" : "border-red-600"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`}></div>
            </div>
            {item.isBestseller && (
              <span className="text-[9px] font-bold uppercase tracking-wider bg-secondary/20 text-secondary px-1.5 py-0.5 rounded">Bestseller</span>
            )}
          </div>
        </div>
        <h4 className="font-semibold text-[15px] leading-tight mb-1">{item.name}</h4>
        <p className="text-sm font-bold mb-2">${item.price.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
      </div>
      
      <div className="relative">
        <img 
          src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
          alt={item.name} 
          className="w-24 h-24 rounded-xl object-cover"
        />
        <button 
          onClick={() => onAdd(item.id)}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground shadow-lg px-4 py-1.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform flex items-center gap-1"
        >
          Add <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: restaurant, isLoading: isLoadingRest } = useGetRestaurant(Number(id));
  const { data: menu, isLoading: isLoadingMenu } = useGetRestaurantMenu(Number(id));
  const addCart = useAddCartItem();

  const handleAddToCart = (menuItemId: number) => {
    addCart.mutate({ data: { menuItemId, quantity: 1 } }, {
      onSuccess: () => {
        toast({ title: "Added to cart" });
      },
      onError: (err: any) => {
        if (err?.message?.includes("different restaurant")) {
          toast({ 
            title: "Clear cart first", 
            description: "You have items from another restaurant. Please clear your cart.",
            variant: "destructive"
          });
        }
      }
    });
  };

  if (isLoadingRest) return <div className="p-4"><Skeleton className="h-[300px] w-full rounded-3xl" /></div>;
  if (!restaurant) return <div className="p-4">Restaurant not found</div>;

  // Group menu by category
  const categories = menu ? [...new Set(menu.map(item => item.category))] : [];
  const menuByCategory = categories.map(cat => ({
    name: cat,
    items: menu!.filter(i => i.category === cat)
  }));

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="relative h-[250px] bg-black">
        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover opacity-80" />
        
        <header className="absolute top-0 w-full px-4 pt-4 flex justify-between items-center z-10">
          <Button variant="secondary" size="icon" className="rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white/30" onClick={() => setLocation("..")}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white text-sm font-bold border border-white/20">
            <Star className="w-4 h-4 fill-secondary text-secondary" />
            {restaurant.rating.toFixed(1)} <span className="font-normal opacity-80 text-xs">({restaurant.reviewCount})</span>
          </div>
        </header>

        <div className="absolute -bottom-6 w-full px-4">
          <div className="bg-card rounded-3xl p-5 shadow-lg border border-border/50 text-center relative overflow-hidden">
            {!restaurant.isOpen && (
              <div className="absolute top-0 inset-x-0 bg-destructive/10 text-destructive text-xs font-bold py-1 uppercase tracking-wider">
                Currently Closed
              </div>
            )}
            <h1 className="font-serif text-2xl font-bold mb-1 mt-1">{restaurant.name}</h1>
            <p className="text-muted-foreground text-sm mb-4">{restaurant.cuisine}</p>
            
            <div className="flex justify-center items-center gap-6 divide-x divide-border">
              <div className="flex flex-col items-center px-4">
                <Clock className="w-5 h-5 text-primary mb-1" />
                <span className="text-sm font-semibold">{restaurant.deliveryTime}</span>
              </div>
              <div className="flex flex-col items-center px-4">
                <Bike className="w-5 h-5 text-primary mb-1" />
                <span className="text-sm font-semibold">${restaurant.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-center px-4">
                <Info className="w-5 h-5 text-primary mb-1" />
                <span className="text-sm font-semibold">Min ${restaurant.minOrder}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-12 mb-6">
        {/* Menu Navigation */}
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar sticky top-[60px] z-30 bg-muted/30 pt-2 backdrop-blur-md -mx-4 px-4">
          {categories.map((cat, i) => (
            <a key={cat} href={`#cat-${i}`} className="px-4 py-2 bg-card rounded-full text-sm font-medium shadow-sm border border-border/50 whitespace-nowrap active:bg-primary active:text-primary-foreground">
              {cat}
            </a>
          ))}
        </div>

        {/* Menu Items */}
        <div className="mt-4">
          {isLoadingMenu ? (
            <Skeleton className="h-[200px] rounded-xl" />
          ) : (
            menuByCategory.map((category, i) => (
              <div key={category.name} id={`cat-${i}`} className="mb-8 scroll-mt-24">
                <h3 className="font-bold text-xl mb-4 font-serif">{category.name}</h3>
                {category.items.map(item => (
                  <MenuItemCard key={item.id} item={item} onAdd={handleAddToCart} />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
