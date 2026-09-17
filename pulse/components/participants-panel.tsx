import type { ParticipantRollup } from "@/lib/data";
import { Empty } from "@/components/ui";

/** Participant, attendance %, adoption level — at a glance on any screen. */
export default function ParticipantsPanel({
  rollups,
}: {
  rollups: ParticipantRollup[];
}) {
  if (rollups.length === 0) return <Empty>No participants yet.</Empty>;

  return (
    <>
      {/* Phone: one stacked row per participant, nothing clipped. */}
      <ul className="divide-y divide-line sm:hidden">
        {rollups.map(({ participant, recorded, attendancePct, level }) => (
          <li key={participant.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-navy">{participant.name}</span>
              <span className="shrink-0 font-medium">
                {attendancePct === null ? "—" : `${attendancePct}%`}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-ink-muted">
              {participant.track} · {level ?? "adoption not set"}
              {attendancePct === null
                ? ""
                : ` · ${recorded} session${recorded === 1 ? "" : "s"} recorded`}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-ink-muted">
              <th scope="col" className="pb-2 font-medium">
                Participant
              </th>
              <th scope="col" className="px-2 pb-2 font-medium">
                Attendance
              </th>
              <th scope="col" className="px-2 pb-2 font-medium">
                Adoption
              </th>
            </tr>
          </thead>
          <tbody>
            {rollups.map(({ participant, recorded, attendancePct, level }) => (
              <tr key={participant.id} className="border-t border-line">
                <td className="py-2.5">
                  <span className="font-medium text-navy">
                    {participant.name}
                  </span>
                  <span className="block text-xs text-ink-muted">
                    {participant.track}
                    {participant.role ? ` · ${participant.role}` : ""}
                  </span>
                </td>
                <td className="px-2 py-2.5 whitespace-nowrap">
                  {attendancePct === null ? (
                    <span className="text-ink-muted">—</span>
                  ) : (
                    <>
                      <span className="font-medium">{attendancePct}%</span>
                      <span className="block text-xs text-ink-muted">
                        of {recorded} recorded
                      </span>
                    </>
                  )}
                </td>
                <td className="px-2 py-2.5 whitespace-nowrap text-ink-soft">
                  {level ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
