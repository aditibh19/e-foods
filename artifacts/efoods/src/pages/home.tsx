import React from "react";
import { Link } from "wouter";
import { RestaurantCard } from "@/components/restaurant-card";
import {
  useListRestaurants,
  useListMenuCategories,
  useGetFeaturedRestaurants,
} from "@workspace/api-client-react";
import { SearchBar } from "@/components/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  MapPin,
  ChevronDown,
  Bell,
  Utensils,
  Pizza,
  Coffee,
  Cake,
  IceCream,
  Sandwich,
  ChefHat,
  Flame,
  Apple,
  Soup,
} from "lucide-react";


export default function Home() {

  const {
    data: featuredResponse,
    isLoading: isLoadingFeatured,
  } = useGetFeaturedRestaurants();

  const {
    data: categoriesResponse,
    isLoading: isLoadingCategories,
  } = useListMenuCategories();

  const {
    data: restaurantsResponse,
    isLoading: isLoadingRestaurants,
  } = useListRestaurants();

  // ==============================
  // SAFE API RESPONSE HANDLING
  // ==============================

  const featured = featuredResponse ?? [];
  const categories = categoriesResponse ?? [];
  const restaurants = restaurantsResponse ?? [];

  // ==============================
  // ICON HANDLER
  // ==============================

  const renderIcon = (icon?: string) => {
    const icons: Record<string, React.ElementType> = {
      pizza: Pizza,
      coffee: Coffee,
      cake: Cake,
      "ice-cream": IceCream,
      burger: Sandwich,
      sandwich: Sandwich,
      "chef-hat": ChefHat,
      flame: Flame,
      soup: Soup,
      apple: Apple,
      utensils: Utensils,
    };

    const Icon = icons[icon || ""] || Utensils;

    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className="flex flex-col min-h-screen pb-6">

      {/* HERO */}
      <div className="
        bg-gradient-to-b 
        from-primary 
        via-primary/90 
        to-background 
        rounded-b-[40px]
        px-4
        pt-10
        pb-8
      ">
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-primary-foreground/80 text-xs">
              Delivering to
            </p>
            <div className="flex items-center text-primary-foreground font-semibold">
              <MapPin className="w-4 h-4 mr-1" />
              <span>123 Food Street, NY</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </div>
          </div>

          <button
            className="
            w-10 h-10
            rounded-full
            bg-white/20
            flex
            items-center
            justify-center
            "
          >
            <Bell className="w-5 h-5" />
          </button>
        </header>

        <h1 className="
          text-3xl
          font-bold
          text-primary-foreground
          mb-6
        ">
          What are you
          <br />
          craving today?
        </h1>

        <SearchBar
          onSearch={() => {}}
          placeholder="Search for food, restaurants..."
        />
      </div>

      {/* CATEGORIES */}
      <section className="px-4 mt-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-lg">Categories</h2>
          <Link href="/restaurants" className="text-primary text-sm">
            See all
          </Link>
        </div>

        {
          isLoadingCategories ? (
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton
                  key={i}
                  className="w-16 h-16 rounded-full"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto">
              {
                categories.map((cat: any) => (
                  <Link
                    key={cat.name}
                    href={`/restaurants?category=${cat.name}`}
                    className="
                    flex
                    flex-col
                    items-center
                    min-w-[72px]
                    "
                  >
                    <div
                      className="
                      w-16
                      h-16
                      rounded-2xl
                      border
                      flex
                      items-center
                      justify-center
                      "
                    >
                      {renderIcon(cat.icon)}
                    </div>
                    <span className="text-xs mt-2">{cat.name}</span>
                  </Link>
                ))
              }
            </div>
          )
        }
      </section>

      {/* FEATURED */}
      <section className="mt-6 px-4">
        <h2 className="font-bold text-lg mb-4">Featured Restaurants</h2>

        {
          isLoadingFeatured ? (
            <Skeleton className="h-[220px] rounded-3xl" />
          ) : (
            <div className="flex gap-4 overflow-x-auto">
              {
                featured.map((restaurant: any, index: number) => (
                  <motion.div
                    key={restaurant.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="min-w-[280px]"
                  >
                    <RestaurantCard restaurant={restaurant} />
                  </motion.div>
                ))
              }
            </div>
          )
        }
      </section>

      {/* ALL RESTAURANTS */}
      <section className="mt-6 px-4">
        <h2 className="font-bold text-lg mb-4">Nearby You</h2>

        {
          isLoadingRestaurants ? (
            <Skeleton className="h-[220px] rounded-3xl" />
          ) : (
            <div className="flex flex-col gap-4">
              {
                restaurants.map((restaurant: any) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                  />
                ))
              }
            </div>
          )
        }
      </section>

    </div>
  );
}