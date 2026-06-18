alter table public.survey_responses
  add column if not exists sugestao_plataforma text;

alter table public.survey_responses
  drop constraint if exists survey_responses_sugestao_plataforma_length_check;

alter table public.survey_responses
  add constraint survey_responses_sugestao_plataforma_length_check check (
    sugestao_plataforma is null or char_length(sugestao_plataforma) <= 500
  );
