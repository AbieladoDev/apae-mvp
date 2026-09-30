import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * O ÍCONE À ESQUERDA de cada linha de listagem (28/08/2026, referência do
 * Arthur: "sempre com ícone").
 *
 * Existe para as listas de coisas que NÃO têm cara própria — despesa, plano,
 * anúncio, evento. Aluno e funcionário têm foto; modalidade e categoria têm
 * selo colorido próprio (`ModalityIcon`/`CategoryIcon`) e continuam com eles.
 * Sem isto, cada linha começava com uma parede de texto e a lista virava um
 * bloco cinza uniforme.
 *
 * ⚠️ **Quadrado arredondado, não círculo.** O círculo é a forma de PESSOA no
 * painel (avatar) e dos selos de modalidade/categoria; usar a mesma para uma
 * despesa faria o olho procurar uma pessoa ali.
 *
 * A cor é do TOM do módulo e vem de quem chama — sempre em classes literais,
 * porque o Tailwind não enxerga `bg-${cor}-500/10`.
 */
export function RowIcon({
  icon: Icon,
  className,
  size = 36,
}: {
  icon: React.ElementType
  /** Fundo e cor do traço, em classes literais. */
  className?: string
  size?: number
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Icon
        style={{ width: Math.round(size * 0.45), height: Math.round(size * 0.45) }}
        strokeWidth={1.75}
      />
    </span>
  )
}
