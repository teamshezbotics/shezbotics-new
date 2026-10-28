"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { ADOPTION_LEVELS } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { AdoptionLevel } from "@/lib/types";

export type AdoptionState = { ok: boolean; message?: string };

/** Splits the comma-separated tools field into a clean array. */
function parseTools(value: string): string[] {
  return value
    .split(",")
    .map((tool) => tool.trim())
    .filter(Boolean);
}

/** Saves every participant's adoption row in one round trip. */
export async function saveAdoption(
  _prev: AdoptionState,
  formData: FormData,
): Promise<AdoptionState> {
  await requireAdmin();

  const participantIds = formData.getAll("participant_id").map(String);
  if (participantIds.length === 0) {
    return { ok: false, message: "Nothing to save." };
  }

  const rows = participantIds.map((id) => {
    const level = String(formData.get(`level_${id}`) ?? "") as AdoptionLevel;
    const lastActive = String(formData.get(`last_active_${id}`) ?? "").trim();
    const notes = String(formData.get(`notes_${id}`) ?? "").trim();

    return {
      participant_id: id,
      level: ADOPTION_LEVELS.includes(level) ? level : "Not Started",
      primary_tools: parseTools(String(formData.get(`tools_${id}`) ?? "")),
      last_active: lastActive === "" ? null : lastActive,
      notes: notes === "" ? null : notes,
    };
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("tool_adoption")
    .upsert(rows, { onConflict: "participant_id" });

  if (error) {
    return { ok: false, message: "Could not save. Please try again." };
  }

  revalidatePath("/adoption");
  revalidatePath("/");
  return { ok: true, message: "Saved." };
}
