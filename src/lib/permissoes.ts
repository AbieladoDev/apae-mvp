import type { Perfil } from "@/data/tipos"

/**
 * Quem pode o quê. É o que filtra menu, botões e blocos do dashboard.
 * No sistema real isto vira o registro de permissões da API (padrão Vetro/TodosDan);
 * os NOMES já seguem o formato `recurso.acao` para a migração ser só trocar a fonte.
 */
export type Permissao =
  | "financeiro.ler"
  | "financeiro.editar"
  | "prestacao.ler"
  | "compras.solicitar"
  | "compras.ver_todas"
  | "compras.aprovar"
  | "compras.comprar"
  | "estoque.ler"
  | "estoque.editar"
  | "estoque.saida"
  | "patrimonio.ler"
  | "patrimonio.editar"
  | "prestadores.ler"
  | "prestadores.editar"
  | "historico.ler"

export const PERMISSOES: Record<Perfil, Permissao[] | ["*"]> = {
  admin: ["*"],
  financeiro: [
    "financeiro.ler",
    "financeiro.editar",
    "prestacao.ler",
    "compras.solicitar",
    "compras.ver_todas",
    "estoque.ler",
    "patrimonio.ler",
    "prestadores.ler",
    "prestadores.editar",
    "historico.ler",
  ],
  compras: [
    "compras.solicitar",
    "compras.ver_todas",
    "compras.comprar",
    "estoque.ler",
    "estoque.editar",
    "estoque.saida",
    "patrimonio.ler",
    "patrimonio.editar",
    "prestadores.ler",
    "historico.ler",
  ],
  funcionario: [
    "compras.solicitar",
    "estoque.ler",
    "estoque.saida",
    "patrimonio.ler",
    "prestadores.ler",
  ],
}

export function temPermissao(perfil: Perfil | null, p: Permissao | undefined): boolean {
  if (!p) return true
  if (!perfil) return false
  const lista = PERMISSOES[perfil] as string[]
  return lista.includes("*") || lista.includes(p)
}
