import SessionPicker from "@/components/session-picker";
import { Card, Empty, formatDate } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getAssignments, getParticipants, getSessions } from "@/lib/data";
import type { Assignment } from "@/lib/types";
import AssignmentsForm from "./assignments-form";

export const metadata = { title: "Assignments · Pulse" };

export default async function AssignmentsPage({
  searchParams,
}: PageProps<"/assignments">) {
  const [{ session: requested }, profile, sessions, participants, assignments] =
    await Promise.all([
      searchParams,
      getCurrentProfile(),
      getSessions(),
      getParticipants(),
      getAssignments(),
    ]);

  if (sessions.length === 0 || participants.length === 0) {
    return (
      <Card title="Assignments">
        <Empty>Add sessions and participants first.</Empty>
      </Card>
    );
  }

  const setIds = [...new Set(assignments.map((a) => a.session_id))];

  // Default to the session most likely to need reviewing: the latest completed
  // one, otherwise the latest session that already has assignments.
  const requestedId = typeof requested === "string" ? requested : undefined;
  const selected =
    sessions.find((s) => s.id === requestedId) ??
    [...sessions].reverse().find((s) => s.status === "Completed") ??
    sessions[0];

  const existing: Record<string, Assignment> = Object.fromEntries(
    assignments
      .filter((a) => a.session_id === selected.id)
      .map((a) => [a.participant_id, a]),
  );
  const doneCount = Object.values(existing).filter((a) => a.completed).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl">Assignments</h2>
        <p className="text-sm text-ink-soft">
          {profile.role === "admin"
            ? "Set the task once, then tick it off as people complete it."
            : "What was set after each session, and who has completed it."}
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="sm:max-w-sm">
            <SessionPicker
              sessions={sessions}
              selectedId={selected.id}
              markedIds={setIds}
              basePath="/assignments"
            />
            <p className="mt-1.5 text-xs text-ink-muted">
              {formatDate(selected.date)} · {selected.status}
              {Object.keys(existing).length > 0
                ? ` · ${doneCount} of ${Object.keys(existing).length} complete`
                : " · nothing set yet"}
            </p>
          </div>

          {profile.role === "admin" ? (
            <AssignmentsForm
              key={selected.id}
              session={selected}
              participants={participants}
              existing={existing}
            />
          ) : Object.keys(existing).length === 0 ? (
            <Empty>No assignment set for this session yet.</Empty>
          ) : (
            <ul className="space-y-3">
              {participants.map((participant) => {
                const row = existing[participant.id];
                return (
                  <li
                    key={participant.id}
                    className="rounded-xl border border-line bg-white p-3 sm:p-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium text-navy">
                        {participant.name}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          row?.completed ? "text-good" : "text-ink-muted"
                        }`}
                      >
                        {row?.completed ? "Complete" : "Outstanding"}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {row?.task ?? "No task recorded"}
                    </p>
                    {(row?.date_reviewed || row?.notes) && (
                      <p className="mt-1 text-xs text-ink-muted">
                        {row?.date_reviewed
                          ? `Reviewed ${formatDate(row.date_reviewed)}`
                          : ""}
                        {row?.date_reviewed && row?.notes ? " · " : ""}
                        {row?.notes ?? ""}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
