import React, { useState } from "react";
import { Header } from "@/components/header";
import { SearchBar } from "@/components/search-bar";
import { RestaurantCard } from "@/components/restaurant-card";
import {
  useListRestaurants,
  useListMenuCategories,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function Restaurants() {

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const {
    data: restaurantsResponse,
    isLoading,
  } = useListRestaurants({
    search,
    category,
  });

  const {
    data: categoriesResponse,
    isLoading: isLoadingCats,
  } = useListMenuCategories();

  // ==============================
  // SAFE RESPONSE HANDLING
  // ==============================

  const restaurants = restaurantsResponse ?? [];
  const categories = categoriesResponse ?? [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Browse Restaurants"
        showBack
      />

      <div className="px-4 py-4 space-y-4">

        <SearchBar
          onSearch={setSearch}
          placeholder="Search restaurants..."
        />

        {/* CATEGORY FILTER */}
        <div
          className="
          flex
          gap-2
          overflow-x-auto
          pb-2
          "
        >
          <button
            onClick={() => setCategory("")}
            className={`
              px-4
              py-2
              rounded-full
              text-sm
              border
              whitespace-nowrap

              ${
                category === ""
                ? "bg-primary text-primary-foreground"
                : "bg-card"
              }
            `}
          >
            All
          </button>

          {
            isLoadingCats ? (
              <>
                {[1, 2, 3].map(i => (
                  <Skeleton
                    key={i}
                    className="
                    w-20
                    h-10
                    rounded-full
                    "
                  />
                ))}
              </>
            ) : (
              categories.map((cat: any) => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    border
                    whitespace-nowrap

                    ${
                      category === cat.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                    }
                  `}
                >
                  {cat.name}
                </button>
              ))
            )
          }
        </div>

        {/* RESTAURANTS LIST */}
        <div className="flex flex-col gap-4">
          {
            isLoading ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <Skeleton
                    key={i}
                    className="
                    h-[220px]
                    rounded-3xl
                    "
                  />
                ))}
              </>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No restaurants found.
                </p>
              </div>
            ) : (
              restaurants.map((restaurant: any) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                />
              ))
            )
          }
        </div>

      </div>
    </div>
  );
}