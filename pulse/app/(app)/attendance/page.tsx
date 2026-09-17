import { Card, Empty, formatDate } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getAttendance, getParticipants, getSessions } from "@/lib/data";
import AttendanceForm from "./attendance-form";
import SessionPicker from "./session-picker";

export const metadata = { title: "Attendance · Pulse" };

export default async function AttendancePage({
  searchParams,
}: PageProps<"/attendance">) {
  const [{ session: requested }, profile, sessions, participants, attendance] =
    await Promise.all([
      searchParams,
      getCurrentProfile(),
      getSessions(),
      getParticipants(),
      getAttendance(),
    ]);

  if (sessions.length === 0 || participants.length === 0) {
    return (
      <Card title="Attendance">
        <Empty>
          Add sessions and participants first — then attendance takes seconds.
        </Empty>
      </Card>
    );
  }

  const markedIds = [...new Set(attendance.map((a) => a.session_id))];

  // Default to the session most likely to need marking: the latest completed
  // one, otherwise the first that has no attendance yet.
  const requestedId = typeof requested === "string" ? requested : undefined;
  const selected =
    sessions.find((s) => s.id === requestedId) ??
    [...sessions]
      .reverse()
      .find((s) => s.status === "Completed" && !markedIds.includes(s.id)) ??
    sessions.find((s) => !markedIds.includes(s.id)) ??
    sessions[sessions.length - 1];

  const existing = Object.fromEntries(
    attendance
      .filter((a) => a.session_id === selected.id)
      .map((a) => [a.participant_id, a.present]),
  );
  const alreadyMarked = Object.keys(existing).length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl">Attendance</h2>
        <p className="text-sm text-ink-soft">
          {profile.role === "admin"
            ? "Pick the session, tick anyone absent, save."
            : "Read-only view of who attended each session."}
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="sm:max-w-sm">
            <SessionPicker
              sessions={sessions}
              selectedId={selected.id}
              markedIds={markedIds}
            />
            <p className="mt-1.5 text-xs text-ink-muted">
              {formatDate(selected.date)} · {selected.status}
              {alreadyMarked ? " · already marked" : ""}
            </p>
          </div>

          {profile.role === "admin" ? (
            <AttendanceForm
              key={selected.id}
              session={selected}
              participants={participants}
              existing={existing}
              alreadyMarked={alreadyMarked}
            />
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line bg-white">
              {participants.map((participant) => {
                const present = existing[participant.id];
                return (
                  <li
                    key={participant.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-navy">
                        {participant.name}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {participant.track}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-medium ${
                        present === undefined
                          ? "text-ink-muted"
                          : present
                            ? "text-good"
                            : "text-bad"
                      }`}
                    >
                      {present === undefined
                        ? "Not recorded"
                        : present
                          ? "Present"
                          : "Absent"}
                    </span>
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
