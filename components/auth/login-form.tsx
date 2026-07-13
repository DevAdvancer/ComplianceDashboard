"use client";

import { useActionState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { loginAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = {
  success: false,
  message: "",
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  useEffect(() => {
    if (state.message) {
      toast.error(state.message);
    }
  }, [state.message]);

  return (
    <Card className="w-full max-w-md overflow-hidden">
      <CardHeader className="border-b border-white/10 bg-white/[0.02]">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-200">
          <ShieldCheck className="size-6" />
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in with the account provisioned by your Supabase administrator.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
