"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AssignmentState = { ok: boolean; message?: string };

/** Saves a whole session's assignments in one round trip. */
export async function saveAssignments(
  _prev: AssignmentState,
  formData: FormData,
): Promise<AssignmentState> {
  await requireAdmin();

  const sessionId = String(formData.get("session_id") ?? "");
  const participantIds = formData.getAll("participant_id").map(String);

  if (!sessionId || participantIds.length === 0) {
    return { ok: false, message: "Pick a session first." };
  }

  const rows = participantIds.map((id) => {
    const task = String(formData.get(`task_${id}`) ?? "").trim();
    const reviewed = String(formData.get(`reviewed_${id}`) ?? "").trim();
    const notes = String(formData.get(`notes_${id}`) ?? "").trim();

    return {
      session_id: sessionId,
      participant_id: id,
      task: task === "" ? null : task,
      completed: formData.get(`completed_${id}`) === "true",
      date_reviewed: reviewed === "" ? null : reviewed,
      notes: notes === "" ? null : notes,
    };
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignments")
    .upsert(rows, { onConflict: "session_id,participant_id" });

  if (error) {
    return { ok: false, message: "Could not save. Please try again." };
  }

  revalidatePath("/assignments");
  revalidatePath("/");
  return { ok: true, message: "Saved." };
}
