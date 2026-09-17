"use client";

import { useState } from "react";
import { StatusBadge, formatDate } from "@/components/ui";
import type { TrainingSession } from "@/lib/types";
import SessionForm from "./session-form";

export default function SessionLog({
  sessions,
  isAdmin,
  attendanceCounts,
}: {
  sessions: TrainingSession[];
  isAdmin: boolean;
  attendanceCounts: Record<string, number>;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const nextNumber =
    sessions.reduce((max, s) => Math.max(max, s.number), 0) + 1;

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
          {adding ? (
            <>
              <h2 className="mb-4 text-lg">New session</h2>
              <SessionForm
                nextNumber={nextNumber}
                onDone={() => setAdding(false)}
              />
            </>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Add a session
            </button>
          )}
        </div>
      )}

      {sessions.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          No sessions yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((session) => {
            const marked = attendanceCounts[session.id] ?? 0;
            return (
              <li
                key={session.id}
                className="rounded-xl border border-line bg-card p-4"
              >
                {editingId === session.id ? (
                  <>
                    <h2 className="mb-4 text-lg">
                      Edit session {session.number}
                    </h2>
                    <SessionForm
                      session={session}
                      onDone={() => setEditingId(null)}
                    />
                  </>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                        Session {session.number}
                      </p>
                      <p className="font-medium text-navy">{session.topic}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {formatDate(session.date)}
                        {session.hours ? ` · ${session.hours}h` : ""}
                        {marked > 0
                          ? ` · attendance marked for ${marked}`
                          : " · attendance not marked"}
                      </p>
                      {session.notes && (
                        <p className="mt-1.5 text-sm text-ink-soft">
                          {session.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={session.status} />
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setEditingId(session.id)}
                          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink-soft hover:text-navy"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
