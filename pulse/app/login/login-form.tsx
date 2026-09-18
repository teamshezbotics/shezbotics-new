"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

const initial: LoginState = { status: "idle" };

export default function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLink, initial);

  if (state.status === "sent") {
    return (
      <p className="rounded-lg bg-card px-4 py-3 text-ink-soft" role="status">
        Check your inbox — the sign-in link is on its way. It works once and
        expires shortly.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <label htmlFor="email" className="block text-sm text-ink-soft">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        placeholder="you@company.com"
      />
      {state.status === "error" && (
        <p className="text-sm text-bad" role="alert">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
