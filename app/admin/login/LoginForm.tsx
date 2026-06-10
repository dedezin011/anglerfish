"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock, LoaderCircle } from "lucide-react";
import { loginAdmin, type AdminLoginState } from "@/app/admin/actions";

const initialState: AdminLoginState = {
  ok: false,
  message: ""
};

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-reef px-5 py-3 text-sm font-bold text-white transition hover:bg-kelp focus:outline-none focus:ring-4 focus:ring-reef/25 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Lock className="h-4 w-4" aria-hidden="true" />
      )}
      Entrar no admin
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-midnight">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="min-h-12 rounded-md border border-slate-200 bg-foam px-4 text-base font-normal text-midnight outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
          placeholder="admin@anglerfish.com.br"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-midnight">
        Senha
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-12 rounded-md border border-slate-200 bg-foam px-4 text-base font-normal text-midnight outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
          placeholder="Senha administrativa"
        />
      </label>

      <LoginButton />

      {state.message ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
