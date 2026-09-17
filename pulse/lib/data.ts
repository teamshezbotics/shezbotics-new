import { createClient } from "@/lib/supabase/server";
import { PROGRAMME } from "@/lib/config";
import type {
  Assignment,
  AttendanceRow,
  Participant,
  ToolAdoption,
  TrainingSession,
} from "@/lib/types";

export async function getParticipants(): Promise<Participant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select("id, name, track, role, active")
    .eq("active", true)
    .order("track")
    .order("name");
  return (data ?? []) as Participant[];
}

export async function getSessions(): Promise<TrainingSession[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessions")
    .select("id, number, date, topic, hours, status, notes, updated_at")
    .order("number");
  return (data ?? []) as TrainingSession[];
}

export async function getAttendance(): Promise<AttendanceRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("session_id, participant_id, present, updated_at");
  return (data ?? []) as AttendanceRow[];
}

export async function getToolAdoption(): Promise<ToolAdoption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tool_adoption")
    .select("participant_id, primary_tools, level, last_active, notes, updated_at");
  return (data ?? []) as ToolAdoption[];
}

export async function getAssignments(): Promise<Assignment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assignments")
    .select(
      "session_id, participant_id, task, completed, date_reviewed, notes, updated_at",
    );
  return (data ?? []) as Assignment[];
}

/** Most recent edit anywhere in the programme data, for the "Last updated" line. */
export async function getLastUpdated(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("last_updated")
    .select("at")
    .maybeSingle<{ at: string | null }>();
  return data?.at ?? null;
}

export type ParticipantRollup = {
  participant: Participant;
  recorded: number;
  present: number;
  attendancePct: number | null;
  level: ToolAdoption["level"] | null;
};

export type TrendPoint = {
  sessionNumber: number;
  topic: string;
  date: string | null;
  attendancePct: number;
  present: number;
  recorded: number;
};

export type Metrics = {
  sessionsCompleted: number;
  totalSessions: number;
  avgAttendancePct: number | null;
  assignmentsCompletedPct: number | null;
  confidentCount: number;
  participantCount: number;
  rollups: ParticipantRollup[];
  trend: TrendPoint[];
};

const pct = (num: number, den: number) =>
  den === 0 ? null : Math.round((num / den) * 100);

/**
 * Attendance percentages are always "present / actually recorded", never
 * "present / sessions on the plan" — an un-marked session must not read as
 * an absence.
 */
export function buildMetrics(
  participants: Participant[],
  sessions: TrainingSession[],
  attendance: AttendanceRow[],
  adoption: ToolAdoption[],
  assignments: Assignment[],
): Metrics {
  const adoptionByParticipant = new Map(
    adoption.map((a) => [a.participant_id, a]),
  );

  const rollups: ParticipantRollup[] = participants.map((participant) => {
    const rows = attendance.filter((a) => a.participant_id === participant.id);
    const present = rows.filter((a) => a.present).length;
    return {
      participant,
      recorded: rows.length,
      present,
      attendancePct: pct(present, rows.length),
      level: adoptionByParticipant.get(participant.id)?.level ?? null,
    };
  });

  const trend: TrendPoint[] = sessions
    .map((session) => {
      const rows = attendance.filter((a) => a.session_id === session.id);
      const present = rows.filter((a) => a.present).length;
      return {
        sessionNumber: session.number,
        topic: session.topic,
        date: session.date,
        recorded: rows.length,
        present,
        attendancePct: pct(present, rows.length) ?? 0,
      };
    })
    .filter((point) => point.recorded > 0)
    .sort((a, b) => a.sessionNumber - b.sessionNumber);

  const presentTotal = attendance.filter((a) => a.present).length;

  return {
    sessionsCompleted: sessions.filter((s) => s.status === "Completed").length,
    totalSessions: Math.max(PROGRAMME.totalSessions, sessions.length),
    avgAttendancePct: pct(presentTotal, attendance.length),
    assignmentsCompletedPct: pct(
      assignments.filter((a) => a.completed).length,
      assignments.length,
    ),
    confidentCount: adoption.filter((a) => a.level === "Confident").length,
    participantCount: participants.length,
    rollups,
    trend,
  };
}
