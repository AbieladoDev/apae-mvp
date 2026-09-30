"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Trilha, degrausDaRota } from "./trilha";
import { cn } from "@/lib/utils";
import { moduloDaUrl } from "@/lib/modulos";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  /**
   * O que fica à DIREITA do título: a ação principal da tela ("Novo aluno") e
   * o que a acompanha. Subir isso para o cabeçalho devolve uma faixa inteira
   * de altura ao conteúdo, que é o ganho de espaço da mudança.
   */
  actions?: React.ReactNode;
  /**
   * Segunda linha do cabeçalho: busca, filtros e alternadores de visão.
   * Separada de `actions` porque filtro muda o que se vê e ação muda o que
   * existe — misturar os dois numa linha só faz procurar o botão errado.
   */
  toolbar?: React.ReactNode;
  /**
   * A coluna de resumo da direita.
   *
   * Fica FORA da pilha cabeçalho+conteúdo, de propósito: assim ela sobe até o
   * topo da tela em vez de começar abaixo do título, e ganha a altura inteira
   * para os números. É o que o layout de referência faz — e o motivo de o
   * cabeçalho valer só para a área principal.
   *
   * Some abaixo de `xl`, onde não há largura para duas colunas; a tela é que
   * decide o que fazer com o conteúdo nesse caso (folha lateral, em geral).
   */
  aside?: React.ReactNode;
  /**
   * A tela ocupa a altura disponível e cuida do próprio scroll — o `main` para
   * de rolar e o filho recebe `h-full`. É o que a agenda precisa: uma grade que
   * exige rolar a página para ver o fim do dia deixa de mostrar o dia inteiro,
   * que é a razão de ela existir. Telas de lista continuam no modo padrão.
   */
  fill?: boolean;
  /**
   * Esconde o cabeçalho da página (título, descrição, ações e filtros) e
   * entrega a área inteira para a tela.
   *
   * Para o punhado de telas que SÃO a ferramenta, não um recorte de dados: a
   * agenda em tela cheia é o caso — nela o título repetia o que a grade já
   * diz, e a faixa custava altura de uma tela que vive de altura. Quem usa
   * `bare` precisa oferecer o caminho de volta e os próprios controles.
   */
  bare?: boolean;
  /**
   * Header com a TRILHA e mais nada — sem o `h1`, sem a descrição.
   *
   * Existe para o módulo cujo nome já está escrito na própria tela, e onde
   * repeti-lo num título grande custa altura sem dizer nada de novo. É o caso
   * de Configurações (27/08/2026): a coluna de seções ao lado já diz onde a
   * pessoa está, e o nome da seção aberta aparece no conteúdo.
   *
   * ⚠️ Diferente de `bare`, que tira o cabeçalho INTEIRO: aqui a trilha fica,
   * e com ela o caminho de volta. `bare` obriga a tela a oferecer o retorno
   * por conta própria; `trilhaApenas` não.
   *
   * `actions` e `toolbar` continuam valendo.
   */
  trilhaApenas?: boolean;
  /**
   * Um degrau a mais na trilha, entre o módulo e a tela atual.
   *
   * ⚠️ Necessário porque `moduloDaRota` varre `navSections` — a barra
   * lateral — e há módulo que não mora lá: Configurações fica no RODAPÉ da
   * barra, então a trilha sairia "Início › Perfil", pulando o meio.
   */
  degrauExtra?: { title: string; url: string };
}

/**
 * A casca de todas as telas do painel.
 *
 * Desde 20/08/2026 o conteúdo vai de **borda a borda**: antes era um cartão
 * arredondado flutuando com margem em volta, o que custava ~32px em cada
 * direção e apertava justamente as telas de card e grade. Agora a única
 * separação entre a barra lateral e o conteúdo é uma linha vertical.
 *
 * O cabeçalho ficou maior de propósito — com o título em 12px, saber em que
 * tela se está exigia procurar.
 */
