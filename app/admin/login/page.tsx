import Link from "next/link";
import { Fish } from "lucide-react";
import { LoginForm } from "@/app/admin/login/LoginForm";

export const metadata = {
  title: "Admin | AnglerFish",
  description: "Login administrativo do AnglerFish.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center bg-foam px-5 py-12 text-midnight">
      <section className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <Link href="/" className="mb-8 inline-flex items-center gap-3 font-bold">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-reef text-white">
            <Fish className="h-5 w-5" aria-hidden="true" />
          </span>
          AnglerFish
        </Link>
        <h1 className="text-2xl font-bold">Área administrativa</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Acesse as métricas de validação, respostas da pesquisa e exportação CSV.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
