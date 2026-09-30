"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Filtro de uma escolha só, com TODAS as opções visíveis.
 *
 * Substitui o `Select` onde o conjunto de opções é curto e fixo (situação,
 * origem). O motivo é o do Arthur, em 25/08/2026: no `Select` fechado só dá
 * para ler o que está escolhido — para saber o que EXISTE, e conferir que nada
 * ficou marcado por engano, é preciso abrir cada um. Com as opções à mostra, a
 * pergunta "o que está filtrado?" se responde de relance.
 *
 * ⚠️ **Só para conjunto curto e FIXO.** Categoria de despesa continua em
 * `Select`: a lista vem do banco e cresce com o uso, e trinta pílulas em duas
 * linhas são piores do que uma lista suspensa. A régua prática é ~6 opções.
 *
 * ⚠️ A contagem é OPCIONAL e vem de fora (`totals` da API), nunca do que está
 * carregado na tela. Contar o array da página diria "3" quando existem 120 —
 * e o número errado ao lado do filtro é pior do que número nenhum.
 */

export interface OpcaoChip {
  value: string;
  label: string;
  /** Quantos itens caem neste filtro. Vem dos totais da API. */
  count?: number;
}

export function FiltroChips({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: OpcaoChip[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {options.map((o) => {
        const ativo = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors",
              ativo
                ? "border-transparent bg-foreground font-medium text-background"
                : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span
                className={cn(
                  "tabular-nums",
                  ativo ? "text-background/60" : "text-muted-foreground/60",
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * O realce de um `Select` que está FILTRANDO alguma coisa.
 *
 * Existe pelo mesmo motivo do `FiltroChips`, para o caso em que ele não cabe:
 * quando a lista é longa (17 módulos no histórico) ou dinâmica (pessoas,
 * categorias de despesa), transformar em pílulas seria trocar um problema por
 * três linhas de bolinhas. Mas a dor continua a mesma — "sobrou algum filtro
 * marcado?" —, e ela se resolve fazendo o campo ATIVO parecer diferente do
 * campo em repouso.
 *
 * Sem isto, um `Select` mostrando "Aluno" e outro mostrando "Todos os módulos"
 * têm exatamente o mesmo peso visual, e a diferença entre estar filtrando e não
 * estar exige LER cada campo.
 *
 * ⚠️ **Ela é o ÚNICO lugar que define o visual do filtro-select.** Até
 * 28/08/2026 a listagem de alunos somava `h-7 text-xs` por fora e as outras
 * não somavam nada — e o mesmo filtro tinha duas caras conforme a tela.
 *
 * ⚠️ **E aquele `h-7` era CSS MORTO.** O `SelectTrigger` do shadcn traz
 * `data-[size=default]:h-9`, e seletor de atributo vence classe simples: a
 * altura nunca mudou em tela nenhuma. Para mexer na altura, é a prop
 * `size="sm"` do componente — não uma classe `h-*`, que o navegador ignora
 * sem avisar ninguém.
 *
 * Uso: `<SelectTrigger className={classeFiltroSelect(x !== TODOS)}>` — e a
 * largura por cima, quando precisar: `cn(classeFiltroSelect(...), "w-48")`.
 */
export function classeFiltroSelect(ativo: boolean): string {
  return ativo
    ? "border-foreground/40 bg-muted/60 font-medium text-foreground"
    : "";
}
