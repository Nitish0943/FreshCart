"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useLoginMutation } from "@/hooks/use-auth-queries";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const loginMutation = useLoginMutation(redirectPath);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const loading = loginMutation.isPending;
  const error = loginMutation.error?.message;

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-emerald-50 via-background to-background p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-emerald-100 bg-card p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Logo Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome Back</h2>
          <p className="text-sm text-muted-foreground">Sign in to order your fresh groceries</p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 p-4 text-center text-sm font-semibold text-destructive">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Email Address</label>
            <Input
              type="email"
              placeholder="name@example.com"
              className="rounded-xl border-emerald-100/50 bg-background/50 focus-visible:ring-emerald-500"
              {...register("email")}
            />
            {errors.email && <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="rounded-xl border-emerald-100/50 bg-background/50 focus-visible:ring-emerald-500"
              {...register("password")}
            />
            {errors.password && <p className="text-xs font-semibold text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-6 shadow-lg shadow-emerald-600/10">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-emerald-50">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-emerald-600 hover:underline">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