export function DashboardLayout({
  children,
  title,
  description,
  actions,
  toolbar,
  aside,
  fill = false,
  bare = false,
  trilhaApenas = false,
  degrauExtra,
}: DashboardLayoutProps) {
  // Carrega fuso e dados públicos uma vez para os formatadores de horário.
  const pathname = usePathname();
  /**
   * A trilha ("Turmas › Chamada") substituiu o título solto em 21/08/2026: o
   * nome sozinho não dizia de onde a tela vinha, e metade das telas mora
   * dentro de um módulo cuja url nem é prefixo dela (a chamada é de Turmas).
   *
   * A montagem virou `degrausDaRota` em 27/08/2026, quando Configurações
   * passou a precisar da MESMA trilha dentro do próprio conteúdo.
   */
  const trilha = degrausDaRota(pathname, degrauExtra);
  const modulo = moduloDaUrl(pathname);

  return (
    /*
      AVISO: **este componente NAO monta mais a casca do painel.**

      Ate 28/08/2026 ele trazia dentro o `AuthGuard`, o `SidebarProvider`, o
      `AppHeader` e o `AppSidebar` — e como cada uma das 61 telas o monta, o
      App Router destruia e recriava a barra e o cabecalho a CADA navegacao.
      O sintoma era a tela inteira piscar ao trocar de modulo, e nao so a
      parte que mudou.

      A casca vive agora em `PainelShell`, montada no `layout.tsx` de
      `/painel`, que o Next NAO desmonta quando a rota filha muda. Aqui ficou
      o que e DA TELA: trilha, titulo, acoes, barra de filtros e o `main`.

      ⚠️ Devolver qualquer peca da casca para ca reintroduz o bug — e ele
      quase nao aparece em desenvolvimento, onde a navegacao e instantanea.
    */
    <div className="flex h-full min-w-0">
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {/* O nome do módulo mora AQUI, dentro do conteúdo — o cabeçalho
                global é do produto (marca, busca, conta), não da tela. */}
        {!bare && (
          <header className="shrink-0 border-b bg-card px-4 pt-4 md:px-6 md:pt-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
              <div className="flex min-w-0 items-start gap-3">
                {modulo && (
                  <span className={cn("mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl", modulo.selo)}>
                    <modulo.icone className="size-5" strokeWidth={2} />
                  </span>
                )}
                <div className="min-w-0">
                {/* A trilha vem ACIMA e miúda — ela localiza, não é o título. */}
                <Trilha degraus={trilha} atual={title} className="mb-1" />
                {/* O nome da tela, menor do que era: com a trilha em cima e a
                      descrição embaixo, três tamanhos grandes empilhados só
                      empurravam o conteúdo para baixo.

                      Com `trilhaApenas`, some — a pastilha da trilha já diz o
                      nome, e repeti-lo logo abaixo é a mesma palavra duas
                      vezes em duas alturas. */}
                {!trilhaApenas && (
                  <>
                    <h1 className="truncate text-lg font-extrabold md:text-xl">
                      {title}
                    </h1>
                    {description && (
                      <p className="truncate text-sm text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </>
                )}
                </div>
              </div>
              {actions && (
                // Sem `shrink-0`: com ele o bloco assume a largura máxima do
                // conteúdo e NÃO encolhe, então o `flex-wrap` nunca age e os
                // botões transbordam a tela no celular em vez de quebrar
                // linha.
                <div className="flex flex-wrap items-center gap-2">
                  {actions}
                </div>
              )}
            </div>

            {/* A barra de filtros ganha respiro em cima e encosta na borda
                  de baixo do cabeçalho — é o que a separa do conteúdo. */}
            {/* Sem título nem toolbar, a faixa vira só a trilha: o padding
                  cheio deixaria um vão do tamanho de um título que não existe. */}
            <div
              className={cn(
                toolbar
                  ? "pb-4 pt-4 md:pb-5"
                  : trilhaApenas
                    ? "pb-2 md:pb-3"
                    : "pb-4 md:pb-5",
              )}
            >
              {toolbar}
            </div>
          </header>
        )}

        {/* `pb-20` no celular abre espaço para a barra de navegação de
                baixo, que flutua sobre o conteúdo — vale nos dois modos. */}
        <main
          className={cn(
            "min-w-0 flex-1",
            // `bare` entrega a área inteira: a tela cuida do próprio
            // espaçamento, senão o padding do layout come a borda dela.
            bare ? "p-0 pb-20 md:pb-0" : "px-4 pb-20 pt-4 md:px-6 md:pb-6",
            fill ? "min-h-0 overflow-hidden" : "overflow-y-auto",
          )}
        >
          {children}
        </main>
      </div>

      {aside && (
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-l xl:block">
          {aside}
        </aside>
      )}
    </div>
  );
}
