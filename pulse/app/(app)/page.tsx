import AttendanceTrend, { type TrendDatum } from "@/components/attendance-trend";
import ParticipantsPanel from "@/components/participants-panel";
import { Card, Empty, Kpi, formatDate, formatTimestamp } from "@/components/ui";
import { PROGRAMME } from "@/lib/config";
import {
  buildMetrics,
  getAssignments,
  getAttendance,
  getLastUpdated,
  getParticipants,
  getSessions,
  getToolAdoption,
} from "@/lib/data";

export const metadata = { title: "Dashboard · Pulse" };

export default async function DashboardPage() {
  const [participants, sessions, attendance, adoption, assignments, lastUpdated] =
    await Promise.all([
      getParticipants(),
      getSessions(),
      getAttendance(),
      getToolAdoption(),
      getAssignments(),
      getLastUpdated(),
    ]);

  const m = buildMetrics(participants, sessions, attendance, adoption, assignments);

  const trend: TrendDatum[] = m.trend.map((p) => ({
    label: `S${p.sessionNumber}`,
    fullLabel: `Session ${p.sessionNumber}${
      p.date ? ` · ${formatDate(p.date)}` : ""
    }`,
    pct: p.attendancePct,
    present: p.present,
    recorded: p.recorded,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Sessions"
          value={`${m.sessionsCompleted}/${m.totalSessions}`}
          sub={`completed · ${PROGRAMME.totalSupportVisits} support visits`}
        />
        <Kpi
          label="Avg attendance"
          value={m.avgAttendancePct === null ? "—" : `${m.avgAttendancePct}%`}
          sub="across recorded sessions"
        />
        <Kpi
          label="Assignments"
          value={
            m.assignmentsCompletedPct === null
              ? "—"
              : `${m.assignmentsCompletedPct}%`
          }
          sub="completed"
        />
        <Kpi
          label="Confident"
          value={`${m.confidentCount}/${m.participantCount}`}
          sub="participants at top level"
        />
      </div>

      <Card title="Attendance by session">
        {trend.length > 0 ? (
          <AttendanceTrend data={trend} />
        ) : (
          <Empty>
            No attendance recorded yet. Mark a session on the Attendance screen
            and the trend appears here.
          </Empty>
        )}
      </Card>

      <Card title="Participants">
        <ParticipantsPanel rollups={m.rollups} />
      </Card>

      <p className="text-xs text-ink-muted">
        Last updated {formatTimestamp(lastUpdated)}
      </p>
    </div>
  );
}
