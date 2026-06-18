import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Download,
  Fish,
  Gift,
  Lightbulb,
  LineChart,
  LogOut,
  Shield,
  Trophy,
  Users,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { logoutAdmin } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

type LeadRow = {
  id: string;
  nome: string;
  email: string;
  created_at: string;
};

type SurveyRow = {
  id: string;
  lead_id: string | null;
  is_anonymous: boolean;
  modalidade: string[];
  interesse_campeonato: string;
  valor_participacao: string[];
  tipo_premio: string[];
  interesse_ranking: string;
  sugestao_plataforma: string | null;
  created_at: string;
};

type SuggestionItem = {
  id: string;
  text: string;
  source: string;
  created_at: string;
};

type CountItem = {
  label: string;
  value: number;
};

export const metadata = {
  title: "Dashboard Admin | AnglerFish",
  description: "Dashboard administrativo de validação de mercado do AnglerFish.",
  robots: {
    index: false,
    follow: false
  }
};

function countBy(rows: SurveyRow[], key: keyof SurveyRow): CountItem[] {
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    const rawValue = row[key];
    const values = Array.isArray(rawValue)
      ? rawValue
      : [String(rawValue ?? "Não informado")];

    values.forEach((value) => {
      acc[value] = (acc[value] ?? 0) + 1;
    });

    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function mostPopular(items: CountItem[]) {
  return items[0]?.label ?? "Sem dados";
}

function percent(value: number, total: number) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

function buildDailyGrowth(leads: LeadRow[]) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  });

  const today = new Date();
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (13 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: formatter.format(date),
      value: 0
    };
  });

  const dayMap = new Map(days.map((day) => [day.key, day]));

  leads.forEach((lead) => {
    const key = new Date(lead.created_at).toISOString().slice(0, 10);
    const day = dayMap.get(key);

    if (day) {
      day.value += 1;
    }
  });

  return days;
}

function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-midnight">{value}</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-reef/10 text-reef">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function DistributionChart({
  title,
  items
}: {
  title: string;
  items: CountItem[];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-midnight">{title}</h2>
      <div className="mt-5 grid gap-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-700">{item.label}</span>
                <span className="font-bold text-midnight">{item.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-reef"
                  style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Sem respostas ainda.</p>
        )}
      </div>
    </article>
  );
}

function DailyGrowthChart({
  items
}: {
  items: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-midnight">Crescimento por dia</h2>
          <p className="mt-1 text-sm text-slate-500">Leads dos últimos 14 dias</p>
        </div>
        <LineChart className="h-5 w-5 text-reef" aria-hidden="true" />
      </div>
      <div className="mt-6 flex h-48 items-end gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex h-full flex-1 flex-col justify-end gap-2">
            <div
              className="min-h-2 rounded-t-md bg-harbor"
              style={{ height: `${Math.max((item.value / max) * 100, 4)}%` }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-center text-[11px] font-semibold text-slate-500">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function SuggestionList({ items }: { items: SuggestionItem[] }) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-midnight">Ideias da comunidade</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sugestões opcionais enviadas na pesquisa
          </p>
        </div>
        <Lightbulb className="h-5 w-5 text-reef" aria-hidden="true" />
      </div>

      <div className="mt-5 grid gap-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 bg-foam p-4">
              <p className="text-sm leading-6 text-slate-700">{item.text}</p>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                {item.source} · {formatter.format(new Date(item.created_at))}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Nenhuma ideia enviada ainda.</p>
        )}
      </div>
    </article>
  );
}

export default async function AdminDashboardPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const supabase = getSupabaseAdmin();
  const [{ data: leadsData, error: leadsError }, { data: surveyData, error: surveyError }] =
    await Promise.all([
      supabase.from("leads").select("id, nome, email, created_at").order("created_at", {
        ascending: false
      }),
      supabase
        .from("survey_responses")
        .select(
          "id, lead_id, is_anonymous, modalidade, interesse_campeonato, valor_participacao, tipo_premio, interesse_ranking, sugestao_plataforma, created_at"
        )
        .order("created_at", { ascending: false })
    ]);

  if (leadsError || surveyError) {
    throw leadsError ?? surveyError;
  }

  const leads = (leadsData ?? []) as LeadRow[];
  const surveys = (surveyData ?? []) as SurveyRow[];
  const leadsById = new Map(leads.map((lead) => [lead.id, lead]));
  const identifiedSurveys = surveys.filter((survey) => !survey.is_anonymous);
  const anonymousSurveys = surveys.filter((survey) => survey.is_anonymous);
  const suggestions = surveys.filter((survey) =>
    survey.sugestao_plataforma?.trim()
  );
  const latestSuggestions = suggestions.slice(0, 8).map((survey) => {
    const lead = survey.lead_id ? leadsById.get(survey.lead_id) : undefined;

    return {
      id: survey.id,
      text: survey.sugestao_plataforma ?? "",
      source: survey.is_anonymous ? "Resposta anônima" : lead?.nome ?? "Lead identificado",
      created_at: survey.created_at
    };
  });

  const totalLeads = leads.length;
  const totalSurveys = surveys.length;
  const conversionRate = percent(identifiedSurveys.length, totalLeads);
  const modalidade = countBy(surveys, "modalidade");
  const campeonatos = countBy(surveys, "interesse_campeonato");
  const valores = countBy(surveys, "valor_participacao");
  const premios = countBy(surveys, "tipo_premio");
  const criptoInterest = surveys.filter((survey) =>
    survey.tipo_premio.some((premio) =>
      ["Criptomoedas", "NFTs colecionáveis"].includes(premio)
    )
  ).length;

  return (
    <main className="min-h-screen bg-foam text-midnight">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <Image
              src="/anglerfish-logo.png"
              alt="AnglerFish"
              width={170}
              height={42}
              className="h-10 w-auto"
            />
            <span className="hidden text-sm text-slate-500 sm:inline">Admin</span>
          </Link>
          <div className="flex flex-wrap gap-3">
            <a
              href="/admin/export"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-midnight px-4 py-2 text-sm font-bold text-white transition hover:bg-harbor"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Exportar CSV
            </a>
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
          <p className="text-sm font-bold uppercase text-reef">Validação de mercado</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Métricas da lista de espera e pesquisa
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total de leads" value={totalLeads} icon={Users} />
          <StatCard label="Pesquisas respondidas" value={totalSurveys} icon={BarChart3} />
          <StatCard label="Pesquisas anônimas" value={anonymousSurveys.length} icon={Shield} />
          <StatCard label="Taxa de conversão" value={conversionRate} icon={Trophy} />
          <StatCard label="Interesse em cripto" value={percent(criptoInterest, totalSurveys)} icon={Wallet} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Modalidade mais popular" value={mostPopular(modalidade)} icon={Fish} />
          <StatCard label="Interesse em campeonatos" value={mostPopular(campeonatos)} icon={Trophy} />
          <StatCard label="Faixa de preço mais escolhida" value={mostPopular(valores)} icon={Wallet} />
          <StatCard label="Prêmio mais desejado" value={mostPopular(premios)} icon={Gift} />
          <StatCard label="Ideias recebidas" value={suggestions.length} icon={Lightbulb} />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <DailyGrowthChart items={buildDailyGrowth(leads)} />
          <SuggestionList items={latestSuggestions} />
          <DistributionChart title="Modalidades praticadas" items={modalidade} />
          <DistributionChart title="Interesse em campeonatos online" items={campeonatos} />
          <DistributionChart title="Faixa de preço mensal" items={valores} />
          <DistributionChart title="Tipo de premiação desejada" items={premios} />
        </div>
      </section>
    </main>
  );
}
