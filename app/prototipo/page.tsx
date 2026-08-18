import type { Metadata } from "next";
import Image from "next/image";
import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  DollarSign,
  Eye,
  ImageIcon,
  LockKeyhole,
  MapPin,
  Medal,
  Navigation,
  Plus,
  Ruler,
  Search,
  ShieldCheck,
  Smartphone,
  Star,
  Store,
  Trophy,
  UserRound,
  Users,
  Video,
  Wallet
} from "lucide-react";

export const metadata: Metadata = {
  title: "Protótipo AnglerFish App | Campeonatos e Pontos de Pesca",
  description:
    "Protótipo visual do AnglerFish App, plataforma para campeonatos digitais, validação de capturas, rankings e marketplace de pontos de pesca.",
  alternates: {
    canonical: "/prototipo"
  }
};

const appTabs = ["Campeonato", "Captura", "Pontos", "Ranking", "Perfil"];

const flowSteps = [
  {
    title: "Entrar no torneio",
    description: "O pescador escolhe campeonato, modalidade e regras.",
    icon: Trophy
  },
  {
    title: "Enviar prova",
    description: "Foto na régua, vídeo curto, código do dia e localização.",
    icon: Camera
  },
  {
    title: "Análise segura",
    description: "Organizador aprova ou rejeita pelo painel no computador.",
    icon: ShieldCheck
  },
  {
    title: "Ranking e pontos",
    description: "Capturas aprovadas geram ranking, reputação e recompensas.",
    icon: BarChart3
  }
];

const tournamentCards = [
  {
    title: "Tucunaré Regional",
    location: "São Paulo e região",
    prize: "Iscas + PIX",
    status: "Aberto"
  },
  {
    title: "Tilápia no Pesqueiro",
    location: "Brasil",
    prize: "Kit parceiro",
    status: "Em breve"
  }
];

const mapPoints = [
  { top: "28%", left: "24%", label: "Ponto 1" },
  { top: "48%", left: "58%", label: "Ponto 2" },
  { top: "64%", left: "36%", label: "Ponto 3" }
];

const rankingRows = [
  { name: "Dede", fish: "55 cm", points: "920 pts" },
  { name: "Marcos Guia", fish: "51 cm", points: "840 pts" },
  { name: "Ana Bass", fish: "47 cm", points: "760 pts" }
];

const captureQueue = [
  { name: "Dede", fish: "Tucunaré 55 cm", status: "Em análise" },
  { name: "Marcos Guia", fish: "Traíra 44 cm", status: "Aprovada" },
  { name: "Ana Bass", fish: "Black bass 38 cm", status: "Revisar" }
];

function PhoneFrame({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[2rem] border border-white/15 bg-midnight p-3 shadow-soft">
      <div className="overflow-hidden rounded-[1.6rem] bg-foam">
        <div className="flex items-center justify-between bg-midnight px-5 py-4 text-white">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-300">
              {eyebrow}
            </p>
            <h3 className="mt-1 text-lg font-bold">{title}</h3>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <div className="px-4 py-4">{children}</div>
      </div>
    </article>
  );
}

function PrototypeHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-midnight/92 backdrop-blur">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8"
        aria-label="Navegação do protótipo"
      >
        <a href="/" className="flex items-center">
          <Image
            src="/anglerfish-logo-light.png"
            alt="AnglerFish"
            width={180}
            height={46}
            priority
            className="h-10 w-auto"
          />
        </a>
        <div className="hidden items-center gap-5 text-sm font-semibold text-white/75 md:flex">
          <a className="transition hover:text-white" href="#fluxo">
            Fluxo
          </a>
          <a className="transition hover:text-white" href="#telas">
            Telas
          </a>
          <a className="transition hover:text-white" href="#organizador">
            Organizador
          </a>
          <a
            className="rounded-md bg-reef px-4 py-2 text-white transition hover:bg-kelp"
            href="/"
          >
            Abrir site
          </a>
        </div>
      </nav>
    </header>
  );
}

