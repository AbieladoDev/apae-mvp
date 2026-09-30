"use client"

import * as React from "react"

import { MODULOS, type Modulo } from "@/lib/modulos"
import { temPermissao, type Permissao } from "@/lib/permissoes"
import { useSessao } from "@/store/sessao-store"

export interface NavLink {
  title: string
  url: string
  icon: React.ElementType
  /** cor do ícone sobre a barra azul */
  cor?: string
  permission?: Permissao
  exact?: boolean
  description?: string
  items?: NavLink[]
  activeOn?: string[]
}

export interface NavSection {
  label?: string
  items: NavLink[]
}

function link(m: Modulo, extra: Partial<NavLink> = {}): NavLink {
  return { title: m.titulo, url: m.url, icon: m.icone, cor: m.naBarra, ...extra }
}

/** A navegação inteira, numa fonte só (menu, celular, trilha e busca leem daqui). */
export const navSections: NavSection[] = [
  {
    label: "Visão geral",
    items: [
      link(MODULOS.dashboard, { exact: true, description: "Como a APAE está hoje" }),
      link(MODULOS.prestacao, { permission: "prestacao.ler", description: "Relatórios e gráficos por verba e apoiador" }),
    ],
  },
  {
    label: "Financeiro",
    items: [
      link(MODULOS.pagar, { permission: "financeiro.ler", description: "O que a APAE paga" }),
      link(MODULOS.receber, { permission: "financeiro.ler", description: "Repasses, doações e eventos" }),
      link(MODULOS.verbas, { permission: "financeiro.ler", description: "Recursos com destino e prestação de contas" }),
      link(MODULOS.apoiadores, { permission: "financeiro.ler", description: "Quem apoia a APAE" }),
    ],
  },
  {
    label: "Operação",
    items: [
      link(MODULOS.compras, { permission: "compras.solicitar", description: "Pedir, aprovar e comprar" }),
      link(MODULOS.estoque, { permission: "estoque.ler", description: "Entradas e saídas por setor" }),
      link(MODULOS.patrimonio, { permission: "patrimonio.ler", description: "Os bens da APAE, com plaqueta" }),
      link(MODULOS.prestadores, { permission: "prestadores.ler", description: "Profissionais que atendem aqui" }),
    ],
  },
]

export function useFilteredNavigation(): NavSection[] {
  const perfil = useSessao((s) => s.perfil)
  return React.useMemo(
    () =>
      navSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => temPermissao(perfil, item.permission)),
        }))
        .filter((section) => section.items.length > 0),
    [perfil]
  )
}

export function isNavItemActive(url: string, pathname: string, exact = false): boolean {
  if (url === "/painel" || exact) return pathname === url
  return pathname === url || pathname.startsWith(url + "/")
}

export function isModuloAberto(item: NavLink, pathname: string): boolean {
  if (isNavItemActive(item.url, pathname, item.exact)) return true
  if (item.activeOn?.some((url) => isNavItemActive(url, pathname))) return true
  return item.items?.some((sub) => isNavItemActive(sub.url, pathname, sub.exact)) ?? false
}

/** O módulo de uma rota interna — o degrau do meio da trilha. */
export function moduloDaRota(pathname: string): { title: string; url: string } | null {
  const extras = [MODULOS.historico, MODULOS.notificacoes].map((m) => link(m))
  for (const item of [...navSections.flatMap((s) => s.items), ...extras]) {
    if (pathname === item.url) return null
    if (isModuloAberto(item, pathname)) return { title: item.title, url: item.url }
  }
  return null
}
