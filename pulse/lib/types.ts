import type {
  ADOPTION_LEVELS,
  SESSION_STATUSES,
  TRACKS,
} from "./config";

export type Track = (typeof TRACKS)[number];
export type SessionStatus = (typeof SESSION_STATUSES)[number];
export type AdoptionLevel = (typeof ADOPTION_LEVELS)[number];
export type Role = "admin" | "viewer";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
};

export type Participant = {
  id: string;
  name: string;
  track: Track;
  role: string | null;
  active: boolean;
};

export type TrainingSession = {
  id: string;
  number: number;
  date: string | null;
  topic: string;
  hours: number | null;
  status: SessionStatus;
  notes: string | null;
  updated_at: string;
};

export type AttendanceRow = {
  session_id: string;
  participant_id: string;
  present: boolean;
  updated_at: string;
};

export type ToolAdoption = {
  participant_id: string;
  primary_tools: string[] | null;
  level: AdoptionLevel;
  last_active: string | null;
  notes: string | null;
  updated_at: string;
};

export type Assignment = {
  session_id: string;
  participant_id: string;
  task: string | null;
  completed: boolean;
  date_reviewed: string | null;
  notes: string | null;
  updated_at: string;
};
