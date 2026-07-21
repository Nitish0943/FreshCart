"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { useRegisterMutation } from "@/hooks/use-auth-queries";

const registerFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number"),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  const loading = registerMutation.isPending;
  const error = registerMutation.error?.message;

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-emerald-50 via-background to-background p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-emerald-100 bg-card p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Logo Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235A8.902 8.902 0 0 1 9 18c2.235 0 4.318.816 5.924 2.174m-11.916-1.5c.348-2.617 2.597-4.674 5.342-4.674h1.284c2.745 0 4.994 2.057 5.342 4.674m0 0c.092.688-.439 1.25-1.13 1.25H4.13c-.69 0-1.222-.562-1.13-1.25Z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Create Account</h2>
          <p className="text-sm text-muted-foreground">Sign up to get fresh food delivered to your door</p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 p-4 text-center text-sm font-semibold text-destructive">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">First Name</label>
              <Input
                placeholder="John"
                className="rounded-xl border-emerald-100/50 bg-background/50 focus-visible:ring-emerald-500"
                {...register("firstName")}
              />
              {errors.firstName && <p className="text-xs font-semibold text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Last Name</label>
              <Input
                placeholder="Doe"
                className="rounded-xl border-emerald-100/50 bg-background/50 focus-visible:ring-emerald-500"
                {...register("lastName")}
              />
              {errors.lastName && <p className="text-xs font-semibold text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Phone Number</label>
            <Input
              type="tel"
              placeholder="9876543210"
              className="rounded-xl border-emerald-100/50 bg-background/50 focus-visible:ring-emerald-500"
              {...register("phone")}
            />
            {errors.phone && <p className="text-xs font-semibold text-destructive">{errors.phone.message}</p>}
          </div>

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
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-emerald-50">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
