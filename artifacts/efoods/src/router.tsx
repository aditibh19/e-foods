import React from "react";
import { AppLayout } from "@/components/layout";
import { Route, Switch, Redirect } from "wouter";
import { useGetMe } from "@workspace/api-client-react";

import Home from "@/pages/home";
import Restaurants from "@/pages/restaurants";
import RestaurantDetail from "@/pages/restaurant-detail";
import Cart from "@/pages/cart";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth/login" />;
  }

  return <Component />;
}

export default function AppRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/restaurants" component={Restaurants} />
        <Route path="/restaurants/:id" component={RestaurantDetail} />
        <Route path="/cart">
          <ProtectedRoute component={Cart} />
        </Route>
        <Route path="/orders">
          <ProtectedRoute component={Orders} />
        </Route>
        <Route path="/orders/:id">
          <ProtectedRoute component={OrderDetail} />
        </Route>
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/register" component={Register} />
        <Route path="/profile">
          <ProtectedRoute component={Profile} />
        </Route>
        <Route path="/admin">
          <ProtectedRoute component={Admin} />
        </Route>

        <Route>
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          </div>
        </Route>
      </Switch>
    </AppLayout>
  );
}
