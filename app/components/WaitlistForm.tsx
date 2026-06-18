"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Anchor, CheckCircle2, LoaderCircle, Send, Shield } from "lucide-react";
import {
  joinWaitlist,
  submitSurvey,
  type SurveyState,
  type WaitlistState
} from "@/app/actions";

const initialWaitlistState: WaitlistState = {
  ok: false,
  message: ""
};

const initialSurveyState: SurveyState = {
  ok: false,
  message: ""
};

const surveyQuestions = [
  {
    name: "modalidade",
    label: "Qual modalidade de pesca você pratica?",
    multiple: true,
    options: [
      "Pesca embarcada",
      "Pesca de barranco",
      "Caiaque",
      "Pesqueiro",
      "Oceânica",
      "Outras"
    ]
  },
  {
    name: "interesse_campeonato",
    label: "Você participaria de campeonatos online?",
    multiple: false,
    options: ["Sim", "Talvez", "Não"]
  },
  {
    name: "valor_participacao",
    label: "Quanto estaria disposto a pagar por um campeonato mensal?",
    multiple: true,
    options: [
      "Gratuito",
      "R$10 a R$20",
      "R$20 a R$50",
      "R$50 a R$100",
      "Mais de R$100"
    ]
  },
  {
    name: "tipo_premio",
    label: "Qual tipo de premiação mais te interessa?",
    multiple: true,
    options: [
      "PIX",
      "Produtos de pesca",
      "Criptomoedas",
      "NFTs colecionáveis",
      "Experiências de pesca"
    ]
  },
  {
    name: "interesse_ranking",
    label:
      "Você gostaria de registrar suas capturas e acompanhar rankings nacionais?",
    multiple: false,
    options: ["Sim", "Talvez", "Não"]
  }
];

function WaitlistButton() {
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
        <Send className="h-4 w-4" aria-hidden="true" />
      )}
      Entrar na Lista de Espera
    </button>
  );
}

function SurveyButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-midnight px-5 py-3 text-sm font-bold text-white transition hover:bg-harbor focus:outline-none focus:ring-4 focus:ring-harbor/25 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      )}
      Enviar pesquisa
    </button>
  );
}

function SurveyForm({
  anonymous,
  leadId
}: {
  anonymous: boolean;
  leadId?: string;
}) {
  const [surveyState, surveyAction] = useActionState(
    submitSurvey,
    initialSurveyState
  );

  return (
    <div className="grid gap-5">
      <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-800">
        {anonymous
          ? "Pesquisa anônima ativada. Responda 5 perguntas rápidas sem informar nome ou email."
          : "Obrigado por entrar na lista de espera! Responda 5 perguntas rápidas para nos ajudar a construir a melhor plataforma de pesca do Brasil."}
      </div>

      <form action={surveyAction} className="grid gap-5">
        <input type="hidden" name="lead_id" value={leadId ?? ""} />
        <input type="hidden" name="is_anonymous" value={String(anonymous)} />

        {surveyQuestions.map((question, questionIndex) => (
          <fieldset key={question.name} className="grid gap-3">
            <div>
              <legend className="text-sm font-bold text-midnight">
                {questionIndex + 1}. {question.label}
              </legend>
              {question.multiple ? (
                <p className="mt-1 text-xs font-semibold text-reef">
                  Pode escolher mais de uma opção.
                </p>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => (
                <label
                  key={option}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-foam px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-reef hover:bg-emerald-50"
                >
                  <input
                    required={!question.multiple}
                    type={question.multiple ? "checkbox" : "radio"}
                    name={question.name}
                    value={option}
                    className="h-4 w-4 accent-reef"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <label className="grid gap-2 text-sm font-semibold text-midnight">
          O que você gostaria de ver na AnglerFish?
          <span className="text-xs font-semibold text-slate-500">
            Opcional
          </span>
          <textarea
            name="sugestao_plataforma"
            maxLength={500}
            rows={4}
            className="min-h-28 resize-y rounded-md border border-slate-200 bg-foam px-4 py-3 text-base font-normal text-midnight outline-none transition placeholder:text-slate-400 focus:border-reef focus:ring-4 focus:ring-reef/15"
            placeholder="Ex: campeonatos por espécie, ranking por cidade, premiação em produtos, integração com pesqueiros..."
          />
          <span className="text-xs font-normal leading-5 text-slate-500">
            Se tiver uma ideia, manda sem filtro. Isso ajuda a priorizar o que
            vai entrar primeiro na plataforma.
          </span>
        </label>

        <SurveyButton />

        {surveyState.message ? (
          <p
            className={`rounded-md px-4 py-3 text-sm font-semibold ${
              surveyState.ok
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-700"
            }`}
            role="status"
          >
            {surveyState.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}

export function WaitlistForm() {
  const [anonymousSurvey, setAnonymousSurvey] = useState(false);
  const [waitlistState, waitlistAction] = useActionState(
    joinWaitlist,
    initialWaitlistState
  );

  const showIdentifiedSurvey =
    waitlistState.ok && waitlistState.showSurvey && waitlistState.leadId;

  return (
    <div
      id="lista-de-espera"
      className="rounded-lg border border-white/70 bg-white p-5 shadow-soft sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-harbor text-white">
          <Anchor className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-midnight">Lista de espera</h2>
          <p className="text-sm text-slate-600">
            Entre primeiro ou responda de forma anônima.
          </p>
        </div>
      </div>

      {anonymousSurvey ? (
        <SurveyForm anonymous />
      ) : showIdentifiedSurvey ? (
        <SurveyForm anonymous={false} leadId={waitlistState.leadId} />
      ) : (
        <div className="grid gap-4">
          <form action={waitlistAction} className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-midnight">
              Nome
              <input
                name="nome"
                required
                autoComplete="name"
                className="min-h-12 rounded-md border border-slate-200 bg-foam px-4 text-base font-normal text-midnight outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
                placeholder="Seu nome"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-midnight">
              E-mail
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="min-h-12 rounded-md border border-slate-200 bg-foam px-4 text-base font-normal text-midnight outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
                placeholder="voce@email.com"
              />
            </label>

            <WaitlistButton />

            {waitlistState.message ? (
              <p
                className={`rounded-md px-4 py-3 text-sm font-semibold ${
                  waitlistState.ok
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-red-50 text-red-700"
                }`}
                role="status"
              >
                {waitlistState.message}
              </p>
            ) : null}
          </form>

          <div className="grid gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setAnonymousSurvey(true)}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-midnight transition hover:border-reef hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-reef/15"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              Responder pesquisa anonimamente
            </button>
            <p className="text-xs leading-5 text-slate-500">
              A resposta anônima não entra na lista de espera, mas ajuda a
              validar campeonatos, recompensas e preços.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
