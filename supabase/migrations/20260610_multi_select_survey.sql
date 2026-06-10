alter table public.survey_responses
  drop constraint if exists survey_responses_modalidade_check,
  drop constraint if exists survey_responses_valor_participacao_check,
  drop constraint if exists survey_responses_tipo_premio_check;

alter table public.survey_responses
  alter column modalidade type text[]
    using case
      when modalidade is null then array[]::text[]
      else array[modalidade]
    end,
  alter column valor_participacao type text[]
    using case
      when valor_participacao is null then array[]::text[]
      else array[valor_participacao]
    end,
  alter column tipo_premio type text[]
    using case
      when tipo_premio is null then array[]::text[]
      else array[tipo_premio]
    end;

alter table public.survey_responses
  add constraint survey_responses_modalidade_check check (
    cardinality(modalidade) > 0
    and modalidade <@ array[
      'Pesca embarcada',
      'Pesca de barranco',
      'Caiaque',
      'Pesqueiro',
      'Oceânica',
      'Outras'
    ]::text[]
  ),
  add constraint survey_responses_valor_participacao_check check (
    cardinality(valor_participacao) > 0
    and valor_participacao <@ array[
      'Gratuito',
      'R$10 a R$20',
      'R$20 a R$50',
      'R$50 a R$100',
      'Mais de R$100'
    ]::text[]
  ),
  add constraint survey_responses_tipo_premio_check check (
    cardinality(tipo_premio) > 0
    and tipo_premio <@ array[
      'PIX',
      'Produtos de pesca',
      'Criptomoedas',
      'NFTs colecionáveis',
      'Experiências de pesca'
    ]::text[]
  );
