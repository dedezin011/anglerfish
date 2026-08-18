# AnglerFish Mobile

App mobile MVP do AnglerFish, criado com Expo, React Native, TypeScript e Supabase.

> Compatibilidade: este app usa Expo SDK 54 para ampliar a chance de abrir no Expo Go em aparelhos que ainda não conseguem rodar SDKs mais novos.

## O que já existe

- Login e cadastro por email/senha
- Modo demonstração sem Supabase configurado
- Tela do `1º Desafio Beta AnglerFish`
- Envio de captura com foto, vídeo, espécie, tamanho e local
- Ranking inicial do desafio
- Perfil simples
- Upload preparado para o bucket privado `catch-media`
- Aba `Mapa` com marketplace MVP de pontos de pesca
- Cadastro de ponto com localizacao, preco sugerido, tempo ativo, modalidade, cidade e especies alvo
- Marcacao manual de pontos tocando direto no mapa ou usando localizacao atual
- Desbloqueio demo de pontos pagos para validar interesse antes de integrar pagamento real

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
supabase/migrations/20260802_fishing_routes_marketplace.sql
```

Esse SQL cria:

- `profiles`
- `tournaments`
- `tournament_participants`
- `catch_submissions`
- bucket privado `catch-media`
- políticas de RLS para usuários autenticados
- torneio seed `1º Desafio Beta AnglerFish`

O SQL de pontos cria:

- `fishing_routes`
- `fishing_route_points`
- `fishing_route_unlocks`
- politicas de RLS para proteger os pontos exatos antes do desbloqueio
- prazo de venda em `active_until`, para tirar pontos expirados da vitrine

No MVP, `fishing_route_unlocks` registra o desbloqueio sem cobranca real. A integracao com Mercado Pago ou outro provedor deve vir depois por uma API segura no servidor.

## Rodar localmente

Na pasta do app:

```bash
cd apps/mobile
npm install
npm run start -- --clear
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
- Integrar pagamento real para desbloqueio de pontos
- Adicionar avaliacoes e denuncias nos pontos
- Preparar EAS Build para Android e iOS
