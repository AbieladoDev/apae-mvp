# apae-mvp

**Cliente / nicho:** APAE de Esteio (associação de assistência a pessoas com deficiência). MVP de
demonstração do painel de gestão — financeiro com verbas/apoiadores, prestação de contas, compras com
aprovação, estoque, patrimônio e prestadores. **Não está em produção**; deploy de demo na Vercel.
**Papel:** painel (front-only, sem API)
**Irmãos:** nenhum ainda (quando virar sistema: `apae-api` + `apae-client`, copiando da Vetro/TodosDan)

## Banco
Não usa banco. Todos os dados vivem em `src/store/demo-store.ts` (zustand + `persist` no
`localStorage`, chave `apae-demo`), semeados por `src/data/seed.ts`. Sem `.env` — não há variável.

## Comandos
dev: `pnpm dev` · build: `pnpm build` · test: não há (a lógica do store foi exercitada com um script
tsx descartável) · lint: `pnpm lint` · migration: não se aplica

## Estrutura
- `src/app/login` — escolha de perfil (Direção, Financeiro, Compras, Funcionário). Não há senha.
- `src/app/painel/<modulo>` — lista em `page.tsx`, `cadastro/`, `[id]/` (ficha), `[id]/edicao/`.
  As páginas de rota são finas: o conteúdo está em `src/components/<modulo>/`.
- `src/store/demo-store.ts` — o "banco" e TODAS as ações de domínio. Cada ação chama `registrar()`,
  que grava o histórico e, quando alguém precisa agir, a notificação para os perfis certos.
- `src/store/sessao-store.ts` — perfil logado; `usePode(permissao)`.
- `src/lib/permissoes.ts` — matriz perfil → permissões (`recurso.acao`, igual à API da TodosDan).
- `src/lib/derivados.ts` — o que é CALCULADO: situação de conta, saldo de verba, situação de estoque.
- `src/lib/modulos.ts` — ícone e cor de cada módulo (menu, cabeçalho, dashboard).
- `src/components/apae/` — peças do MVP: `Guard`, `Vazio`, `FaixaIndicadores`, `SeletorVerba`,
  `BarraUso`, e `ficha.tsx` (molde de visualização 25% identidade + 75% abas).
- `src/components/contas/` — UM conjunto de componentes para pagar E receber; a diferença de
  vocabulário está em `tipo-conta.ts`.

## Diferenças em relação ao template
Base copiada da **todosDan-client** (shell, `ui/`, `common/`, audit), não do `default-admin`, porque
o pedido era "tudo nos nossos padrões, como na TodosDan":
- **Sem camada de API**: `lib/api/*`, axios, socket, AuthGuard e settings saíram. O `demo-store`
  faz o papel da API; os nomes das ações foram pensados para virar endpoints.
- **Paleta própria** (azul + girassol/folha da logo, sidebar azul) em vez do preto e branco da
  TodosDan. Só tema claro; sem `next-themes`.
- `command-search`, `notification-list`, `user-menu`, `app-header`, `app-sidebar`, `nav-config`,
  `quick-create`, `bottom-nav`, `mobile-menu-sheet` e `audit/*` foram reescritos sobre o store.
  O menu do usuário também **troca de perfil** e **restaura os dados de demo**.
- `dashboard-layout.tsx` ganhou o selo colorido do módulo ao lado do título.
- Skill `modulo-painel`, passo 0 (conferir endpoint na `-api`): **não se aplica** — não há API.

## Armadilhas
- O painel só renderiza **depois de montar no navegador** (`painel-shell.tsx`): os dados vêm do
  localStorage e as datas do seed são relativas a hoje. Por isso `curl` numa rota devolve 200 com
  o spinner — não prova que a tela funciona.
- Mudou o formato de algum tipo em `data/tipos.ts`? Quem já abriu a demo tem o formato velho no
  localStorage: use "Restaurar dados de demonstração" (menu do usuário) ou suba `version` no persist.
- `useSearchParams` exigiria Suspense no build; os atalhos `?novo=1`, `?mov=1` e
  `?compra=&item=` são lidos com `window.location.search` num efeito.
- `eslint-plugin-react-hooks` está travado em 7.0.1 via `overrides` no `pnpm-workspace.yaml` — a 7.1
  acusa `setState` em efeito em 16 lugares, incluindo os componentes copiados da TodosDan.
- `pnpm build` precisa do `pnpm-workspace.yaml` com `allowBuilds` (mesma armadilha do cuble-db-mvp).
- Cores de gráfico entrou × saiu são **azul × laranja** (`components/prestacao/graficos.tsx`): o par
  verde × vermelho falhou no validador de daltonismo.
