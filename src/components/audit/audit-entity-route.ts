import type { AcaoAuditoria, Entidade } from "@/data/tipos"

/** Para onde leva uma linha do histórico. Remoção não leva a lugar nenhum. */
const ROTA: Record<Entidade, (id: string) => string> = {
  conta_pagar: (id) => `/painel/contas-a-pagar/${id}`,
  conta_receber: (id) => `/painel/contas-a-receber/${id}`,
  verba: (id) => `/painel/verbas/${id}`,
  apoiador: () => `/painel/apoiadores`,
  compra: (id) => `/painel/compras/${id}`,
  estoque: (id) => `/painel/estoque/${id}`,
  bem: (id) => `/painel/patrimonio/${id}`,
  prestador: (id) => `/painel/prestadores/${id}`,
}

export function auditEntityHref(entidade: Entidade, id: string, acao: AcaoAuditoria): string | null {
  if (acao === "DELETE") return null
  return ROTA[entidade]?.(id) ?? null
}

export const ENTIDADE_LABEL: Record<Entidade, string> = {
  conta_pagar: "Conta a pagar",
  conta_receber: "Conta a receber",
  verba: "Verba",
  apoiador: "Apoiador",
  compra: "Compra",
  estoque: "Estoque",
  bem: "Patrimônio",
  prestador: "Prestador",
}
