"use client"

import { StatusBadge, type TomDeEstado } from "@/components/common/status-badge"
import { ESTADO_BEM_LABEL, ORIGEM_BEM_LABEL } from "@/data/catalogo"
import type { EstadoBem, OrigemBem } from "@/data/tipos"
import { cn } from "@/lib/utils"

const ESTADO_TOM: Record<EstadoBem, TomDeEstado> = { novo: "ok", bom: "andamento", regular: "espera", ruim: "alerta" }

export function EstadoBemBadge({ estado }: { estado: EstadoBem }) {
  return <StatusBadge tom={ESTADO_TOM[estado]}>{ESTADO_BEM_LABEL[estado]}</StatusBadge>
}

const ORIGEM_COR: Record<OrigemBem, string> = {
  compra: "bg-orange-100 text-orange-800",
  doacao: "bg-emerald-100 text-emerald-800",
  verba: "bg-amber-100 text-amber-800",
}

export function OrigemBemBadge({ origem }: { origem: OrigemBem }) {
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", ORIGEM_COR[origem])}>{ORIGEM_BEM_LABEL[origem]}</span>
}

/** Próxima plaqueta livre: APAE-0013, APAE-0014… */
export function proximaPlaqueta(plaquetas: string[]): string {
  const maior = plaquetas.reduce((m, p) => Math.max(m, parseInt(p.replace(/\D/g, ""), 10) || 0), 0)
  return `APAE-${String(maior + 1).padStart(4, "0")}`
}
