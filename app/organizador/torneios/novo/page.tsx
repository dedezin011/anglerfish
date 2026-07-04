import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { logoutOrganizer } from "@/app/organizador/actions";
import { TournamentForm } from "@/app/organizador/torneios/novo/TournamentForm";
import { getOrganizerSession } from "@/lib/organizer-auth";

export const metadata = {
  title: "Criar Torneio | AnglerFish",
  description: "Criação de campeonatos digitais no painel do organizador AnglerFish.",
  robots: {
    index: false,
    follow: false
  }
};

export const dynamic = "force-dynamic";

export default async function NewTournamentPage() {
  const session = await getOrganizerSession();

  if (!session) {
    redirect("/organizador/login");
  }

  return (
    <main className="min-h-screen bg-foam text-midnight">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/organizador" className="flex items-center gap-3 font-bold">
            <Image
              src="/anglerfish-logo.png"
              alt="AnglerFish"
              width={170}
              height={42}
              className="h-10 w-auto"
            />
            <span className="hidden text-sm text-slate-500 sm:inline">Novo torneio</span>
          </Link>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/organizador"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-midnight transition hover:bg-foam"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar
            </Link>
            <form action={logoutOrganizer}>
              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-midnight transition hover:bg-foam"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <p className="text-sm font-black uppercase text-reef">Campeonatos digitais</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Criar torneio</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Preencha as informações do campeonato. Se o status for ativo, ele aparece no app
            mobile para os pescadores entrarem.
          </p>
        </div>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <TournamentForm />
        </article>
      </section>
    </main>
  );
}
