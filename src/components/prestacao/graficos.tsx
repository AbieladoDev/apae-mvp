"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatPrice } from "@/lib/format"

/**
 * ENTROU × SAIU — o par de cores de todo gráfico financeiro do MVP.
 * Azul e laranja, e não verde e vermelho: o par verde/vermelho falhou no
 * validador de daltonismo (ΔE 5,6 deutan); azul/laranja passa com folga (29).
 */
export const COR_ENTROU = "#1d64d8"
export const COR_SAIU = "#ea580c"

const CONFIG = {
  entrou: { label: "Entrou", color: COR_ENTROU },
  saiu: { label: "Saiu", color: COR_SAIU },
} satisfies ChartConfig

/** Barras lado a lado por mês. Uma escala só (as duas medidas são reais). */
export function GraficoEntrouSaiu({ dados, altura = 240 }: { dados: { mes: string; entrou: number; saiu: number }[]; altura?: number }) {
  return (
    <ChartContainer config={CONFIG} className="w-full" style={{ height: altura }}>
      <BarChart data={dados} margin={{ left: 4, right: 4, top: 8 }} barGap={2} barCategoryGap="22%">
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={<ChartTooltipContent formatter={(v, n) => (
            <span className="flex w-full justify-between gap-4">
              <span className="text-muted-foreground">{n === "entrou" ? "Entrou" : "Saiu"}</span>
              <span className="font-bold tabular-nums">{formatPrice(Number(v))}</span>
            </span>
          )} />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="entrou" fill="var(--color-entrou)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="saiu" fill="var(--color-saiu)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

/**
 * Ranking em barras horizontais (categoria, origem, apoiador). Uma série só:
 * a cor não carrega identidade — o nome está escrito ao lado de cada barra.
 */
export function Ranking({ itens, cor, vazio }: { itens: { rotulo: string; valor: number; ponto?: string }[]; cor: string; vazio: string }) {
  if (itens.length === 0) return <p className="text-sm text-muted-foreground">{vazio}</p>
  const maior = Math.max(...itens.map((i) => i.valor), 1)
  const total = itens.reduce((t, i) => t + i.valor, 0)
  return (
    <ul className="space-y-3">
      {itens.map((i) => (
        <li key={i.rotulo} className="group" title={`${i.rotulo}: ${formatPrice(i.valor)}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-1.5 font-semibold">
              {i.ponto && <span className="size-2 shrink-0 rounded-full" style={{ background: i.ponto }} />}
              <span className="truncate">{i.rotulo}</span>
            </span>
            <span className="shrink-0 tabular-nums">
              {formatPrice(i.valor)} <span className="text-xs text-muted-foreground">{Math.round((i.valor / total) * 100)}%</span>
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full transition-opacity group-hover:opacity-80" style={{ width: `${Math.max((i.valor / maior) * 100, 1.5)}%`, background: cor }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
