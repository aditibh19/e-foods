import React from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/header";
import {
  useGetCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  usePlaceOrder,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, MapPin, Receipt, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart({ query: { queryKey: ["cart"] } });
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const placeOrder = usePlaceOrder();

  const handleUpdateQuantity = (id: number, current: number, delta: number) => {
    const next = current + delta;
    if (next < 1) {
      handleRemove(id);
      return;
    }
    updateItem.mutate(
      { itemId: id, data: { quantity: next } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }) },
    );
  };

  const handleRemove = (id: number) => {
    removeItem.mutate(
      { itemId: id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }) },
    );
  };

  const handlePlaceOrder = async () => {
    if (!cart) return;

    const token = localStorage.getItem("efoods_token");
    if (!token) {
      toast({ title: "Please login to place an order", variant: "destructive" });
      setLocation("/auth/login");
      return;
    }

    try {
      // Step 1: create a Razorpay order on the backend
      const orderRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: cart.total }),
        },
      );

      if (!orderRes.ok) {
        toast({ title: "Could not start payment", variant: "destructive" });
        return;
      }

      const { orderId, amount, keyId } = await orderRes.json();

      // Step 2: open Razorpay checkout
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency: "INR",
        name: "eFoods",
        description: "Order payment",
        order_id: orderId,
        handler: (response: any) => {
          // Step 3: verify + place order on success
          placeOrder.mutate(
            {
              data: {
                deliveryAddress: "123 Food Street, NY",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            },
            {
              onSuccess: (order) => {
                toast({ title: "Order placed successfully!" });
                queryClient.invalidateQueries({ queryKey: ["cart"] });
                setLocation(`/orders/${order.id}`);
              },
              onError: () => {
                toast({ title: "Order could not be placed", variant: "destructive" });
              },
            },
          );
        },
        modal: {
          ondismiss: () => {
            toast({ title: "Payment cancelled", variant: "destructive" });
          },
        },
        theme: { color: "#000000" },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-4"><Skeleton className="h-[200px] rounded-3xl" /></div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Your Cart" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Receipt className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2">Cart is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-[250px]">Looks like you haven't added anything to your cart yet.</p>
          <Button onClick={() => setLocation("/restaurants")} className="rounded-full w-full py-6 text-lg font-bold">
            Start Ordering
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <Header
        title="Your Cart"
        rightAction={
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              clearCart.mutate(undefined, {
                onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
              })
            }
            className="text-destructive font-semibold"
          >
            Clear
          </Button>
        }
      />

      <div className="p-4 flex-1 pb-32">
        {/* Restaurant Header */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border mb-6">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Ordering from</p>
          <h2 className="font-serif font-bold text-xl">{cart.restaurantName}</h2>
        </div>

        {/* Items */}
        <div className="space-y-4 mb-8">
          {cart.items.map(item => (
            <div key={item.id} className="bg-card rounded-2xl p-4 shadow-sm border border-border flex gap-4">
              <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold leading-tight line-clamp-2">{item.name}</h4>
                    <p className="text-sm font-bold mt-1 text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="bg-muted rounded-full flex items-center p-1 border border-border/50">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                      className="w-7 h-7 flex items-center justify-center bg-card rounded-full shadow-sm text-foreground active:scale-95 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                      className="w-7 h-7 flex items-center justify-center bg-primary rounded-full shadow-sm text-primary-foreground active:scale-95 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Address */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-semibold">Delivery Address</h3>
          </div>
          <p className="text-sm text-muted-foreground pl-11">123 Food Street, Downtown NY, 10001</p>
        </div>

        {/* Bill Details */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border mb-4">
          <h3 className="font-semibold mb-4 border-b border-border/50 pb-2">Bill Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Item Total</span>
              <span className="font-medium text-foreground">${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span className="font-medium text-foreground">${cart.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground pt-3 border-t border-border/50">
              <span className="font-bold text-foreground">To Pay</span>
              <span className="font-bold text-lg text-primary">${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Footer */}
      <div className="fixed bottom-[90px] w-full max-w-[430px] p-4 bg-background border-t border-border shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40">
        <Button
          onClick={handlePlaceOrder}
          disabled={placeOrder.isPending}
          className="w-full py-6 text-lg font-bold rounded-2xl shadow-lg shadow-primary/30 flex justify-between px-6"
        >
          <span>${cart.total.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            Place Order <ArrowRight className="w-5 h-5" />
          </div>
        </Button>
      </div>
    </div>
  );
}