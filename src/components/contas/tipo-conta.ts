"use client"

import * as React from "react"

import { CATEGORIAS_DESPESA, COR_CATEGORIA, COR_ORIGEM, ORIGENS_RECEITA } from "@/data/catalogo"
import type { ContaPagar, ContaReceber, FormaPagamento } from "@/data/tipos"
import { MODULOS } from "@/lib/modulos"
import { useDemo } from "@/store/demo-store"

/**
 * Contas a pagar e a receber são a MESMA tela com vocabulário diferente.
 * Este arquivo é o "dicionário" das duas: um componente só de lista, ficha e
 * formulário, e aqui a diferença (categoria × origem, fornecedor × pagador,
 * paga × recebida).
 */
export type TipoConta = "pagar" | "receber"

export interface ContaView {
  id: string
  descricao: string
  valorCents: number
  vencimento: string
  classe: string
  contraparte: string
  usaVerba: boolean
  verbaId?: string
  apoiadorId?: string
  prestadorId?: string
  compraId?: string
  quitadoEm?: string
  forma?: FormaPagamento
  observacoes: string
  criadoEm: string
}

export const TIPO = {
  pagar: {
    modulo: MODULOS.pagar,
    base: "/painel/contas-a-pagar",
    singular: "conta a pagar",
    titulo: "Contas a pagar",
    descricao: "O que a APAE paga: fornecedores, serviços, consumo e compras aprovadas",
    classeRotulo: "Categoria",
    classes: CATEGORIAS_DESPESA as readonly string[],
    corClasse: (c: string) => COR_CATEGORIA[c]?.hex ?? "#94a3b8",
    contraparteRotulo: "Fornecedor",
    contrapartePlaceholder: "Quem vai receber o pagamento",
    quitado: "Paga",
    quitar: "Marcar como paga",
    quitadoEm: "Paga em",
    desfazer: "Desfazer pagamento",
    lancar: "Lançar conta a pagar",
    nova: "Nova conta a pagar",
  },
  receber: {
    modulo: MODULOS.receber,
    base: "/painel/contas-a-receber",
    singular: "conta a receber",
    titulo: "Contas a receber",
    descricao: "Repasses de convênio, doações, eventos e contribuições",
    classeRotulo: "Origem",
    classes: ORIGENS_RECEITA as readonly string[],
    corClasse: (c: string) => COR_ORIGEM[c] ?? "#94a3b8",
    contraparteRotulo: "Quem paga",
    contrapartePlaceholder: "Prefeitura, doador, venda de ingressos…",
    quitado: "Recebida",
    quitar: "Registrar recebimento",
    quitadoEm: "Recebida em",
    desfazer: "Desfazer recebimento",
    lancar: "Lançar conta a receber",
    nova: "Nova conta a receber",
  },
} as const

function dePagar(c: ContaPagar): ContaView {
  return {
    id: c.id,
    descricao: c.descricao,
    valorCents: c.valorCents,
    vencimento: c.vencimento,
    classe: c.categoria,
    contraparte: c.fornecedor,
    usaVerba: c.usaVerba,
    verbaId: c.verbaId,
    prestadorId: c.prestadorId,
    compraId: c.compraId,
    quitadoEm: c.pagoEm,
    forma: c.forma,
    observacoes: c.observacoes,
    criadoEm: c.criadoEm,
  }
}

function deReceber(c: ContaReceber): ContaView {
  return {
    id: c.id,
    descricao: c.descricao,
    valorCents: c.valorCents,
    vencimento: c.vencimento,
    classe: c.origem,
    contraparte: c.pagador,
    usaVerba: c.usaVerba,
    verbaId: c.verbaId,
    apoiadorId: c.apoiadorId,
    quitadoEm: c.recebidoEm,
    forma: c.forma,
    observacoes: c.observacoes,
    criadoEm: c.criadoEm,
  }
}

/** Lista + ações de um tipo de conta, já no formato comum. */
export function useContas(tipo: TipoConta) {
  const pagar = useDemo((s) => s.contasPagar)
  const receber = useDemo((s) => s.contasReceber)
  const d = useDemo()
  const lista = React.useMemo(
    () => (tipo === "pagar" ? pagar.map(dePagar) : receber.map(deReceber)),
    [tipo, pagar, receber]
  )

  return {
    lista,
    salvar: (v: Omit<ContaView, "id" | "criadoEm" | "quitadoEm"> & { id?: string; quitadoEm?: string }) => {
      if (tipo === "pagar") {
        return d.salvarContaPagar({
          id: v.id,
          descricao: v.descricao,
          valorCents: v.valorCents,
          vencimento: v.vencimento,
          categoria: v.classe,
          fornecedor: v.contraparte,
          prestadorId: v.prestadorId,
          compraId: v.compraId,
          usaVerba: v.usaVerba,
          verbaId: v.usaVerba ? v.verbaId : undefined,
          pagoEm: v.quitadoEm,
          forma: v.forma,
          observacoes: v.observacoes,
        })
      }
      return d.salvarContaReceber({
        id: v.id,
        descricao: v.descricao,
        valorCents: v.valorCents,
        vencimento: v.vencimento,
        origem: v.classe,
        pagador: v.contraparte,
        usaVerba: v.usaVerba,
        verbaId: v.usaVerba ? v.verbaId : undefined,
        apoiadorId: v.apoiadorId,
        recebidoEm: v.quitadoEm,
        forma: v.forma,
        observacoes: v.observacoes,
      })
    },
    remover: (id: string) => (tipo === "pagar" ? d.removerContaPagar(id) : d.removerContaReceber(id)),
    quitar: (id: string, data: string, forma: FormaPagamento) =>
      tipo === "pagar" ? d.pagarConta(id, data, forma) : d.receberConta(id, data, forma),
    desfazer: (id: string) => (tipo === "pagar" ? d.desfazerPagamento(id) : d.desfazerRecebimento(id)),
  }
}
