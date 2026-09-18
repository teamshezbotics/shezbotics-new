"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AttendanceState = { ok: boolean; message?: string };

/** Saves a whole session's attendance in one round trip. */
export async function saveAttendance(
  _prev: AttendanceState,
  formData: FormData,
): Promise<AttendanceState> {
  await requireAdmin();

  const sessionId = String(formData.get("session_id") ?? "");
  const participantIds = formData.getAll("participant_id").map(String);

  if (!sessionId || participantIds.length === 0) {
    return { ok: false, message: "Pick a session first." };
  }

  const rows = participantIds.map((participantId) => ({
    session_id: sessionId,
    participant_id: participantId,
    present: formData.get(`present_${participantId}`) === "true",
  }));

  const supabase = await createClient();
  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "session_id,participant_id" });

  if (error) {
    return { ok: false, message: "Could not save attendance. Please try again." };
  }

  if (formData.get("mark_completed") === "on") {
    await supabase
      .from("sessions")
      .update({ status: "Completed" })
      .eq("id", sessionId);
  }

  revalidatePath("/attendance");
  revalidatePath("/sessions");
  revalidatePath("/");
  return { ok: true, message: "Saved." };
}
