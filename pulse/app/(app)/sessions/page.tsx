import { getCurrentProfile } from "@/lib/auth";
import { getAttendance, getSessions } from "@/lib/data";
import SessionLog from "./session-log";

export const metadata = { title: "Session Log · Pulse" };

export default async function SessionsPage() {
  const [profile, sessions, attendance] = await Promise.all([
    getCurrentProfile(),
    getSessions(),
    getAttendance(),
  ]);

  const attendanceCounts = attendance.reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.session_id] = (acc[row.session_id] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl">Session Log</h2>
        <p className="text-sm text-ink-soft">
          {profile.role === "admin"
            ? "All 11 sessions, plus anything you add."
            : "Read-only view of the programme schedule."}
        </p>
      </div>
      <SessionLog
        sessions={sessions}
        isAdmin={profile.role === "admin"}
        attendanceCounts={attendanceCounts}
      />
    </div>
  );
}
