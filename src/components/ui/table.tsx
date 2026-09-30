"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

/**
 * A superficie da tabela — no lugar do cartao com borda em volta.
 *
 * Ate 22/08/2026 toda tabela do painel vivia dentro de um
 * `<div className="rounded-xl border">`: numa pagina que ja e uma folha, isso
 * e moldura sobre moldura, e as bordas laterais roubam largura justamente de
 * quem precisa dela. Agora a tabela usa o fundo da pagina e vai de ponta a
 * ponta; quem separa uma linha da outra sao as divisorias que a propria tabela
 * ja tem.
 *
 * `bleed` (padrao) cancela o padding do `DashboardLayout` para as linhas
 * alcancarem as bordas da tela. Desligue dentro de coluna ou secao — la a
 * tabela deve respeitar a largura do container, senao passa por cima do risco
 * vertical que separa as colunas.
 */
function TableSurface({
  bleed = true,
  className,
  ...props
}: React.ComponentProps<"div"> & { bleed?: boolean }) {
  return (
    <div
      data-slot="table-surface"
      className={cn(
        // Linha em cima e embaixo: e o que faz o bloco ler como tabela sem
        // precisar de caixa em volta.
        "border-y",
        bleed && [
          "-mx-4 md:-mx-6",
          /* Sendo o PRIMEIRO bloco da tela, a tabela COLA no cabecalho: sobe
             o padding do `main` e dispensa a propria linha de cima, porque o
             cabecalho da pagina ja termina numa. Sem isto sobra uma faixa
             vazia entre duas divisorias — que foi como ficou na primeira
             versao. Quando ha algo antes (os cartoes de totais do financeiro,
             um aviso de plano), a linha de cima volta a servir e o
             espacamento normal vale. */
          "first:-mt-4 first:border-t-0",
          /* As DIVISORIAS sangram ate a borda da tela, mas o CONTEUDO nao:
             sem isto a ultima coluna encosta no fim da tela e a primeira no
             comeco. O padding vai nas celulas de ponta, e nao no container,
             para as linhas continuarem inteiras. */
          "[&_td:first-child]:pl-4 [&_th:first-child]:pl-4 md:[&_td:first-child]:pl-6 md:[&_th:first-child]:pl-6",
          "[&_td:last-child]:pr-4 [&_th:last-child]:pr-4 md:[&_td:last-child]:pr-6 md:[&_th:last-child]:pr-6",
        ],
        /*
          ⚠️ **AS DIVISÓRIAS VERTICAIS SÃO DE TODAS AS TABELAS** (29/08/2026,
          pedido do Arthur, depois de as listas de aluno e de funcionário
          ganharem a forma): cada coluna vira um BLOCO que responde uma
          pergunta, e o risco é o que faz o olho parar entre elas. Sem ele a
          linha lê como um parágrafo.

          ⚠️ Mora AQUI, no `TableSurface`, e não em cada tabela: são vinte e
          quatro no painel, e a segunda que alguém esquecesse de acompanhar
          faria o mesmo módulo ter duas caras. O seletor `th + th` / `td + td`
          pega toda célula MENOS a primeira, sem `:not(:first-child)` — que
          erraria em tabela com `colSpan`.

          ⚠️ A célula de AÇÕES (a última) centraliza o conteúdo: encostado à
          direita, o menu ficava colado na borda da tabela e longe da coluna
          que ele serve.
        */
        "[&_thead_th+th]:border-l [&_tbody_td+td]:border-l",
        "[&_tbody_tr>td:last-child>div]:justify-center",
        className
      )}
      {...props}
    />
  )
}

export {
  Table,
  TableSurface,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
