import {
  createManagedUser,
  listAuthUsersByEmail,
  normalizeUserRole,
  updateManagedUser,
} from "../lib/admin/user-provisioning";

async function main() {
  const [, , email, password, nameArg, roleArg] = process.argv;

  if (!email || !password) {
    throw new Error(
      "Usage: bun run scripts/provision-auth-user.ts <email> <password> [name] [role]",
    );
  }

  const role = normalizeUserRole(roleArg ?? "Marketing");

  if (!role) {
    throw new Error("Role must be Admin or Marketing.");
  }

  const name = nameArg?.trim() || email.split("@")[0] || "User";
  const existingUsers = await listAuthUsersByEmail();
  const existingUser = existingUsers.get(email.toLowerCase());

  if (existingUser) {
    await updateManagedUser(existingUser.id, {
      email,
      password,
      name,
      role,
    });
    console.log(`Updated existing ${role} user: ${email}`);
    return;
  }

  await createManagedUser({
    email,
    password,
    name,
    role,
  });

  console.log(`Created ${role} user: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
