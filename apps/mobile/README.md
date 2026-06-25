# AnglerFish Mobile

App mobile MVP do AnglerFish, criado com Expo, React Native, TypeScript e Supabase.

## O que já existe

- Login e cadastro por email/senha
- Modo demonstração sem Supabase configurado
- Tela do `1º Desafio Beta AnglerFish`
- Envio de captura com foto, vídeo, espécie, tamanho e local
- Ranking inicial do desafio
- Perfil simples
- Upload preparado para o bucket privado `catch-media`

## Variáveis de ambiente

Crie um arquivo `.env` dentro de `apps/mobile`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel-ou-anon
```

Use a chave pública/publishable do Supabase. Não use `service_role` no app mobile.

## Banco de dados

No Supabase SQL Editor, execute:

```text
supabase/migrations/20260625_mobile_mvp.sql
```

Esse SQL cria:

- `profiles`
- `tournaments`
- `tournament_participants`
- `catch_submissions`
- bucket privado `catch-media`
- políticas de RLS para usuários autenticados
- torneio seed `1º Desafio Beta AnglerFish`

## Rodar localmente

Na pasta do app:

```bash
cd apps/mobile
npm install
npm run start
```

Depois escaneie o QR Code com o Expo Go ou abra em um emulador.

## Comandos úteis

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Próximos passos

- Ler campeonatos reais do Supabase
- Sincronizar ranking real
- Adicionar painel admin para aprovar/reprovar capturas
- Adicionar denúncia, bloqueio e termos de uso antes de publicação em lojas
- Preparar EAS Build para Android e iOS
