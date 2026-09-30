"use client"

import { TIPO_PRESTADOR_LABEL, DIAS_SEMANA } from "@/data/catalogo"
import type { DiaNaCasa, TipoPrestador } from "@/data/tipos"
import { cn } from "@/lib/utils"

const TIPO_COR: Record<TipoPrestador, string> = {
  contrato: "bg-blue-100 text-blue-800",
  voluntario: "bg-emerald-100 text-emerald-800",
  cedido: "bg-violet-100 text-violet-800",
}

export function TipoPrestadorBadge({ tipo }: { tipo: TipoPrestador }) {
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", TIPO_COR[tipo])}>{TIPO_PRESTADOR_LABEL[tipo]}</span>
}

/** Cor por área — o que o profissional faz é o que a equipe procura primeiro. */
export const COR_AREA: Record<string, string> = {
  Fonoaudiologia: "bg-sky-100 text-sky-700",
  Fisioterapia: "bg-emerald-100 text-emerald-700",
  Psicologia: "bg-violet-100 text-violet-700",
  "Terapia ocupacional": "bg-amber-100 text-amber-800",
  Neuropediatria: "bg-rose-100 text-rose-700",
  Nutrição: "bg-lime-100 text-lime-800",
  "Educação física": "bg-orange-100 text-orange-700",
  Música: "bg-pink-100 text-pink-700",
  Contabilidade: "bg-slate-100 text-slate-700",
  "Manutenção elétrica": "bg-yellow-100 text-yellow-800",
  "Manutenção predial": "bg-stone-100 text-stone-700",
}

/** Os sete dias da semana, acesos nos dias em que a pessoa está na casa. */
export function DiasNaCasa({ dias }: { dias: DiaNaCasa[] }) {
  const hojeDia = new Date().getDay()
  return (
    <span className="inline-flex gap-0.5">
      {DIAS_SEMANA.map((rot, i) => {
        const tem = dias.some((d) => d.dia === i)
        return (
          <span
            key={rot}
            title={rot}
            className={cn(
              "flex size-6 items-center justify-center rounded-md text-[10px] font-bold",
              tem ? "bg-pink-500 text-white" : "bg-muted text-muted-foreground/50",
              i === hojeDia && "ring-2 ring-girassol ring-offset-1"
            )}
          >
            {rot[0]}
          </span>
        )
      })}
    </span>
  )
}
