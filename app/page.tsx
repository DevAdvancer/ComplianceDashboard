import { redirect } from "next/navigation";

import { getOptionalAuthContext } from "@/lib/auth/session";

export default async function HomePage() {
  const auth = await getOptionalAuthContext();

  redirect(auth ? "/dashboard" : "/login");
}
