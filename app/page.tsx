import {
  Award,
  BadgeCheck,
  BarChart3,
  CalendarCheck,
  Camera,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Gift,
  Globe2,
  History,
  Instagram,
  Mail,
  MapPin,
  Medal,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  UserRound
} from "lucide-react";
import Image from "next/image";
import { WaitlistForm } from "@/app/components/WaitlistForm";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const steps = [
  {
    title: "Cadastre-se",
    description: "Crie seu perfil de pescador, guia, clube ou organizador.",
    icon: UserRound
  },
  {
    title: "Participe de campeonatos",
    description: "Entre em disputas digitais por espécie, região e modalidade.",
    icon: CalendarCheck
  },
  {
    title: "Registre suas capturas",
    description: "Envie capturas com dados, fotos e validação do torneio.",
    icon: Camera
  },
  {
    title: "Ganhe pontos e recompensas",
    description: "Suba no ranking e desbloqueie benefícios exclusivos.",
    icon: Trophy
  }
];

const benefits = [
  { title: "Ranking nacional", icon: BarChart3 },
  { title: "Perfil do pescador", icon: UserRound },
  { title: "Histórico de capturas", icon: History },
  { title: "Campeonatos online", icon: Globe2 },
  { title: "Recompensas exclusivas", icon: Gift },
  { title: "NFTs colecionáveis", icon: BadgeCheck }
];

const roadmap = [
  {
    phase: "Fase 1",
    title: "Comunidade",
    description: "Lista de espera, grupos regionais e primeiros parceiros."
  },
  {
    phase: "Fase 2",
    title: "Campeonatos",
    description: "Eventos digitais, regras de validação e ranking público."
  },
  {
    phase: "Fase 3",
    title: "Marketplace",
    description: "Troca de pontos por equipamentos, iscas, guias e experiências."
  },
  {
    phase: "Fase 4",
    title: "Integração Web3",
    description: "Colecionáveis digitais, conquistas verificáveis e novas recompensas."
  }
];

