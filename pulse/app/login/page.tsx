import LoginForm from "./login-form";

export const metadata = { title: "Sign in · Pulse" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Pulse
        </p>
        <h1 className="mt-2 text-3xl">Programme dashboard</h1>
        <p className="mt-2 mb-7 text-ink-soft">
          Private to the two people on this engagement. Enter your email and
          we&apos;ll send a one-tap sign-in link.
        </p>
        {error === "link" && (
          <p className="mb-4 text-sm text-bad" role="alert">
            That link has expired or was already used. Request a fresh one.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
