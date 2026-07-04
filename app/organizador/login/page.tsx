import Image from "next/image";
import Link from "next/link";
import { OrganizerLoginForm } from "@/app/organizador/login/LoginForm";

export const metadata = {
  title: "Organizador | AnglerFish",
  description: "Login de organizadores de campeonatos AnglerFish.",
  robots: {
    index: false,
    follow: false
  }
};

export default function OrganizerLoginPage() {
  return (
    <main className="flex min-h-screen items-center bg-foam px-5 py-12 text-midnight">
      <section className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <Link href="/" className="mb-8 inline-flex items-center">
          <Image
            src="/anglerfish-logo.png"
            alt="AnglerFish"
            width={190}
            height={48}
            className="h-11 w-auto"
          />
        </Link>
        <h1 className="text-2xl font-bold">Painel do organizador</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Acesse apenas os torneios vinculados à sua conta para revisar capturas e acompanhar
          resultados.
        </p>
        <div className="mt-6">
          <OrganizerLoginForm />
        </div>
      </section>
    </main>
  );
}
