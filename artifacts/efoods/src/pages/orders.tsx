import React from "react";
import { Header } from "@/components/header";
import { useLocation } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Receipt,
  ChevronRight,
  CheckCircle2,
  Clock,
  Bike,
  Package,
} from "lucide-react";
import { format } from "date-fns";


const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "text-green-600 bg-green-100";
    case "cancelled":
      return "text-destructive bg-destructive/10";
    case "pending":
      return "text-secondary bg-secondary/10";
    default:
      return "text-primary bg-primary/10";
  }
};


const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle2 className="w-4 h-4" />;
    case "preparing":
      return <Package className="w-4 h-4" />;
    case "out_for_delivery":
      return <Bike className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

// Orders in these statuses are still "active" and worth polling for.
// Once every visible order is delivered/cancelled, polling backs off automatically.
const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery"];


export default function Orders() {

  const {
    data: ordersResponse,
    isLoading
  } = useListOrders({
    query: {
      queryKey: ["orders"],
      // Poll every 5s so status badges update live across the list.
      // If nothing is currently active (all delivered/cancelled), stop polling
      // to avoid wasting requests — refetchInterval receives the latest query data.
      refetchInterval: (query) => {
        const data = query.state.data as any[] | undefined;
        const hasActiveOrder = data?.some((o) => ACTIVE_STATUSES.includes(o.status));
        return hasActiveOrder ? 5000 : false;
      },
      // Keep polling even if the tab isn't focused isn't necessary here —
      // default (refetchIntervalInBackground: false) is fine for a food app.
    },
  });

  const [, setLocation] = useLocation();

  // ==============================
  // SAFE API RESPONSE HANDLING
  // ==============================

  const orders = ordersResponse ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">

      <Header
        title="Your Orders"
      />

      <div className="p-4 space-y-4 pb-8">

        {
          isLoading ? (
            <>
              {[1, 2, 3].map(i => (
                <Skeleton
                  key={i}
                  className="
                  h-[180px]
                  rounded-2xl
                  "
                />
              ))}
            </>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Receipt
                className="
                w-12
                h-12
                mx-auto
                text-muted-foreground
                mb-4
                "
              />
              <h3 className="font-semibold text-lg">
                No orders yet
              </h3>
              <p className="text-muted-foreground">
                When you place an order,
                it will appear here.
              </p>
            </div>
          ) : (
            orders.map((order: any) => (
              <div
                key={order.id}
                onClick={() => setLocation(`/orders/${order.id}`)}
                className="
                bg-card
                rounded-2xl
                p-5
                shadow-sm
                border
                cursor-pointer
                transition-shadow
                hover:shadow-md
                "
              >
                {/* HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      {order.restaurantName || "Restaurant"}
                    </h3>

                    {
                      order.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          {
                            format(
                              new Date(order.createdAt),
                              "MMM d, yyyy • h:mm a"
                            )
                          }
                        </p>
                      )
                    }
                  </div>

                  <div
                    className={`
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-bold
                    flex
                    items-center
                    gap-1
                    transition-colors
                    duration-500

                    ${getStatusColor(order.status)}
                    `}
                  >
                    {getStatusIcon(order.status)}
                    {order.status?.replace("_", " ")}
                    {ACTIVE_STATUSES.includes(order.status) && (
                      <span className="relative flex h-1.5 w-1.5 ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                      </span>
                    )}
                  </div>
                </div>

                {/* ITEMS */}
                <div
                  className="
                  border-y
                  py-3
                  mb-4
                  text-sm
                  "
                >
                  {
                    order.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="
                        flex
                        justify-between
                        "
                      >
                        <span>
                          {item.quantity} x {item.name}
                        </span>
                      </div>
                    ))
                  }
                </div>

                {/* FOOTER */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Paid
                    </p>
                    <p className="font-bold">
                      ₹{Number(order.total || 0).toFixed(2)}
                    </p>
                  </div>

                  <div
                    className="
                    w-8
                    h-8
                    rounded-full
                    bg-muted
                    flex
                    items-center
                    justify-center
                    "
                  >
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))
          )
        }

      </div>
    </div>
  );
}