import type { ReactNode } from "react";
import type { SessionStatus } from "@/lib/types";

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-line bg-card p-4 sm:p-5 ${className}`}
    >
      {(title || action) && (
        <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          {title && <h2 className="text-lg">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Hero-number tile: the value leads, the label explains, no decoration. */
export function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-card px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <p className="mt-1.5 font-serif text-3xl leading-none text-navy sm:text-[2rem]">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

const STATUS_STYLES: Record<SessionStatus, string> = {
  Completed: "bg-[#e4f0e9] text-good",
  Upcoming: "bg-white text-ink-soft border border-line",
  Rescheduled: "bg-[#fbeae7] text-bad",
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-ink-muted">{children}</p>;
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTimestamp(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
