import Nav from "@/components/nav";
import { getCurrentProfile } from "@/lib/auth";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Pulse
          </p>
          <h1 className="text-2xl sm:text-3xl">AI Skills Programme</h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="max-w-[12rem] truncate">
            {profile.email}
            {profile.role === "viewer" && " · read-only"}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-line px-2.5 py-1.5 text-ink-soft transition-colors hover:bg-card hover:text-navy"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mt-5 border-b border-line pb-3">
        <Nav />
      </div>

      <main className="flex-1 pt-6">{children}</main>
    </div>
  );
}
