"use client";

import { useActionState, useState } from "react";
import type { Assignment, Participant, TrainingSession } from "@/lib/types";
import { saveAssignments, type AssignmentState } from "./actions";

const initial: AssignmentState = { ok: false };

type Row = {
  task: string;
  completed: boolean;
  reviewed: string;
  notes: string;
};

export default function AssignmentsForm({
  session,
  participants,
  existing,
}: {
  session: TrainingSession;
  participants: Participant[];
  existing: Record<string, Assignment>;
}) {
  const [rows, setRows] = useState<Record<string, Row>>(() =>
    Object.fromEntries(
      participants.map((p) => [
        p.id,
        {
          task: existing[p.id]?.task ?? "",
          completed: existing[p.id]?.completed ?? false,
          reviewed: existing[p.id]?.date_reviewed ?? "",
          notes: existing[p.id]?.notes ?? "",
        },
      ]),
    ),
  );
  const [sharedTask, setSharedTask] = useState("");
  const [state, action, pending] = useActionState(saveAssignments, initial);

  const update = (id: string, patch: Partial<Row>) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  /** Most sessions set one task for the whole cohort — this fills it in once. */
  const applyTaskToAll = () => {
    if (!sharedTask.trim()) return;
    setRows((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, row]) => [
          id,
          { ...row, task: sharedTask.trim() },
        ]),
      ),
    );
  };

  const markAllComplete = () => {
    const today = new Date().toISOString().slice(0, 10);
    setRows((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, row]) => [
          id,
          { ...row, completed: true, reviewed: row.reviewed || today },
        ]),
      ),
    );
  };

  const doneCount = participants.filter((p) => rows[p.id].completed).length;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="session_id" value={session.id} />

      <div className="rounded-xl border border-line bg-white p-3">
        <label className="block text-sm">
          <span className="text-ink-soft">Set the same task for everyone</span>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={sharedTask}
              onChange={(event) => setSharedTask(event.target.value)}
              placeholder="e.g. Draft one client proposal with AI"
            />
            <button
              type="button"
              onClick={applyTaskToAll}
              className="shrink-0 rounded-lg border border-line px-3 py-2 text-sm text-ink-soft hover:text-navy"
            >
              Apply
            </button>
          </div>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-soft">
          <span className="font-medium text-navy">{doneCount}</span> of{" "}
          {participants.length} complete
        </p>
        <button
          type="button"
          onClick={markAllComplete}
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink-soft hover:text-navy"
        >
          Mark all complete
        </button>
      </div>

      <ul className="space-y-3">
        {participants.map((participant) => {
          const row = rows[participant.id];
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
              <input
                type="hidden"
                name={`completed_${participant.id}`}
                value={String(row.completed)}
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-navy">{participant.name}</p>
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    checked={row.completed}
                    onChange={(event) =>
                      update(participant.id, {
                        completed: event.target.checked,
                        reviewed:
                          event.target.checked && !row.reviewed
                            ? new Date().toISOString().slice(0, 10)
                            : row.reviewed,
                      })
                    }
                    className="size-4 accent-[var(--accent)]"
                  />
                  Completed
                </label>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="text-ink-soft">Task</span>
                  <input
                    type="text"
                    name={`task_${participant.id}`}
                    value={row.task}
                    onChange={(event) =>
                      update(participant.id, { task: event.target.value })
                    }
                    className="mt-1"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-ink-soft">Date reviewed</span>
                  <input
                    type="date"
                    name={`reviewed_${participant.id}`}
                    value={row.reviewed}
                    onChange={(event) =>
                      update(participant.id, { reviewed: event.target.value })
                    }
                    className="mt-1"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-ink-soft">Notes</span>
                  <input
                    type="text"
                    name={`notes_${participant.id}`}
                    value={row.notes}
                    onChange={(event) =>
                      update(participant.id, { notes: event.target.value })
                    }
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
          {pending ? "Saving…" : "Save assignments"}
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
