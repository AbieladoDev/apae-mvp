import type { TomDeEstado } from "@/components/common/status-badge"
import type { ContaPagar, ContaReceber, ItemEstoque, Verba } from "@/data/tipos"
import { hoje, somarDias } from "./datas"

/**
 * Tudo que é CALCULADO e não guardado: situação de conta, saldo de verba,
 * situação do estoque. Guardar isso seria ter duas verdades.
 */

export type SituacaoConta = "quitada" | "vencida" | "hoje" | "semana" | "aberta"

export function situacaoConta(c: { vencimento: string; pagoEm?: string; recebidoEm?: string }): SituacaoConta {
  if (c.pagoEm || c.recebidoEm) return "quitada"
  const h = hoje()
  if (c.vencimento < h) return "vencida"
  if (c.vencimento === h) return "hoje"
  if (c.vencimento <= somarDias(h, 7)) return "semana"
  return "aberta"
}

export const SITUACAO_TOM: Record<SituacaoConta, TomDeEstado> = {
  quitada: "ok",
  vencida: "alerta",
  hoje: "espera",
  semana: "andamento",
  aberta: "neutro",
}

export function rotuloSituacao(s: SituacaoConta, tipo: "pagar" | "receber"): string {
  switch (s) {
    case "quitada":
      return tipo === "pagar" ? "Paga" : "Recebida"
    case "vencida":
      return "Vencida"
    case "hoje":
      return "Vence hoje"
    case "semana":
      return "Vence em 7 dias"
    default:
      return tipo === "pagar" ? "A pagar" : "A receber"
  }
}

export interface ResumoVerba {
  verba: Verba
  recebidoCents: number
  aReceberCents: number
  gastoCents: number
  comprometidoCents: number
  saldoCents: number
  usoPct: number
}

/**
 * Gasto = contas a pagar da verba já pagas; comprometido = em aberto.
 * O saldo é sobre o VALOR APROVADO da verba — é o que a prestação de contas
 * cobra: quanto do que foi concedido já tem destino.
 */
export function resumoVerba(verba: Verba, pagar: ContaPagar[], receber: ContaReceber[]): ResumoVerba {
  let gasto = 0
  let comprometido = 0
  for (const c of pagar) {
    if (c.verbaId !== verba.id) continue
    if (c.pagoEm) gasto += c.valorCents
    else comprometido += c.valorCents
  }
  let recebido = 0
  let aReceber = 0
  for (const c of receber) {
    if (c.verbaId !== verba.id) continue
    if (c.recebidoEm) recebido += c.valorCents
    else aReceber += c.valorCents
  }
  const usado = gasto + comprometido
  return {
    verba,
    recebidoCents: recebido,
    aReceberCents: aReceber,
    gastoCents: gasto,
    comprometidoCents: comprometido,
    saldoCents: verba.valorCents - usado,
    usoPct: verba.valorCents > 0 ? Math.round((usado / verba.valorCents) * 100) : 0,
  }
}

export type SituacaoEstoque = "ok" | "baixo" | "zerado"

export function situacaoEstoque(i: ItemEstoque): SituacaoEstoque {
  if (i.quantidade <= 0) return "zerado"
  if (i.quantidade <= i.minimo) return "baixo"
  return "ok"
}

export const ESTOQUE_TOM: Record<SituacaoEstoque, TomDeEstado> = { ok: "ok", baixo: "espera", zerado: "alerta" }
export const ESTOQUE_LABEL: Record<SituacaoEstoque, string> = { ok: "Em dia", baixo: "Abaixo do mínimo", zerado: "Zerado" }

export function somaCents<T>(lista: T[], f: (x: T) => number): number {
  return lista.reduce((t, x) => t + f(x), 0)
}