const faqs = [
  {
    question: "O que é o AnglerFish?",
    answer:
      "É um ecossistema digital para campeonatos de pesca esportiva, com perfis, ranking, registro de capturas, recompensas, colecionáveis digitais e marketplace."
  },
  {
    question: "Preciso ser pescador profissional para participar?",
    answer:
      "Não. A plataforma foi pensada para pescadores esportivos de diferentes níveis, além de guias, pesqueiros, clubes e organizadores."
  },
  {
    question: "Como as capturas serão registradas?",
    answer:
      "A proposta é permitir registros digitais com informações da captura, imagens e critérios de validação definidos por cada campeonato."
  },
  {
    question: "Os campeonatos serão presenciais ou online?",
    answer:
      "O foco inicial é viabilizar campeonatos digitais e híbridos, permitindo que comunidades e organizadores criem disputas com regras claras."
  },
  {
    question: "Como funciona o ranking nacional?",
    answer:
      "Os participantes acumulam pontos em campeonatos e desafios validados. Esses pontos ajudam a compor classificações por modalidade, espécie e região."
  },
  {
    question: "O que poderei trocar no marketplace?",
    answer:
      "A visão do marketplace inclui produtos de pesca, equipamentos, iscas, experiências, serviços de guias e vantagens de parceiros."
  },
  {
    question: "Os NFTs serão obrigatórios?",
    answer:
      "Não. A integração Web3 será uma camada opcional para colecionáveis, conquistas e recompensas digitais."
  },
  {
    question: "Quando a plataforma será lançada?",
    answer:
      "A lista de espera reúne os primeiros interessados e parceiros. Os inscritos receberão novidades sobre comunidade, pilotos e acesso antecipado."
  }
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AnglerFish",
    url: siteUrl,
    description:
      "Ecossistema digital para campeonatos de pesca esportiva com ranking, recompensas, NFTs colecionáveis e marketplace.",
    sameAs: ["https://www.instagram.com/anglerfishbr/"]
  };

  return (
    <main className="min-h-screen bg-foam text-midnight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="absolute left-0 right-0 top-0 z-20">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"
          aria-label="Navegação principal"
        >
          <a href="#" className="flex items-center">
            <Image
              src="/anglerfish-logo-light.png"
              alt="AnglerFish"
              width={190}
              height={48}
              priority
              className="h-11 w-auto"
            />
          </a>
          <div className="hidden items-center gap-6 text-sm font-semibold text-white/85 md:flex">
            <a className="transition hover:text-white" href="#como-funciona">
              Como funciona
            </a>
            <a className="transition hover:text-white" href="#beneficios">
              Benefícios
            </a>
            <a className="transition hover:text-white" href="#roadmap">
              Roadmap
            </a>
            <a
              className="rounded-md bg-white px-4 py-2 text-midnight transition hover:bg-foam"
              href="#lista-de-espera"
            >
              Lista de espera
            </a>
          </div>
        </nav>
      </header>

      <section className="hero-image relative flex min-h-[88vh] items-center pt-24 text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-14 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
              <Medal className="h-4 w-4" aria-hidden="true" />
              Campeonatos digitais com recompensas reais
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              O primeiro ecossistema digital para campeonatos de pesca
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
              Compita, registre capturas, suba no ranking e conquiste
              recompensas exclusivas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lista-de-espera"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-reef px-6 py-3 text-sm font-bold text-white transition hover:bg-kelp focus:outline-none focus:ring-4 focus:ring-white/25"
              >
                Entrar na lista de espera
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#como-funciona"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/25"
              >
                Conhecer o projeto
              </a>
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-white/20 bg-midnight/50 p-5 backdrop-blur md:grid-cols-3 lg:ml-auto lg:max-w-xl">
            <div>
              <p className="text-3xl font-bold">4</p>
              <p className="mt-1 text-sm text-white/75">fases de lançamento</p>
            </div>
            <div>
              <p className="text-3xl font-bold">6</p>
              <p className="mt-1 text-sm text-white/75">frentes de benefício</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="mt-1 text-sm text-white/75">focado em pesca esportiva</p>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-reef">Como funciona</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Da inscrição ao pódio, tudo em uma jornada digital.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="rounded-lg border border-slate-200 bg-foam p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-harbor text-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold text-reef">
                      Passo {index + 1}
                    </span>
                  </div>
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

      <section id="beneficios" className="bg-foam py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-reef">Benefícios</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Uma plataforma para quem pesca, organiza e movimenta a comunidade.
            </h2>
              <p className="mt-5 max-w-xl leading-7 text-slate-600">
              O AnglerFish conecta performance, reputação e recompensas em uma
              experiência pensada para pescadores esportivos, guias, clubes,
              pesqueiros e organizadores de torneios.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className="flex min-h-24 items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-reef/10 text-reef">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-bold">{benefit.title}</h3>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-midnight py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-emerald-300">
              Marketplace
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Pontos que viram produtos, experiências e vantagens para pescar
              melhor.
            </h2>
            <p className="mt-5 leading-7 text-white/75">
              A cada campeonato, desafio e captura validada, os pescadores
              poderão acumular pontos para trocar por produtos de pesca,
              equipamentos, iscas, serviços, experiências com guias e ofertas
              de parceiros.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Produtos", icon: ShoppingBag },
              { title: "Pontos", icon: CircleDollarSign },
              { title: "Parceiros", icon: ShieldCheck }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-lg border border-white/15 bg-white/[0.08] p-5"
                >
                  <Icon className="h-8 w-8 text-emerald-300" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Uma economia de recompensas para fortalecer o ecossistema da
                    pesca esportiva.
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="roadmap" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-reef">Roadmap</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Construção por fases, com comunidade no centro.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((item) => (
              <article
                key={item.phase}
                className="rounded-lg border border-slate-200 bg-foam p-6"
              >
                <p className="text-sm font-bold text-reef">{item.phase}</p>
                <h3 className="mt-3 text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foam py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-reef">
              Acesso antecipado
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Entre na lista dos primeiros pescadores, guias e organizadores.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              A lista de espera ajuda a priorizar regiões, modalidades,
              parceiros e formatos de campeonato para o lançamento inicial.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-reef" aria-hidden="true" />
                <span className="font-semibold">Acesso aos pilotos</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-reef" aria-hidden="true" />
                <span className="font-semibold">Novidades exclusivas</span>
              </div>
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-reef" aria-hidden="true" />
                <span className="font-semibold">Convites para torneios</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-reef" aria-hidden="true" />
                <span className="font-semibold">Comunidade por região</span>
              </div>
            </div>
          </div>
          <WaitlistForm />
        </div>
      </section>

      <section id="faq" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-reef">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Perguntas frequentes
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-lg border border-slate-200 bg-foam p-6"
              >
                <h3 className="text-lg font-bold">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-midnight py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="#" className="flex items-center">
              <Image
                src="/anglerfish-logo-light.png"
                alt="AnglerFish"
                width={190}
                height={48}
                className="h-11 w-auto"
              />
            </a>
            <p className="mt-3 text-sm text-white/70">
              Campeonatos digitais para a nova comunidade da pesca esportiva.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-white/75">
            <a
              className="inline-flex items-center gap-2 transition hover:text-white"
              href="https://www.instagram.com/anglerfishbr/"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
              Instagram
            </a>
            <a
              className="inline-flex items-center gap-2 transition hover:text-white"
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
            <a
              className="inline-flex items-center gap-2 transition hover:text-white"
              href="mailto:contato@anglerfish.com.br"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              contato@anglerfish.com.br
            </a>
            <a className="transition hover:text-white" href="/privacidade">
              Política de privacidade
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
