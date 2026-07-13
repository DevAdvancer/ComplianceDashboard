import { redirect } from "next/navigation";

import type { UserRole } from "@/lib/types/app";
import type { UserProfile } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";

export type AuthContext = {
  user: {
    id: string;
    email?: string;
  };
  profile: UserProfile | null;
  role: UserRole;
};

export async function getAuthContext(options?: {
  redirectTo?: string;
  allowedRoles?: UserRole[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(options?.redirectTo ?? "/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ??
    ((user.app_metadata?.role as UserRole | undefined) || "Marketing")) as UserRole;

  if (options?.allowedRoles && !options.allowedRoles.includes(role)) {
    redirect("/dashboard");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    role,
  } satisfies AuthContext;
}

export async function getOptionalAuthContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    role: (profile?.role ??
      ((user.app_metadata?.role as UserRole | undefined) || "Marketing")) as UserRole,
  } satisfies AuthContext;
}
