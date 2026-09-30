"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Ban,
  CheckCircle2,
  ChevronRight,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import type { AcaoAuditoria, Auditoria } from "@/data/tipos"
import { cn } from "@/lib/utils"
import { auditEntityHref, ENTIDADE_LABEL } from "./audit-entity-route"

const ESTILO: Record<AcaoAuditoria, { icone: LucideIcon; classe: string; verbo: string }> = {
  CREATE: { icone: Plus, classe: "bg-emerald-100 text-emerald-700", verbo: "criou" },
  UPDATE: { icone: Pencil, classe: "bg-blue-100 text-blue-700", verbo: "alterou" },
  DELETE: { icone: Trash2, classe: "bg-rose-100 text-rose-700", verbo: "removeu" },
  APROVAR: { icone: CheckCircle2, classe: "bg-emerald-100 text-emerald-700", verbo: "aprovou" },
  RECUSAR: { icone: XCircle, classe: "bg-rose-100 text-rose-700", verbo: "recusou" },
  COMPRAR: { icone: ShoppingBag, classe: "bg-orange-100 text-orange-700", verbo: "marcou como comprada" },
  CANCELAR: { icone: Ban, classe: "bg-slate-100 text-slate-700", verbo: "cancelou" },
  PAGAR: { icone: Wallet, classe: "bg-emerald-100 text-emerald-700", verbo: "pagou" },
  RECEBER: { icone: Wallet, classe: "bg-emerald-100 text-emerald-700", verbo: "registrou o recebimento de" },
  ENTRADA: { icone: ArrowDownToLine, classe: "bg-teal-100 text-teal-700", verbo: "deu entrada em" },
  SAIDA: { icone: ArrowUpFromLine, classe: "bg-amber-100 text-amber-700", verbo: "retirou do estoque" },
  TRANSFERIR: { icone: ArrowLeftRight, classe: "bg-violet-100 text-violet-700", verbo: "transferiu" },
}

function chaveDoDia(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function rotuloDoDia(chave: string): string {
  if (chave === chaveDoDia(new Date().toISOString())) return "Hoje"
  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)
  if (chave === chaveDoDia(ontem.toISOString())) return "Ontem"
  const [ano, mes, dia] = chave.split("-")
  const semana = new Date(Number(ano), Number(mes) - 1, Number(dia)).toLocaleDateString("pt-BR", { weekday: "short" })
  return `${semana.replace(".", "")}, ${dia}/${mes}/${ano}`
}

function hora(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

/**
 * A linha do tempo do histórico, agrupada por dia (mesmo desenho da TodosDan).
 * Usada na tela de Histórico e no "Ver histórico" do rodapé de cada ficha.
 */
export function AuditTimeline({
  entries,
  mostrarEntidade = false,
  semLink = false,
  vazio = "Nenhuma alteração registrada.",
}: {
  entries: Auditoria[]
  mostrarEntidade?: boolean
  semLink?: boolean
  vazio?: string
}) {
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">{vazio}</p>

  const dias: { chave: string; entradas: Auditoria[] }[] = []
  for (const e of entries) {
    const chave = chaveDoDia(e.data)
    const ultimo = dias[dias.length - 1]
    if (ultimo?.chave === chave) ultimo.entradas.push(e)
    else dias.push({ chave, entradas: [e] })
  }

  return (
    <div className="space-y-5">
      {dias.map((dia) => (
        <section key={dia.chave}>
          <h3 className="sticky top-0 z-10 -mx-1 mb-2 bg-card/95 px-1 py-1 text-xs font-bold text-muted-foreground backdrop-blur">
            {rotuloDoDia(dia.chave)}
          </h3>
          <ul>
            {dia.entradas.map((e, i) => {
              const { icone: Icone, classe, verbo } = ESTILO[e.acao]
              const href = semLink ? null : auditEntityHref(e.entidade, e.entidadeId, e.acao)
              const ultimo = i === dia.entradas.length - 1
              const miolo = (
                <>
                  <div className="relative flex shrink-0 flex-col items-center">
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", classe)}>
                      <Icone className="h-3.5 w-3.5" />
                    </span>
                    {!ultimo && <span className="w-px flex-1 bg-border" aria-hidden />}
                  </div>
                  <div className="min-w-0 flex-1 pb-3">
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className="text-sm font-bold">{e.usuario}</span>
                      <span className="text-sm text-muted-foreground">{verbo}</span>
                      {mostrarEntidade && <span className="text-sm text-muted-foreground">{ENTIDADE_LABEL[e.entidade].toLowerCase()}</span>}
                      <span className="text-sm font-semibold">{e.rotulo}</span>
                      <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">{hora(e.data)}</span>
                      {href && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden />}
                    </div>
                    {e.mudancas && e.mudancas.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {e.mudancas.map((m) => (
                          <li key={m.campo} className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{m.campo}</span>: <span className="line-through">{m.de}</span> → {m.para}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )
              return (
                <li key={e.id}>
                  {href ? (
                    <Link href={href} className="group -mx-2 flex gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-muted/60">
                      {miolo}
                    </Link>
                  ) : (
                    <div className="-mx-2 flex gap-3 px-2 py-1">{miolo}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
