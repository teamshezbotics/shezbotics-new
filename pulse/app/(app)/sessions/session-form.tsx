"use client";

import { useActionState } from "react";
import { SESSION_STATUSES } from "@/lib/config";
import type { TrainingSession } from "@/lib/types";
import { saveSession, type SaveState } from "./actions";

const initial: SaveState = { ok: false };

export default function SessionForm({
  session,
  nextNumber,
  onDone,
}: {
  session?: TrainingSession;
  nextNumber?: number;
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (prev: SaveState, formData: FormData) => {
      const result = await saveSession(prev, formData);
      if (result.ok) onDone?.();
      return result;
    },
    initial,
  );

  return (
    <form action={action} className="space-y-3">
      {session && <input type="hidden" name="id" value={session.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-ink-soft">Session number</span>
          <input
            name="number"
            type="number"
            min={1}
            required
            defaultValue={session?.number ?? nextNumber}
            className="mt-1"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-soft">Date</span>
          <input
            name="date"
            type="date"
            defaultValue={session?.date ?? ""}
            className="mt-1"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-ink-soft">Topic</span>
          <input
            name="topic"
            type="text"
            required
            defaultValue={session?.topic ?? ""}
            className="mt-1"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-soft">Hours</span>
          <input
            name="hours"
            type="number"
            step="0.5"
            min={0}
            defaultValue={session?.hours ?? ""}
            className="mt-1"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-soft">Status</span>
          <select
            name="status"
            defaultValue={session?.status ?? "Upcoming"}
            className="mt-1"
          >
            {SESSION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-ink-soft">Notes</span>
          <textarea
            name="notes"
            rows={2}
            defaultValue={session?.notes ?? ""}
            className="mt-1"
          />
        </label>
      </div>

      {state.message && (
        <p className="text-sm text-bad" role="alert">
          {state.message}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : session ? "Save changes" : "Add session"}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-line px-4 py-2 text-sm text-ink-soft hover:bg-white"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
