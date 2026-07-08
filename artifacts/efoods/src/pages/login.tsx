import React from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    login.mutate({ data }, {
      onSuccess: (res) => {
        localStorage.setItem("efoods_token", res.token);
        setAuthTokenGetter(() => localStorage.getItem("efoods_token") || "");
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        toast({ title: "Welcome back!" });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Invalid credentials", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-background flex flex-col justify-end">
      <div className="flex-1 flex items-center justify-center p-6 text-primary-foreground">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-xl">
            <span className="text-4xl">🥘</span>
          </div>
          <h1 className="font-serif text-4xl font-bold mb-2 tracking-tight">eFoods</h1>
          <p className="text-white/80">Delicious food, delivered fast.</p>
        </div>
      </div>

      <div className="bg-card w-full rounded-t-[40px] p-8 shadow-2xl pt-10">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Welcome Back</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" className="h-14 rounded-2xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-1">
              <span className="text-sm font-semibold text-primary">Forgot Password?</span>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/30 mt-4" disabled={login.isPending}>
              {login.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        
        <p className="text-center text-sm mt-8 text-muted-foreground font-medium">
          Don't have an account? <Link href="/auth/register" className="text-primary font-bold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
