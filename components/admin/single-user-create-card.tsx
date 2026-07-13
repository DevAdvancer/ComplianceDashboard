"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

import { createSingleUserAction } from "@/app/actions";
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

export function SingleUserCreateCard() {
  const [state, formAction, isPending] = useActionState(
    createSingleUserAction,
    initialState,
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.success) {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
          <UserPlus className="size-5" />
        </div>
        <CardTitle>Add Single User</CardTitle>
        <CardDescription>
          Admin can create one Marketing or Admin account directly from the
          settings page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="single-user-name">Name</Label>
            <Input
              id="single-user-name"
              name="name"
              placeholder="User name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="single-user-email">Email</Label>
            <Input
              id="single-user-email"
              name="email"
              type="email"
              placeholder="user@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="single-user-password">Password</Label>
            <Input
              id="single-user-password"
              name="password"
              type="text"
              placeholder="Temporary password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="single-user-role">Role</Label>
            <select
              id="single-user-role"
              name="role"
              defaultValue="Marketing"
              className="flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20">
              <option value="Marketing">Marketing</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <Button type="submit" disabled={isPending}>
            <UserPlus className="size-4" />
            {isPending ? "Creating User..." : "Create User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
