import { Card, Empty, formatDate } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getParticipants, getToolAdoption } from "@/lib/data";
import type { ToolAdoption } from "@/lib/types";
import AdoptionForm from "./adoption-form";

export const metadata = { title: "Tool Adoption · Pulse" };

export default async function AdoptionPage() {
  const [profile, participants, adoptionRows] = await Promise.all([
    getCurrentProfile(),
    getParticipants(),
    getToolAdoption(),
  ]);

  const adoption: Record<string, ToolAdoption> = Object.fromEntries(
    adoptionRows.map((row) => [row.participant_id, row]),
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl">Tool Adoption</h2>
        <p className="text-sm text-ink-soft">
          {profile.role === "admin"
            ? "Where each participant is with the tools. Edit any row, then save once."
            : "Where each participant is with the tools."}
        </p>
      </div>

      <Card>
        {participants.length === 0 ? (
          <Empty>No participants yet.</Empty>
        ) : profile.role === "admin" ? (
          <AdoptionForm participants={participants} adoption={adoption} />
        ) : (
          <ul className="space-y-3">
            {participants.map((participant) => {
              const row = adoption[participant.id];
              const tools = row?.primary_tools ?? [];
              return (
                <li
                  key={participant.id}
                  className="rounded-xl border border-line bg-white p-3 sm:p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-navy">{participant.name}</p>
                    <p className="text-sm font-medium">
                      {row?.level ?? "Not Started"}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {participant.track}
                    {tools.length > 0 ? ` · ${tools.join(", ")}` : ""}
                    {row?.last_active
                      ? ` · last active ${formatDate(row.last_active)}`
                      : ""}
                  </p>
                  {row?.notes && (
                    <p className="mt-2 text-sm text-ink-soft">{row.notes}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
