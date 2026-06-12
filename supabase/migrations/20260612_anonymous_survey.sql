alter table public.survey_responses
  alter column lead_id drop not null;

alter table public.survey_responses
  add column if not exists is_anonymous boolean not null default false;

alter table public.survey_responses
  drop constraint if exists survey_responses_identity_check;

alter table public.survey_responses
  add constraint survey_responses_identity_check check (
    (is_anonymous = true and lead_id is null)
    or
    (is_anonymous = false and lead_id is not null)
  );
