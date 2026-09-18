"use client";

import { useActionState } from "react";
import { ADOPTION_LEVELS } from "@/lib/config";
import type { Participant, ToolAdoption } from "@/lib/types";
import { saveAdoption, type AdoptionState } from "./actions";

const initial: AdoptionState = { ok: false };

export default function AdoptionForm({
  participants,
  adoption,
}: {
  participants: Participant[];
  adoption: Record<string, ToolAdoption>;
}) {
  const [state, action, pending] = useActionState(saveAdoption, initial);

  return (
    <form action={action} className="space-y-3">
      <ul className="space-y-3">
        {participants.map((participant) => {
          const row = adoption[participant.id];
          return (
            <li
              key={participant.id}
              className="rounded-xl border border-line bg-white p-3 sm:p-4"
            >
              <input
                type="hidden"
                name="participant_id"
                value={participant.id}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-navy">{participant.name}</p>
                <p className="text-xs text-ink-muted">
                  {participant.track}
                  {participant.role ? ` · ${participant.role}` : ""}
                </p>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-ink-soft">Adoption level</span>
                  <select
                    name={`level_${participant.id}`}
                    defaultValue={row?.level ?? "Not Started"}
                    className="mt-1"
                  >
                    {ADOPTION_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-ink-soft">Last active</span>
                  <input
                    type="date"
                    name={`last_active_${participant.id}`}
                    defaultValue={row?.last_active ?? ""}
                    className="mt-1"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-ink-soft">
                    Primary tools{" "}
                    <span className="text-ink-muted">(comma separated)</span>
                  </span>
                  <input
                    type="text"
                    name={`tools_${participant.id}`}
                    defaultValue={(row?.primary_tools ?? []).join(", ")}
                    placeholder="Claude, Excel Copilot"
                    className="mt-1"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-ink-soft">Notes</span>
                  <textarea
                    name={`notes_${participant.id}`}
                    rows={2}
                    defaultValue={row?.notes ?? ""}
                    className="mt-1"
                  />
                </label>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-line bg-card px-4 py-3 sm:-mx-5 sm:px-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save tool adoption"}
        </button>
        {state.message && (
          <p
            className={`text-sm ${state.ok ? "text-good" : "text-bad"}`}
            role="status"
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
