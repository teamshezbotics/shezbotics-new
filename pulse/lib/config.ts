/**
 * Programme shape. Edit these two numbers if the engagement changes —
 * the dashboard reads its "of N" totals from here.
 */
export const PROGRAMME = {
  totalSessions: 11,
  totalSupportVisits: 6,
} as const;

export const TRACKS = [
  "Sales & BD",
  "Finance & Accounts",
  "Operations & Admin",
] as const;

export const SESSION_STATUSES = ["Upcoming", "Completed", "Rescheduled"] as const;

export const ADOPTION_LEVELS = [
  "Not Started",
  "Beginner",
  "Practicing",
  "Confident",
] as const;
