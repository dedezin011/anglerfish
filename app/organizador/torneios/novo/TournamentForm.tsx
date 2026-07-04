"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle, PlusCircle } from "lucide-react";
import {
  createOrganizerTournament,
  type CreateTournamentState
} from "@/app/organizador/torneios/actions";

const initialState: CreateTournamentState = {
  ok: false,
  message: ""
};

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function makeCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 18);
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-reef px-5 py-3 text-sm font-black text-midnight transition hover:bg-reef/85 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <PlusCircle className="h-4 w-4" aria-hidden="true" />
      )}
      Criar torneio
    </button>
  );
}

export function TournamentForm() {
  const [state, formAction] = useActionState(createOrganizerTournament, initialState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [code, setCode] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [codeTouched, setCodeTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(makeSlug(name));
    }

    if (!codeTouched) {
      setCode(makeCode(name));
    }
  }, [codeTouched, name, slugTouched]);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-midnight">
          Nome do torneio
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Ex: Desafio Tucunaré AnglerFish"
            className="min-h-12 rounded-md border border-slate-200 bg-foam px-4 text-base font-normal outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-midnight">
          Identificador
          <input
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(makeSlug(event.target.value));
            }}
            required
            placeholder="desafio-tucunare-anglerfish"
            className="min-h-12 rounded-md border border-slate-200 bg-foam px-4 text-base font-normal outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-midnight">
        Descrição
        <textarea
          name="description"
          required
          placeholder="Explique o formato, espécie-alvo e objetivo do campeonato."
          className="min-h-28 rounded-md border border-slate-200 bg-foam px-4 py-3 text-base font-normal outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-midnight">
          Código falado no vídeo
          <input
            name="code"
            value={code}
            onChange={(event) => {
              setCodeTouched(true);
              setCode(makeCode(event.target.value));
            }}
            required
            placeholder="TUCUNA-01"
            className="min-h-12 rounded-md border border-slate-200 bg-foam px-4 text-base font-normal uppercase outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-midnight">
          Status
          <select
            name="status"
            defaultValue="active"
            className="min-h-12 rounded-md border border-slate-200 bg-foam px-4 text-base font-normal outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
          >
            <option value="active">Ativo, aparece no app</option>
            <option value="draft">Rascunho, não aparece no app</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-midnight">
        Premiação
        <input
          name="prize"
          required
          placeholder="Ex: Kit de iscas para os 3 maiores peixes aprovados"
          className="min-h-12 rounded-md border border-slate-200 bg-foam px-4 text-base font-normal outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-midnight">
          Início
          <input
            name="starts_at"
            type="datetime-local"
            className="min-h-12 rounded-md border border-slate-200 bg-foam px-4 text-base font-normal outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-midnight">
          Término
          <input
            name="ends_at"
            type="datetime-local"
            className="min-h-12 rounded-md border border-slate-200 bg-foam px-4 text-base font-normal outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-midnight">
        Regras do envio
        <textarea
          name="rules"
          defaultValue={[
            "Envie uma foto do peixe na régua.",
            "Envie um vídeo curto falando o código do torneio.",
            "Informe espécie, medida, cidade, estado e modalidade.",
            "Capturas ficam em análise antes de entrar no ranking."
          ].join("\n")}
          className="min-h-36 rounded-md border border-slate-200 bg-foam px-4 py-3 text-base font-normal outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/15"
        />
      </label>

      {state.message ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
