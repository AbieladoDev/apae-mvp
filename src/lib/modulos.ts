import {
  ArrowDownCircle,
  ArrowUpCircle,
  Bell,
  Boxes,
  HandCoins,
  HandHeart,
  History,
  LayoutDashboard,
  Landmark,
  PieChart,
  ShoppingCart,
  Stethoscope,
  type LucideIcon,
} from "lucide-react"

/**
 * A IDENTIDADE DE CADA MÓDULO — ícone e cor.
 *
 * A APAE pediu um visual claro e colorido: cada módulo tem a sua cor, e ela se
 * repete no ícone do menu, no selo do cabeçalho da tela e no card do
 * dashboard. Assim a pessoa reconhece "onde está" pela cor antes de ler.
 *
 * ⚠️ Classes LITERAIS: o Tailwind só gera o que encontra escrito no código.
 * Montar a classe em tempo de execução não funciona.
 */
export interface Modulo {
  titulo: string
  url: string
  icone: LucideIcon
  /** fundo suave + texto: selo do ícone */
  selo: string
  /** cor sólida: barra, ponto, destaque */
  solido: string
  /** cor do ícone sobre a barra lateral azul */
  naBarra: string
  /** hex para gráficos */
  hex: string
}

export const MODULOS = {
  dashboard: { titulo: "Dashboard", url: "/painel", icone: LayoutDashboard, selo: "bg-blue-100 text-blue-700", solido: "bg-blue-500", naBarra: "text-sky-300", hex: "#3b82f6" },
  prestacao: { titulo: "Prestação de contas", url: "/painel/prestacao-de-contas", icone: PieChart, selo: "bg-indigo-100 text-indigo-700", solido: "bg-indigo-500", naBarra: "text-indigo-200", hex: "#6366f1" },
  pagar: { titulo: "Contas a pagar", url: "/painel/contas-a-pagar", icone: ArrowDownCircle, selo: "bg-rose-100 text-rose-700", solido: "bg-rose-500", naBarra: "text-rose-300", hex: "#f43f5e" },
  receber: { titulo: "Contas a receber", url: "/painel/contas-a-receber", icone: ArrowUpCircle, selo: "bg-emerald-100 text-emerald-700", solido: "bg-emerald-500", naBarra: "text-emerald-300", hex: "#10b981" },
  verbas: { titulo: "Verbas", url: "/painel/verbas", icone: HandCoins, selo: "bg-amber-100 text-amber-700", solido: "bg-amber-400", naBarra: "text-amber-300", hex: "#f5b700" },
  apoiadores: { titulo: "Apoiadores", url: "/painel/apoiadores", icone: HandHeart, selo: "bg-lime-100 text-lime-700", solido: "bg-lime-500", naBarra: "text-lime-300", hex: "#65a30d" },
  compras: { titulo: "Compras", url: "/painel/compras", icone: ShoppingCart, selo: "bg-orange-100 text-orange-700", solido: "bg-orange-500", naBarra: "text-orange-300", hex: "#f97316" },
  estoque: { titulo: "Estoque", url: "/painel/estoque", icone: Boxes, selo: "bg-teal-100 text-teal-700", solido: "bg-teal-500", naBarra: "text-teal-300", hex: "#14b8a6" },
  patrimonio: { titulo: "Patrimônio", url: "/painel/patrimonio", icone: Landmark, selo: "bg-violet-100 text-violet-700", solido: "bg-violet-500", naBarra: "text-violet-300", hex: "#8b5cf6" },
  prestadores: { titulo: "Prestadores", url: "/painel/prestadores", icone: Stethoscope, selo: "bg-pink-100 text-pink-700", solido: "bg-pink-500", naBarra: "text-pink-300", hex: "#ec4899" },
  historico: { titulo: "Histórico", url: "/painel/historico", icone: History, selo: "bg-slate-100 text-slate-700", solido: "bg-slate-500", naBarra: "text-slate-300", hex: "#64748b" },
  notificacoes: { titulo: "Notificações", url: "/painel/notificacoes", icone: Bell, selo: "bg-sky-100 text-sky-700", solido: "bg-sky-500", naBarra: "text-sky-300", hex: "#0ea5e9" },
} satisfies Record<string, Modulo>

export type ChaveModulo = keyof typeof MODULOS

/** O módulo dono de uma rota — para o selo colorido do cabeçalho. */
export function moduloDaUrl(pathname: string): Modulo | null {
  let melhor: Modulo | null = null
  for (const m of Object.values(MODULOS) as Modulo[]) {
    if (m.url === "/painel") continue
    if (pathname === m.url || pathname.startsWith(m.url + "/")) {
      if (!melhor || m.url.length > melhor.url.length) melhor = m
    }
  }
  return melhor ?? (pathname === "/painel" ? MODULOS.dashboard : null)
}
