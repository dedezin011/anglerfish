import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Fish,
  ImageIcon,
  LogOut,
  MapPin,
  Ruler,
  Trophy,
  User,
  Video,
  XCircle
} from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { updateCaptureReview } from "@/app/admin/capturas/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

type CaptureStatus = "pending" | "approved" | "rejected";

type CapturasPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

type CaptureRow = {
  id: string;
  tournament_id: string;
  user_id: string;
  fish_species: string;
  length_cm: number | string;
  city: string;
  state: string;
  modality: string;
  code_spoken: string;
  photo_path: string;
  video_path: string;
  status: CaptureStatus;
  reviewer_notes: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string;
  handle: string | null;
  city: string | null;
  state: string | null;
};

type TournamentRow = {
  id: string;
  name: string;
  code: string;
};

type CaptureView = CaptureRow & {
  profile?: ProfileRow;
  tournament?: TournamentRow;
  photoUrl: string | null;
  videoUrl: string | null;
};

const statusFilters = [
  { label: "Pendentes", value: "pending" },
  { label: "Aprovadas", value: "approved" },
  { label: "Reprovadas", value: "rejected" },
  { label: "Todas", value: "all" }
];

export const metadata = {
  title: "Análise de Capturas | AnglerFish",
  description: "Painel administrativo para analisar capturas enviadas aos campeonatos AnglerFish.",
  robots: {
    index: false,
    follow: false
  }
};

export const dynamic = "force-dynamic";

