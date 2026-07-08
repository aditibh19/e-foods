import React from "react";
import { useParams } from "wouter";
import { Header } from "@/components/header";
import { useGetOrder } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, MapPin, Map, Receipt, Phone, MessageCircle, Clock } from "lucide-react";
import { format } from "date-fns";

const STEPS = [
  { id: 'pending', label: 'Order Placed' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' }
];

// Orders in these statuses are still moving — worth polling for live updates.
const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery"];

export default function OrderDetail() {
  const { id } = useParams();

  const { data: order, isLoading } = useGetOrder(Number(id), {
    query: {
      queryKey: ["order", id],
      // Poll every 4s while the order is still active, so the tracker
      // advances live without the user refreshing. Stops automatically
      // once the order is delivered or cancelled.
      refetchInterval: (query) => {
        const data = query.state.data as { status?: string } | undefined;
        if (!data?.status) return 4000;
        return ACTIVE_STATUSES.includes(data.status) ? 4000 : false;
      },
    },
  });

  if (isLoading) return <div className="p-4"><Skeleton className="h-[400px] rounded-3xl" /></div>;
  if (!order) return <div className="p-4">Order not found</div>;

  const currentStepIndex = STEPS.findIndex(s => s.id === order.status);
  const isCancelled = order.status === 'cancelled';
  const isLive = ACTIVE_STATUSES.includes(order.status);

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <Header title={`Order #${order.id}`} showBack />
      
      <div className="p-4 pb-20">
        {/* Map Placeholder */}
        <div className="bg-card h-48 rounded-3xl mb-6 shadow-sm border border-border overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b')] bg-cover bg-center opacity-40 grayscale"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Map className="w-12 h-12 text-primary opacity-50" />
          </div>
          
          {order.status === 'out_for_delivery' && (
            <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl">🛵</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Driver</p>
                  <p className="font-bold text-sm">Raj Kumar</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-sm">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold font-serif mb-6">{order.restaurantName}</h1>

        {/* Tracker */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-6">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {isCancelled ? "Order Cancelled" : "Track Order"}
            {isLive && (
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
          </h3>
          
          {!isCancelled && (
            <div className="relative pl-3">
              {/* Line */}
              <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-muted"></div>
              <div 
                className="absolute left-[15px] top-3 w-0.5 bg-primary transition-all duration-700 ease-out" 
                style={{ height: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%` }}
              ></div>
              
              {STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.id} className="relative flex items-center mb-6 last:mb-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 bg-card transition-colors duration-500 ${isCompleted ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5 fill-primary text-card" /> : <Circle className="w-3 h-3 fill-current" />}
                    </div>
                    <div className="ml-4">
                      <p className={`font-semibold transition-colors duration-500 ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                      {isCurrent && index < STEPS.length - 1 && (
                        <p className="text-xs text-muted-foreground mt-0.5">Please wait...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          <h3 className="font-bold mb-4 border-b border-border/50 pb-2">Order Details</h3>
          
          <div className="space-y-3 mb-6">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex gap-3">
                  <span className="font-semibold w-5 text-primary">{item.quantity}x</span>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm border-t border-border/50 pt-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span>${order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-border/50">
              <span>Total</span>
              <span className="text-primary">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}