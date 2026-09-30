"use client"

import { MODULOS } from "@/lib/modulos"
import { temPermissao, type Permissao } from "@/lib/permissoes"
import { useSessao } from "@/store/sessao-store"

export interface QuickCreateAction {
  label: string
  description: string
  icon: React.ElementType
  href: string
  permission?: Permissao
  color: string
}

export const QUICK_CREATE: QuickCreateAction[] = [
  { label: "Solicitar compra", description: "Pedir algo para o seu setor", icon: MODULOS.compras.icone, href: "/painel/compras/nova", permission: "compras.solicitar", color: MODULOS.compras.selo },
  { label: "Nova conta a pagar", description: "Boleto, serviço, fornecedor", icon: MODULOS.pagar.icone, href: "/painel/contas-a-pagar/cadastro", permission: "financeiro.editar", color: MODULOS.pagar.selo },
  { label: "Nova conta a receber", description: "Repasse, doação, evento", icon: MODULOS.receber.icone, href: "/painel/contas-a-receber/cadastro", permission: "financeiro.editar", color: MODULOS.receber.selo },
  { label: "Nova verba", description: "Convênio, emenda, campanha", icon: MODULOS.verbas.icone, href: "/painel/verbas/cadastro", permission: "financeiro.editar", color: MODULOS.verbas.selo },
  { label: "Novo apoiador", description: "Quem repassa ou doa", icon: MODULOS.apoiadores.icone, href: "/painel/apoiadores?novo=1", permission: "financeiro.editar", color: MODULOS.apoiadores.selo },
  { label: "Movimentar estoque", description: "Entrada ou saída de item", icon: MODULOS.estoque.icone, href: "/painel/estoque?mov=1", permission: "estoque.saida", color: MODULOS.estoque.selo },
  { label: "Novo bem", description: "Cadastrar no patrimônio", icon: MODULOS.patrimonio.icone, href: "/painel/patrimonio/cadastro", permission: "patrimonio.editar", color: MODULOS.patrimonio.selo },
  { label: "Novo prestador", description: "Profissional ou empresa", icon: MODULOS.prestadores.icone, href: "/painel/prestadores/cadastro", permission: "prestadores.editar", color: MODULOS.prestadores.selo },
]

export function useQuickCreateActions(): QuickCreateAction[] {
  const perfil = useSessao((s) => s.perfil)
  return QUICK_CREATE.filter((a) => temPermissao(perfil, a.permission))
}
