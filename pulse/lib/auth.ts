import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * The signed-in user plus their Pulse profile. A user without a profile row
 * has no access at all — RLS denies them every table — so treat it as a
 * failed sign-in rather than a half-logged-in state.
 */
export async function getCurrentProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) redirect("/login?error=link");

  return profile;
}

/** Guard for the admin-only write paths. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    throw new Error("Not authorised: this account is read-only.");
  }
  return profile;
}
