import React from "react";
import { Header } from "@/components/header";
import { useGetDashboardSummary, useGetRecentOrders } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Users, Store, Receipt, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function Admin() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: recentOrders, isLoading: isOrdersLoading } = useGetRecentOrders();

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-10">
      <div className="bg-primary pt-10 pb-20 px-4 rounded-b-[40px] text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <Header title="Dashboard" transparent />
        <div className="mt-4 relative z-10">
          <p className="text-white/80 font-medium">Platform Overview</p>
          <h1 className="text-3xl font-serif font-bold mt-1">Hello, Admin</h1>
        </div>
      </div>

      <div className="px-4 -mt-12 relative z-20">
        {isSummaryLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-3xl p-5 shadow-lg border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold font-serif">{summary.totalOrders}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">Total Orders</p>
            </div>
            <div className="bg-card rounded-3xl p-5 shadow-lg border border-border">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mb-3">
                <Store className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-3xl font-bold font-serif">{summary.totalRestaurants}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">Restaurants</p>
            </div>
            <div className="bg-card rounded-3xl p-5 shadow-lg border border-border">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold font-serif">{summary.totalUsers}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">Users</p>
            </div>
            <div className="bg-card rounded-3xl p-5 shadow-lg border border-border">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold font-serif">{summary.popularCategories[0]?.category || 'N/A'}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">Top Category</p>
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          <h2 className="font-bold text-lg mb-4 font-serif">Recent Activity</h2>
          <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
            {isOrdersLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : recentOrders?.map((order, i) => (
              <div key={order.id} className={`p-4 flex items-center justify-between ${i !== 0 ? 'border-t border-border/50' : ''}`}>
                <div>
                  <p className="font-semibold text-sm">Order #{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.restaurantName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">${order.total.toFixed(2)}</p>
                  <p className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-full inline-block mt-1 font-bold uppercase">
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
