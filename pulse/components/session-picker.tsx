"use client";

import { useRouter } from "next/navigation";
import type { TrainingSession } from "@/lib/types";

/** Session chooser for the per-session screens; the URL carries the choice. */
export default function SessionPicker({
  sessions,
  selectedId,
  markedIds,
  basePath,
}: {
  sessions: TrainingSession[];
  selectedId: string;
  markedIds: string[];
  basePath: string;
}) {
  const router = useRouter();
  const marked = new Set(markedIds);

  return (
    <label className="block text-sm">
      <span className="text-ink-soft">Session</span>
      <select
        value={selectedId}
        onChange={(event) =>
          router.push(`${basePath}?session=${event.target.value}`)
        }
        className="mt-1"
      >
        {sessions.map((session) => (
          <option key={session.id} value={session.id}>
            {session.number}. {session.topic}
            {marked.has(session.id) ? " ✓" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
