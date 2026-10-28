"use client";

import { useActionState, useState } from "react";
import type { Participant, TrainingSession } from "@/lib/types";
import { saveAttendance, type AttendanceState } from "./actions";

const initial: AttendanceState = { ok: false };

export default function AttendanceForm({
  session,
  participants,
  existing,
  alreadyMarked,
}: {
  session: TrainingSession;
  participants: Participant[];
  existing: Record<string, boolean>;
  alreadyMarked: boolean;
}) {
  // Default to present: after a real session, absences are the exception, so
  // this is usually a couple of taps and Save.
  const [present, setPresent] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      participants.map((p) => [p.id, existing[p.id] ?? true]),
    ),
  );
  const [state, action, pending] = useActionState(saveAttendance, initial);

  const setAll = (value: boolean) =>
    setPresent(Object.fromEntries(participants.map((p) => [p.id, value])));

  const presentCount = participants.filter((p) => present[p.id]).length;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="session_id" value={session.id} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-soft">
          <span className="font-medium text-navy">{presentCount}</span> of{" "}
          {participants.length} present
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAll(true)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink-soft hover:text-navy"
          >
            All present
          </button>
          <button
            type="button"
            onClick={() => setAll(false)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink-soft hover:text-navy"
          >
            All absent
          </button>
        </div>
      </div>

      <ul className="divide-y divide-line rounded-xl border border-line bg-white">
        {participants.map((participant) => (
          <li
            key={participant.id}
            className="flex items-center justify-between gap-3 px-3 py-2.5"
          >
            <input type="hidden" name="participant_id" value={participant.id} />
            <input
              type="hidden"
              name={`present_${participant.id}`}
              value={String(present[participant.id])}
            />
            <div className="min-w-0">
              <p className="truncate font-medium text-navy">
                {participant.name}
              </p>
              <p className="truncate text-xs text-ink-muted">
                {participant.track}
              </p>
            </div>
            <fieldset className="flex shrink-0 rounded-lg border border-line p-0.5">
              <legend className="sr-only">
                Attendance for {participant.name}
              </legend>
              {[true, false].map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  aria-pressed={present[participant.id] === value}
                  onClick={() =>
                    setPresent((prev) => ({ ...prev, [participant.id]: value }))
                  }
                  className={`min-w-[4.5rem] rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    present[participant.id] === value
                      ? value
                        ? "bg-navy text-white"
                        : "bg-bad text-white"
                      : "text-ink-muted"
                  }`}
                >
                  {value ? "Present" : "Absent"}
                </button>
              ))}
            </fieldset>
          </li>
        ))}
      </ul>

      {!alreadyMarked && session.status !== "Completed" && (
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="mark_completed"
            defaultChecked
            className="size-4 accent-[var(--accent)]"
          />
          Also mark session {session.number} as completed
        </label>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save attendance"}
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
