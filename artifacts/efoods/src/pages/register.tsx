import React from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional()
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const register = useRegister();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", phone: "" }
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    register.mutate({ data }, {
      onSuccess: (res) => {
        localStorage.setItem("efoods_token", res.token);
        setAuthTokenGetter(() => localStorage.getItem("efoods_token") || "");
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        toast({ title: "Account created successfully!" });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Registration failed", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-background flex flex-col justify-end">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-primary-foreground">
        <h1 className="font-serif text-3xl font-bold mb-1">Create Account</h1>
        <p className="text-white/80">Join the eFoods community.</p>
      </div>

      <div className="bg-card w-full rounded-t-[40px] p-8 shadow-2xl pt-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="h-14 rounded-2xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Phone (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8900" className="h-14 rounded-2xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" {...field} />
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

            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/30 mt-6" disabled={register.isPending}>
              {register.isPending ? "Creating..." : "Sign Up"}
            </Button>
          </form>
        </Form>
        
        <p className="text-center text-sm mt-8 text-muted-foreground font-medium">
          Already have an account? <Link href="/auth/login" className="text-primary font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
}
