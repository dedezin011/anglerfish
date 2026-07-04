import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  LogOut,
  ShieldCheck,
  Trophy,
  XCircle
} from "lucide-react";
import { logoutOrganizer } from "@/app/organizador/actions";
import { getOrganizerSession } from "@/lib/organizer-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

type TournamentRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  code: string;
  prize: string;
  starts_at: string | null;
  ends_at: string | null;
  status: "draft" | "active" | "completed";
};

type CaptureRow = {
  id: string;
  tournament_id: string;
  status: "pending" | "approved" | "rejected";
  length_cm: number | string;
};

type TournamentSummary = TournamentRow & {
  organizerRole: string;
  totalCaptures: number;
  pendingCaptures: number;
  approvedCaptures: number;
  rejectedCaptures: number;
  bestLength: number | null;
};

export const metadata = {
  title: "Painel do Organizador | AnglerFish",
  description: "Painel para organizadores acompanharem torneios e revisarem capturas.",
  robots: {
    index: false,
    follow: false
  }
};

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) {
    return "Sem data definida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function statusLabel(status: TournamentRow["status"]) {
  if (status === "active") {
    return "Ativo";
  }

  if (status === "completed") {
    return "Finalizado";
  }

  return "Rascunho";
}

function statusClasses(status: TournamentRow["status"]) {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "completed") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function StatCard({
  label,
  value,
  tone,
  icon: Icon
}: {
  label: string;
  value: number | string;
  tone: string;
  icon: typeof Trophy;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <Icon className={`h-5 w-5 ${tone}`} aria-hidden="true" />
      </div>
      <p className={`mt-3 text-3xl font-black ${tone}`}>{value}</p>
    </article>
  );
}

async function loadOrganizerDashboard(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data: linksData, error: linksError } = await supabase
    .from("tournament_organizers")
    .select("tournament_id, role")
    .eq("user_id", userId);

  if (linksError) {
    throw linksError;
  }

  const links = (linksData ?? []) as { tournament_id: string; role: string }[];
  const tournamentIds = [...new Set(links.map((link) => link.tournament_id))];

  if (!tournamentIds.length) {
    return {
      tournaments: [] as TournamentSummary[],
      totals: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      }
    };
  }

  const [{ data: tournamentsData, error: tournamentsError }, { data: capturesData, error: capturesError }] =
    await Promise.all([
      supabase
        .from("tournaments")
        .select("id, name, slug, description, code, prize, starts_at, ends_at, status")
        .in("id", tournamentIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("catch_submissions")
        .select("id, tournament_id, status, length_cm")
        .in("tournament_id", tournamentIds)
    ]);

  if (tournamentsError || capturesError) {
    throw tournamentsError ?? capturesError;
  }

  const roleByTournament = new Map(links.map((link) => [link.tournament_id, link.role]));
  const captures = (capturesData ?? []) as CaptureRow[];

  const tournaments = ((tournamentsData ?? []) as TournamentRow[]).map((tournament) => {
    const tournamentCaptures = captures.filter(
      (capture) => capture.tournament_id === tournament.id
    );
    const bestLength = tournamentCaptures
      .filter((capture) => capture.status === "approved")
      .map((capture) => Number(capture.length_cm))
      .filter(Number.isFinite)
      .sort((a, b) => b - a)[0];

    return {
      ...tournament,
      organizerRole: roleByTournament.get(tournament.id) ?? "reviewer",
      totalCaptures: tournamentCaptures.length,
      pendingCaptures: tournamentCaptures.filter((capture) => capture.status === "pending").length,
      approvedCaptures: tournamentCaptures.filter((capture) => capture.status === "approved").length,
      rejectedCaptures: tournamentCaptures.filter((capture) => capture.status === "rejected").length,
      bestLength: bestLength ?? null
    };
  });

  return {
    tournaments,
    totals: {
      total: captures.length,
      pending: captures.filter((capture) => capture.status === "pending").length,
      approved: captures.filter((capture) => capture.status === "approved").length,
      rejected: captures.filter((capture) => capture.status === "rejected").length
    }
  };
}

export default async function OrganizerPage() {
  const session = await getOrganizerSession();

  if (!session) {
    redirect("/organizador/login");
  }

  const { tournaments, totals } = await loadOrganizerDashboard(session.user.id);

  return (
    <main className="min-h-screen bg-foam text-midnight">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/organizador" className="flex items-center gap-3 font-bold">
            <Image
              src="/anglerfish-logo.png"
              alt="AnglerFish"
              width={170}
              height={42}
              className="h-10 w-auto"
            />
            <span className="hidden text-sm text-slate-500 sm:inline">Organizador</span>
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
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <p className="text-sm font-black uppercase text-reef">Área do organizador</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Seus campeonatos</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Cada conta enxerga apenas os torneios vinculados a ela. Assim um organizador não
            mistura capturas, rankings ou análises de outro campeonato.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Capturas totais" value={totals.total} tone="text-midnight" icon={Trophy} />
          <StatCard label="Pendentes" value={totals.pending} tone="text-amber-600" icon={Clock3} />
          <StatCard label="Aprovadas" value={totals.approved} tone="text-emerald-600" icon={CheckCircle2} />
          <StatCard label="Reprovadas" value={totals.rejected} tone="text-red-600" icon={XCircle} />
        </div>

        <div className="mt-6 grid gap-5">
          {tournaments.length ? (
            tournaments.map((tournament) => (
              <article
                key={tournament.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${statusClasses(
                          tournament.status
                        )}`}
                      >
                        {statusLabel(tournament.status)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-foam px-3 py-1 text-xs font-black text-slate-600">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        {tournament.organizerRole}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-midnight">{tournament.name}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      {tournament.description}
                    </p>
                  </div>
                  <Link
                    href={`/organizador/capturas?tournament=${tournament.id}&status=pending`}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-midnight px-4 py-2 text-sm font-black text-white transition hover:bg-kelp"
                  >
                    <BarChart3 className="h-4 w-4" aria-hidden="true" />
                    Analisar capturas
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-md bg-foam p-3">
                    <p className="text-xs font-black uppercase text-slate-500">Código</p>
                    <p className="mt-2 text-sm font-bold text-midnight">{tournament.code}</p>
                  </div>
                  <div className="rounded-md bg-foam p-3">
                    <p className="text-xs font-black uppercase text-slate-500">Prêmio</p>
                    <p className="mt-2 text-sm font-bold text-midnight">{tournament.prize}</p>
                  </div>
                  <div className="rounded-md bg-foam p-3">
                    <p className="text-xs font-black uppercase text-slate-500">Período</p>
                    <p className="mt-2 text-sm font-bold text-midnight">
                      {formatDate(tournament.starts_at)} até {formatDate(tournament.ends_at)}
                    </p>
                  </div>
                  <div className="rounded-md bg-foam p-3">
                    <p className="text-xs font-black uppercase text-slate-500">Pendentes</p>
                    <p className="mt-2 text-sm font-bold text-midnight">
                      {tournament.pendingCaptures}
                    </p>
                  </div>
                  <div className="rounded-md bg-foam p-3">
                    <p className="text-xs font-black uppercase text-slate-500">Maior aprovada</p>
                    <p className="mt-2 text-sm font-bold text-midnight">
                      {tournament.bestLength ? `${tournament.bestLength} cm` : "-"}
                    </p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <article className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              <Trophy className="mx-auto h-8 w-8 text-reef" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black text-midnight">Nenhum torneio vinculado</h2>
              <p className="mt-2 text-sm text-slate-500">
                A conta existe, mas ainda precisa ser vinculada a um campeonato no Supabase.
              </p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
