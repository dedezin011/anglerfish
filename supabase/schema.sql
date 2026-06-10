create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads(id) on delete cascade,
  modalidade text not null check (
    modalidade in (
      'Pesca embarcada',
      'Pesca de barranco',
      'Caiaque',
      'Pesqueiro',
      'Oceânica',
      'Outras'
    )
  ),
  interesse_campeonato text not null check (
    interesse_campeonato in ('Sim', 'Talvez', 'Não')
  ),
  valor_participacao text not null check (
    valor_participacao in (
      'Gratuito',
      'R$10 a R$20',
      'R$20 a R$50',
      'R$50 a R$100',
      'Mais de R$100'
    )
  ),
  tipo_premio text not null check (
    tipo_premio in (
      'PIX',
      'Produtos de pesca',
      'Criptomoedas',
      'NFTs colecionáveis',
      'Experiências de pesca'
    )
  ),
  interesse_ranking text not null check (
    interesse_ranking in ('Sim', 'Talvez', 'Não')
  ),
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists survey_responses_created_at_idx on public.survey_responses(created_at desc);
create index if not exists survey_responses_lead_id_idx on public.survey_responses(lead_id);

alter table public.leads enable row level security;
alter table public.survey_responses enable row level security;

-- The app writes and reads through SUPABASE_SERVICE_ROLE_KEY on the server.
-- No public RLS policies are required for this landing page.