export default function PrototipoPage() {
  return (
    <main className="min-h-screen bg-foam text-midnight">
      <PrototypeHeader />

      <section className="relative overflow-hidden bg-midnight text-white">
        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_18%_20%,rgba(15,143,117,0.38),transparent_28%),radial-gradient(circle_at_78%_32%,rgba(11,63,92,0.9),transparent_34%),linear-gradient(135deg,#071827,#0b3f5c)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold text-white">
              <Medal className="h-4 w-4" aria-hidden="true" />
              Protótipo navegável do AnglerFish App
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Campeonatos digitais e pontos de pesca em uma experiência mobile.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
              Este protótipo mostra como o pescador entra em torneios, envia
              capturas para análise, acompanha ranking e vende pontos de pesca
              pelo mapa.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#telas"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-reef px-6 py-3 text-sm font-bold text-white transition hover:bg-kelp"
              >
                Ver telas do app
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#organizador"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/35 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Painel do organizador
              </a>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <PhoneFrame title="AnglerFish App" eyebrow="Tela inicial">
              <div className="grid gap-4">
                <div className="rounded-lg bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-reef">
                        Campeonato ativo
                      </p>
                      <h2 className="mt-1 text-xl font-bold">
                        Tucunaré Regional
                      </h2>
                    </div>
                    <span className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold text-reef">
                      Aberto
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-foam p-3">
                      <p className="text-lg font-bold">55</p>
                      <p className="text-xs text-slate-500">maior cm</p>
                    </div>
                    <div className="rounded-md bg-foam p-3">
                      <p className="text-lg font-bold">128</p>
                      <p className="text-xs text-slate-500">envios</p>
                    </div>
                    <div className="rounded-md bg-foam p-3">
                      <p className="text-lg font-bold">R$</p>
                      <p className="text-xs text-slate-500">prêmios</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 rounded-full bg-white p-2">
                  {appTabs.map((tab, index) => (
                    <span
                      key={tab}
                      className={`rounded-full px-2 py-2 text-center text-[11px] font-bold ${
                        index === 0
                          ? "bg-midnight text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>

                <div className="rounded-lg bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-reef/10 text-reef">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-bold">Pontos perto de você</h3>
                      <p className="text-sm text-slate-500">
                        3 locais disponíveis no mapa
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PhoneFrame>
          </div>
        </div>
      </section>

      <section id="fluxo" className="bg-white py-18">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-reef">
              Fluxo principal
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              O protótipo valida a jornada mais importante do produto.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {flowSteps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="rounded-lg border border-slate-200 bg-foam p-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-harbor text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="telas" className="bg-foam py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-reef">
              Telas mobile
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Uma visão prática do que o pescador usa no celular.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <PhoneFrame title="Campeonatos" eyebrow="Participação">
              <div className="grid gap-4">
                <div className="flex min-h-11 items-center gap-3 rounded-md bg-white px-4">
                  <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <span className="text-sm font-semibold text-slate-500">
                    Buscar campeonato
                  </span>
                </div>
                {tournamentCards.map((card) => (
                  <div key={card.title} className="rounded-lg bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{card.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {card.location}
                        </p>
                      </div>
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-reef">
                        {card.status}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                      <span className="font-semibold text-slate-600">
                        {card.prize}
                      </span>
                      <button className="rounded-md bg-midnight px-3 py-2 text-xs font-bold text-white">
                        Entrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </PhoneFrame>

            <PhoneFrame title="Enviar captura" eyebrow="Validação">
              <div className="grid gap-4">
                <div className="rounded-lg bg-white p-4">
                  <p className="text-xs font-bold uppercase text-reef">
                    Código do dia
                  </p>
                  <div className="mt-3 rounded-md border border-dashed border-reef bg-emerald-50 px-4 py-3 text-center text-xl font-bold text-midnight">
                    LAGOA-27
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white p-4">
                    <ImageIcon
                      className="h-6 w-6 text-reef"
                      aria-hidden="true"
                    />
                    <h3 className="mt-3 font-bold">Foto na régua</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Medida visível e peixe inteiro.
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <Video className="h-6 w-6 text-reef" aria-hidden="true" />
                    <h3 className="mt-3 font-bold">Vídeo curto</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Dia, código e peixe na câmera.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-4">
                  <label className="text-sm font-bold">Tamanho em cm</label>
                  <div className="mt-2 flex min-h-11 items-center rounded-md bg-foam px-4 text-lg font-bold">
                    55
                  </div>
                </div>
                <button className="min-h-12 rounded-md bg-reef text-sm font-bold text-white">
                  Enviar para análise
                </button>
              </div>
            </PhoneFrame>

            <PhoneFrame title="Pontos de pesca" eyebrow="Marketplace">
              <div className="grid gap-4">
                <div className="relative h-52 overflow-hidden rounded-lg bg-midnight">
                  <div className="absolute inset-0 opacity-75 [background-image:radial-gradient(circle_at_26%_30%,rgba(8,201,139,0.32),transparent_18%),radial-gradient(circle_at_68%_60%,rgba(255,255,255,0.15),transparent_22%),linear-gradient(135deg,#071827,#0b3f5c)]" />
                  <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
                  {mapPoints.map((point) => (
                    <div
                      key={point.label}
                      className="absolute"
                      style={{ top: point.top, left: point.left }}
                    >
                      <span className="flex h-4 w-4 rounded-full bg-emerald-300 shadow-[0_0_0_8px_rgba(8,201,139,0.22)]" />
                    </div>
                  ))}
                  <Compass
                    className="absolute bottom-4 right-4 h-10 w-10 text-white/35"
                    aria-hidden="true"
                  />
                </div>
                <div className="rounded-lg bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">Ponto do lago escondido</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Prévia liberada, local exato protegido.
                      </p>
                    </div>
                    <span className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-reef">
                      R$ 29
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-foam p-2">
                      <Star className="mx-auto h-4 w-4 text-reef" />
                      <p className="mt-1 text-xs font-bold">4.8</p>
                    </div>
                    <div className="rounded-md bg-foam p-2">
                      <Clock className="mx-auto h-4 w-4 text-reef" />
                      <p className="mt-1 text-xs font-bold">30 dias</p>
                    </div>
                    <div className="rounded-md bg-foam p-2">
                      <LockKeyhole className="mx-auto h-4 w-4 text-reef" />
                      <p className="mt-1 text-xs font-bold">Seguro</p>
                    </div>
                  </div>
                </div>
              </div>
            </PhoneFrame>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <PhoneFrame title="Vender ponto" eyebrow="Renda do pescador">
              <div className="grid gap-4">
                <div className="rounded-lg bg-white p-4">
                  <label className="text-sm font-bold">Nome do ponto</label>
                  <div className="mt-2 rounded-md bg-foam px-4 py-3 text-sm font-semibold text-slate-600">
                    Entrada do braço norte
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white p-4">
                    <DollarSign
                      className="h-5 w-5 text-reef"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                      Preço
                    </p>
                    <p className="mt-1 text-xl font-bold">R$ 19,90</p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <CalendarDays
                      className="h-5 w-5 text-reef"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                      Ativo
                    </p>
                    <p className="mt-1 text-xl font-bold">30 dias</p>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-4">
                  <div className="flex items-center gap-3">
                    <Navigation
                      className="h-5 w-5 text-reef"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-bold">
                      Marcar local manualmente no mapa
                    </p>
                  </div>
                </div>
                <button className="min-h-12 rounded-md bg-midnight text-sm font-bold text-white">
                  Publicar ponto
                </button>
              </div>
            </PhoneFrame>

            <PhoneFrame title="Ranking" eyebrow="Reconhecimento">
              <div className="grid gap-3">
                {rankingRows.map((row, index) => (
                  <div
                    key={row.name}
                    className="flex items-center gap-3 rounded-lg bg-white p-4"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-harbor text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold">{row.name}</h3>
                      <p className="text-sm text-slate-500">{row.fish}</p>
                    </div>
                    <p className="text-sm font-bold text-reef">{row.points}</p>
                  </div>
                ))}
                <div className="rounded-lg bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <BadgeCheck
                      className="h-5 w-5 text-reef"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-bold text-midnight">
                      Capturas aprovadas contam para reputação.
                    </p>
                  </div>
                </div>
              </div>
            </PhoneFrame>

            <PhoneFrame title="Perfil" eyebrow="Histórico">
              <div className="grid gap-4">
                <div className="rounded-lg bg-white p-4 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-harbor text-white">
                    <UserRound className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-xl font-bold">Dede Pescador</h3>
                  <p className="text-sm text-slate-500">
                    São Bernardo do Campo, SP
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xl font-bold">12</p>
                    <p className="text-xs text-slate-500">capturas</p>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xl font-bold">4</p>
                    <p className="text-xs text-slate-500">pontos</p>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xl font-bold">2</p>
                    <p className="text-xs text-slate-500">pódios</p>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-reef" aria-hidden="true" />
                    <p className="text-sm font-bold">
                      Saldo de recompensas e vendas
                    </p>
                  </div>
                </div>
              </div>
            </PhoneFrame>
          </div>
        </div>
      </section>

      <section id="organizador" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase text-reef">
                Painel administrativo
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Organizadores analisam capturas pelo computador.
              </h2>
              <p className="mt-5 leading-7 text-slate-600">
                Cada organizador vê apenas os torneios liberados para seu login,
                evitando mistura de campeonatos. O painel concentra fila de
                análise, provas enviadas, ranking e exportação.
              </p>
              <div className="mt-8 grid gap-3">
                {[
                  "Criar torneio com capa, regras, período e código.",
                  "Ver foto, vídeo, medida informada e localização.",
                  "Aprovar, rejeitar ou pedir revisão da captura.",
                  "Acompanhar ranking e exportar dados do torneio."
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-reef"
                      aria-hidden="true"
                    />
                    <p className="font-semibold text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-foam p-4 shadow-soft">
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-reef">
                      Organizador
                    </p>
                    <h3 className="mt-1 text-xl font-bold">
                      Painel do campeonato
                    </h3>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-md bg-reef px-4 py-2 text-sm font-bold text-white">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Criar torneio
                  </button>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-3">
                  <div className="rounded-lg bg-foam p-4">
                    <Users className="h-5 w-5 text-reef" aria-hidden="true" />
                    <p className="mt-3 text-2xl font-bold">86</p>
                    <p className="text-sm text-slate-500">participantes</p>
                  </div>
                  <div className="rounded-lg bg-foam p-4">
                    <Camera className="h-5 w-5 text-reef" aria-hidden="true" />
                    <p className="mt-3 text-2xl font-bold">128</p>
                    <p className="text-sm text-slate-500">capturas enviadas</p>
                  </div>
                  <div className="rounded-lg bg-foam p-4">
                    <Eye className="h-5 w-5 text-reef" aria-hidden="true" />
                    <p className="mt-3 text-2xl font-bold">17</p>
                    <p className="text-sm text-slate-500">em análise</p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <div className="grid grid-cols-[1fr_1fr_120px] bg-midnight px-4 py-3 text-sm font-bold text-white">
                      <span>Pescador</span>
                      <span>Captura</span>
                      <span>Status</span>
                    </div>
                    {captureQueue.map((item) => (
                      <div
                        key={`${item.name}-${item.fish}`}
                        className="grid grid-cols-[1fr_1fr_120px] border-t border-slate-200 px-4 py-3 text-sm"
                      >
                        <span className="font-bold">{item.name}</span>
                        <span className="text-slate-600">{item.fish}</span>
                        <span className="font-bold text-reef">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-50 px-4 text-sm font-bold text-reef">
                      <Ruler className="h-4 w-4" aria-hidden="true" />
                      Conferir medida
                    </button>
                    <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-50 px-4 text-sm font-bold text-reef">
                      <Video className="h-4 w-4" aria-hidden="true" />
                      Ver prova
                    </button>
                    <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-midnight px-4 text-sm font-bold text-white">
                      <Store className="h-4 w-4" aria-hidden="true" />
                      Exportar CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-midnight py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Pronto para apresentar.</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Use esta página como protótipo visual do AnglerFish App em bancas,
              formulários, conversas com parceiros e validação com pescadores.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-bold text-midnight transition hover:bg-foam"
          >
            Voltar para a landing page
          </a>
        </div>
      </section>
    </main>
  );
}
