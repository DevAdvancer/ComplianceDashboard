import type { AdminUserAttributes, User } from "@supabase/supabase-js";

import type { UserRole } from "@/lib/types/app";
import { createAdminClient } from "@/lib/supabase/admin";

export type ManagedUserInput = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

export type ManagedUserImportRow = {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
};

export function normalizeUserRole(value?: string | null): UserRole | null {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return "Marketing";
  }

  if (normalized === "admin") {
    return "Admin";
  }

  if (normalized === "marketing") {
    return "Marketing";
  }

  return null;
}

export function createManagedUserPayload(input: ManagedUserInput): AdminUserAttributes {
  return {
    email: input.email.trim().toLowerCase(),
    password: input.password,
    email_confirm: true,
    app_metadata: {
      role: input.role,
    },
    user_metadata: {
      name: input.name.trim(),
    },
  };
}

export async function listAuthUsersByEmail() {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  return new Map(
    (data.users ?? [])
      .filter((user) => Boolean(user.email))
      .map((user) => [
        user.email!.toLowerCase(),
        {
          id: user.id,
          email: user.email ?? null,
        },
      ]),
  );
}

export async function createManagedUser(input: ManagedUserInput) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser(
    createManagedUserPayload(input),
  );

  if (error) {
    throw error;
  }

  return data.user;
}

export async function updateManagedUser(userId: string, input: ManagedUserInput) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.updateUserById(userId, {
    ...createManagedUserPayload(input),
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export function buildManagedUserInputFromRow(
  row: ManagedUserImportRow,
  rowNumber: number,
): ManagedUserInput {
  const email = row.email?.trim();
  const password = row.password?.trim();
  const name = row.name?.trim() || email?.split("@")[0] || "";
  const role = normalizeUserRole(row.role);

  if (!email) {
    throw new Error(`Row ${rowNumber}: email is required.`);
  }

  if (!password) {
    throw new Error(`Row ${rowNumber}: password is required.`);
  }

  if (password.length < 6) {
    throw new Error(`Row ${rowNumber}: password must be at least 6 characters.`);
  }

  if (!role) {
    throw new Error(`Row ${rowNumber}: role must be Admin or Marketing.`);
  }

  return {
    email,
    password,
    name,
    role,
  };
}

export function getUserDisplayName(user: User) {
  const metadataName = user.user_metadata?.name;

  if (typeof metadataName === "string" && metadataName.trim().length > 0) {
    return metadataName;
  }

  return user.email ?? user.id;
}