function normalizeStatus(value?: string) {
  if (value === "approved" || value === "rejected" || value === "all") {
    return value;
  }

  return "pending";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatLength(value: number | string) {
  const length = Number(value);

  if (!Number.isFinite(length)) {
    return String(value);
  }

  return `${length.toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  })} cm`;
}

function statusLabel(status: CaptureStatus) {
  if (status === "approved") {
    return "Aprovada";
  }

  if (status === "rejected") {
    return "Reprovada";
  }

  return "Pendente";
}

function statusClasses(status: CaptureStatus) {
  if (status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function statCount(captures: CaptureRow[], status: CaptureStatus) {
  return captures.filter((capture) => capture.status === status).length;
}

async function createSignedMediaUrl(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  path: string
) {
  const { data, error } = await supabase.storage
    .from("catch-media")
    .createSignedUrl(path, 60 * 30);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

async function loadCaptures(status: string) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("catch_submissions")
    .select(
      "id, tournament_id, user_id, fish_species, length_cm, city, state, modality, code_spoken, photo_path, video_path, status, reviewer_notes, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const [{ data: capturesData, error: capturesError }, { data: statusData, error: statusError }] =
    await Promise.all([
      query,
      supabase.from("catch_submissions").select("id, status")
    ]);

  if (capturesError || statusError) {
    throw capturesError ?? statusError;
  }

  const captures = (capturesData ?? []) as CaptureRow[];
  const allStatusRows = (statusData ?? []) as CaptureRow[];
  const profileIds = [...new Set(captures.map((capture) => capture.user_id))];
  const tournamentIds = [...new Set(captures.map((capture) => capture.tournament_id))];

  const [{ data: profilesData }, { data: tournamentsData }] = await Promise.all([
    profileIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name, handle, city, state")
          .in("id", profileIds)
      : Promise.resolve({ data: [] }),
    tournamentIds.length
      ? supabase
          .from("tournaments")
          .select("id, name, code")
          .in("id", tournamentIds)
      : Promise.resolve({ data: [] })
  ]);

  const profiles = new Map(
    ((profilesData ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
  );
  const tournaments = new Map(
    ((tournamentsData ?? []) as TournamentRow[]).map((tournament) => [
      tournament.id,
      tournament
    ])
  );

  const capturesWithMedia: CaptureView[] = await Promise.all(
    captures.map(async (capture) => ({
      ...capture,
      profile: profiles.get(capture.user_id),
      tournament: tournaments.get(capture.tournament_id),
      photoUrl: await createSignedMediaUrl(supabase, capture.photo_path),
      videoUrl: await createSignedMediaUrl(supabase, capture.video_path)
    }))
  );

  return {
    captures: capturesWithMedia,
    allStatusRows
  };
}

function StatCard({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-black ${tone}`}>{value}</p>
    </article>
  );
}

function MediaLink({
  href,
  label,
  icon: Icon
}: {
  href: string | null;
  label: string;
  icon: typeof ImageIcon;
}) {
  if (!href) {
    return (
      <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-400">
        <Icon className="h-4 w-4" aria-hidden="true" />
        Indisponível
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-midnight transition hover:bg-foam"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

function ReviewForm({
  capture,
  redirectTo
}: {
  capture: CaptureView;
  redirectTo: string;
}) {
  return (
    <form action={updateCaptureReview} className="grid gap-3">
      <input type="hidden" name="id" value={capture.id} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <label className="grid gap-2">
        <span className="text-sm font-bold text-slate-700">Observação para o pescador</span>
        <textarea
          name="reviewer_notes"
          defaultValue={capture.reviewer_notes ?? ""}
          placeholder="Ex: medida sem régua visível, código não identificado, captura aprovada..."
          className="min-h-24 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-reef focus:ring-2 focus:ring-reef/20"
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        <button
          type="submit"
          name="status"
          value="approved"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-reef px-3 py-2 text-sm font-black text-midnight transition hover:bg-reef/85"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Aprovar
        </button>
        <button
          type="submit"
          name="status"
          value="rejected"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-black text-white transition hover:bg-red-700"
        >
          <XCircle className="h-4 w-4" aria-hidden="true" />
          Reprovar
        </button>
        <button
          type="submit"
          name="status"
          value="pending"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-black text-midnight transition hover:bg-foam"
        >
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          Em análise
        </button>
      </div>
    </form>
  );
}

function CaptureCard({
  capture,
  redirectTo
}: {
  capture: CaptureView;
  redirectTo: string;
}) {
  const profileName = capture.profile?.full_name ?? "Pescador sem perfil";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${statusClasses(
                capture.status
              )}`}
            >
              {statusLabel(capture.status)}
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {formatDate(capture.created_at)}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-black text-midnight">{capture.fish_species}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {capture.tournament?.name ?? "Torneio não encontrado"} · código {capture.tournament?.code ?? "-"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MediaLink href={capture.photoUrl} label="Abrir foto" icon={ImageIcon} />
          <MediaLink href={capture.videoUrl} label="Abrir vídeo" icon={Video} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-foam p-3">
          <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
            <User className="h-4 w-4" aria-hidden="true" />
            Pescador
          </p>
          <p className="mt-2 text-sm font-bold text-midnight">{profileName}</p>
          <p className="mt-1 text-xs text-slate-500">{capture.user_id}</p>
        </div>
        <div className="rounded-md bg-foam p-3">
          <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
            <Ruler className="h-4 w-4" aria-hidden="true" />
            Tamanho
          </p>
          <p className="mt-2 text-sm font-bold text-midnight">{formatLength(capture.length_cm)}</p>
        </div>
        <div className="rounded-md bg-foam p-3">
          <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Local
          </p>
          <p className="mt-2 text-sm font-bold text-midnight">
            {capture.city}/{capture.state}
          </p>
        </div>
        <div className="rounded-md bg-foam p-3">
          <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
            <Fish className="h-4 w-4" aria-hidden="true" />
            Modalidade
          </p>
          <p className="mt-2 text-sm font-bold text-midnight">{capture.modality}</p>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 bg-white p-4">
        <p className="text-sm font-black text-midnight">Código informado no envio</p>
        <p className="mt-1 text-sm font-semibold text-slate-600">{capture.code_spoken}</p>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-5">
        <ReviewForm capture={capture} redirectTo={redirectTo} />
      </div>
    </article>
  );
}

export default async function AdminCapturasPage({ searchParams }: CapturasPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const status = normalizeStatus(params.status);
  const redirectTo = `/admin/capturas?status=${status}`;
  const { captures, allStatusRows } = await loadCaptures(status);

  return (
    <main className="min-h-screen bg-foam text-midnight">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/admin" className="flex items-center gap-3 font-bold">
            <Image
              src="/anglerfish-logo.png"
              alt="AnglerFish"
              width={170}
              height={42}
              className="h-10 w-auto"
            />
            <span className="hidden text-sm text-slate-500 sm:inline">Análise</span>
          </Link>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-midnight transition hover:bg-foam"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
            <form action={logoutAdmin}>
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

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <p className="text-sm font-black uppercase text-reef">Campeonatos digitais</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Análise de capturas</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Revise os envios do app mobile, abra a foto e o vídeo em links seguros e atualize o
            status que o pescador verá na aba Envios.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Pendentes" value={statCount(allStatusRows, "pending")} tone="text-amber-600" />
          <StatCard label="Aprovadas" value={statCount(allStatusRows, "approved")} tone="text-emerald-600" />
          <StatCard label="Reprovadas" value={statCount(allStatusRows, "rejected")} tone="text-red-600" />
        </div>

        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Filtros de status">
          {statusFilters.map((filter) => {
            const active = status === filter.value;

            return (
              <Link
                key={filter.value}
                href={`/admin/capturas?status=${filter.value}`}
                className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-black transition ${
                  active
                    ? "bg-midnight text-white"
                    : "border border-slate-200 bg-white text-midnight hover:bg-foam"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 grid gap-5">
          {captures.length ? (
            captures.map((capture) => (
              <CaptureCard key={capture.id} capture={capture} redirectTo={redirectTo} />
            ))
          ) : (
            <article className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              <Trophy className="mx-auto h-8 w-8 text-reef" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black text-midnight">Nenhuma captura neste filtro</h2>
              <p className="mt-2 text-sm text-slate-500">
                Quando pescadores enviarem capturas pelo app, elas aparecerão aqui.
              </p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
