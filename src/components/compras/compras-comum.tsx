"use client"

import { Check, ClipboardList, ShoppingBag, ThumbsUp, Wallet, X } from "lucide-react"

import { StatusBadge, type TomDeEstado } from "@/components/common/status-badge"
import { STATUS_COMPRA_LABEL, URGENCIA_LABEL } from "@/data/catalogo"
import type { Compra, StatusCompra, Urgencia } from "@/data/tipos"
import { cn } from "@/lib/utils"

export const STATUS_TOM: Record<StatusCompra, TomDeEstado> = {
  solicitada: "espera",
  aprovada: "andamento",
  recusada: "alerta",
  comprada: "ok",
  cancelada: "neutro",
}

export function StatusCompraBadge({ status }: { status: StatusCompra }) {
  return <StatusBadge tom={STATUS_TOM[status]}>{STATUS_COMPRA_LABEL[status]}</StatusBadge>
}

export function UrgenciaBadge({ urgencia }: { urgencia: Urgencia }) {
  if (urgencia === "normal") return <span className="text-xs text-muted-foreground">Normal</span>
  return (
    <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-bold", urgencia === "alta" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600")}>
      {URGENCIA_LABEL[urgencia]}
    </span>
  )
}

export const totalEstimado = (c: Compra) => c.itens.reduce((t, i) => t + i.quantidade * i.estimadoCents, 0)

export function resumoItens(c: Compra) {
  const primeiro = c.itens[0]?.descricao ?? "Sem itens"
  return c.itens.length > 1 ? `${primeiro} e mais ${c.itens.length - 1}` : primeiro
}

/**
 * O caminho da compra em quatro passos (padrão do stepper do mcm_admin, em
 * versão curta): Solicitada → Aprovada → Comprada → Conta a pagar.
 * Recusada e cancelada param a linha no passo em que aconteceram.
 */
export function CaminhoCompra({ compra }: { compra: Compra }) {
  const parou = compra.status === "recusada" || compra.status === "cancelada"
  const ordem: StatusCompra[] = ["solicitada", "aprovada", "comprada"]
  const idx = parou ? 1 : ordem.indexOf(compra.status) + 1
  const passos = [
    { rotulo: "Solicitada", detalhe: compra.solicitanteNome, icone: ClipboardList },
    { rotulo: compra.status === "recusada" ? "Recusada" : "Aprovada", detalhe: compra.aprovadoPor ?? "Direção", icone: compra.status === "recusada" ? X : ThumbsUp },
    { rotulo: "Comprada", detalhe: compra.compradoPor ?? "Compras", icone: ShoppingBag },
    { rotulo: "Conta a pagar", detalhe: compra.contaPagarId ? "Lançada" : "Financeiro", icone: Wallet },
  ]
  // passo i está feito quando i < idx; com "comprada" a conta já nasce junto
  const feito = (i: number) => compra.status === "comprada" || i < idx
  return (
    <ol className="flex items-start">
      {passos.map((p, i) => {
        const Icone = p.icone
        const ok = feito(i)
        const erro = compra.status === "recusada" && i === 1
        const atual = !ok && !erro && i === idx && !parou
        return (
          <li key={p.rotulo} className="flex flex-1 items-start last:flex-none">
            <div className="flex w-20 flex-col items-center text-center sm:w-24">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 transition-colors",
                  ok && "border-emerald-500 bg-emerald-500 text-white",
                  erro && "border-rose-500 bg-rose-500 text-white",
                  atual && "border-orange-400 bg-orange-50 text-orange-600 ring-4 ring-orange-100",
                  !ok && !erro && !atual && "border-border bg-card text-muted-foreground"
                )}
              >
                {ok ? <Check className="size-5" strokeWidth={3} /> : <Icone className="size-4" />}
              </span>
              <span className={cn("mt-1.5 text-xs font-bold", !ok && !atual && !erro && "text-muted-foreground")}>{p.rotulo}</span>
              <span className="line-clamp-1 text-[11px] text-muted-foreground">{p.detalhe}</span>
            </div>
            {i < passos.length - 1 && <span className={cn("mt-5 h-0.5 flex-1 rounded-full", feito(i + 1) ? "bg-emerald-500" : "bg-border")} />}
          </li>
        )
      })}
    </ol>
  )
}
