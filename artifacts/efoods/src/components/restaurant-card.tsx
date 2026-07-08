import React from "react";
import { Link } from "wouter";
import { Star, Clock, Bike } from "lucide-react";
import type { Restaurant } from "@workspace/api-client-react";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurants/${restaurant.id}`} className="block group">
      <div className="bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-border/50">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"} 
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-background text-foreground px-4 py-2 rounded-full font-semibold text-sm tracking-wide shadow-lg">Closed</span>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
            <span className="text-xs font-bold">{restaurant.rating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">({restaurant.reviewCount})</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-serif font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{restaurant.name}</h3>
            <span className="bg-muted text-muted-foreground text-[10px] px-2 py-1 rounded-md font-medium uppercase tracking-wider whitespace-nowrap">{restaurant.cuisine}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{restaurant.description}</p>
          
          <div className="flex items-center gap-4 text-xs font-medium text-foreground/80">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-primary" />
              <span>${restaurant.deliveryFee.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
