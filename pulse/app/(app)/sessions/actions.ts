"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { SESSION_STATUSES } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { SessionStatus } from "@/lib/types";

export type SaveState = { ok: boolean; message?: string };

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

/** Creates a session when `id` is absent, updates it when present. */
export async function saveSession(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  await requireAdmin();

  const id = text(formData, "id");
  const number = Number(formData.get("number"));
  const topic = text(formData, "topic");
  const status = String(formData.get("status")) as SessionStatus;
  const hoursRaw = text(formData, "hours");

  if (!Number.isInteger(number) || number < 1) {
    return { ok: false, message: "Session number must be a whole number." };
  }
  if (!topic) {
    return { ok: false, message: "Give the session a topic." };
  }
  if (!SESSION_STATUSES.includes(status)) {
    return { ok: false, message: "Pick a valid status." };
  }

  const row = {
    number,
    topic,
    status,
    date: text(formData, "date"),
    hours: hoursRaw === null ? null : Number(hoursRaw),
    notes: text(formData, "notes"),
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("sessions").update(row).eq("id", id)
    : await supabase.from("sessions").insert(row);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? `Session ${number} already exists.`
          : "Could not save. Please try again.",
    };
  }

  revalidatePath("/sessions");
  revalidatePath("/");
  revalidatePath("/attendance");
  return { ok: true };
}
