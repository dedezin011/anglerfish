import type { CaptureSubmission, Tournament } from "../types";

export const betaTournament: Tournament = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "1º Desafio Beta AnglerFish",
  code: "ANGLER-01",
  status: "active",
  dateRange: "7 dias de desafio",
  prize: "Kit de iscas para os 3 melhores registros",
  description:
    "Primeiro teste da comunidade para validar campeonatos digitais, ranking e envio de capturas com foto e vídeo.",
  rules: [
    "Envie uma foto do peixe na régua.",
    "Envie um vídeo curto falando o código do desafio.",
    "Informe espécie, medida, cidade, estado e modalidade.",
    "Capturas ficam em análise antes de entrar no ranking."
  ]
};

export const seedRanking: CaptureSubmission[] = [
  {
    id: "demo-1",
    anglerName: "Rafael Souza",
    fishSpecies: "Tucunaré",
    lengthCm: 58.5,
    city: "Presidente Epitácio",
    state: "SP",
    modality: "Pesca embarcada",
    status: "approved",
    createdAt: "2026-06-25T10:00:00.000Z"
  },
  {
    id: "demo-2",
    anglerName: "Marcos Lima",
    fishSpecies: "Traíra",
    lengthCm: 46,
    city: "Londrina",
    state: "PR",
    modality: "Pesca de barranco",
    status: "approved",
    createdAt: "2026-06-25T11:00:00.000Z"
  }
];
