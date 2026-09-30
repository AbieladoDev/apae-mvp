import { create } from "zustand"
import { persist } from "zustand/middleware"

import { gerarSeed, type DadosDemo } from "@/data/seed"
import type {
  AcaoAuditoria,
  Apoiador,
  Auditoria,
  Bem,
  Compra,
  ContaPagar,
  ContaReceber,
  Entidade,
  FormaPagamento,
  ItemCompra,
  ItemEstoque,
  Mudanca,
  Notificacao,
  Perfil,
  Prestador,
  TomNotificacao,
  Verba,
} from "@/data/tipos"
import { formatDate, formatPrice } from "@/lib/format"
import { hoje } from "@/lib/datas"
import { usuarioAtual } from "./sessao-store"

/**
 * O "BANCO" DO MVP — um store só, persistido no navegador.
 *
 * Toda ação de domínio passa por `registrar()`, que grava a linha do histórico
 * e, quando alguém precisa agir, a notificação para os perfis certos. É esse
 * encadeamento que faz a demo contar a história inteira: a compra aprovada
 * aparece no sino de Compras, a comprada vira conta a pagar e entrada no
 * estoque, e tudo fica no Histórico.
 *
 * ⚠️ Quando virar sistema de verdade, cada ação daqui vira um endpoint da API
 * e o `registrar()` vira o interceptor de auditoria + o serviço de notificação
 * (mesmo desenho da TodosDan). Os nomes foram escolhidos para essa troca.
 */

type Novo<T> = Omit<T, "id"> & { id?: string }

interface Registro {
  entidade: Entidade
  entidadeId: string
  acao: AcaoAuditoria
  rotulo: string
  mudancas?: Mudanca[]
}

interface Aviso {
  tom: TomNotificacao
  titulo: string
  corpo: string
  href: string
  para: Perfil[]
}

export interface CompraComprada {
  fornecedor: string
  valorRealCents: number
  vencimento: string
  forma: FormaPagamento
  categoria: string
}

interface Acoes {
  restaurar: () => void

  salvarApoiador: (a: Novo<Omit<Apoiador, "criadoEm">>) => string
  removerApoiador: (id: string) => void

  salvarVerba: (v: Novo<Verba>) => string
  removerVerba: (id: string) => void

  salvarContaPagar: (c: Novo<Omit<ContaPagar, "criadoEm">>) => string
  removerContaPagar: (id: string) => void
  pagarConta: (id: string, data: string, forma: FormaPagamento) => void
  desfazerPagamento: (id: string) => void

  salvarContaReceber: (c: Novo<Omit<ContaReceber, "criadoEm">>) => string
  removerContaReceber: (id: string) => void
  receberConta: (id: string, data: string, forma: FormaPagamento) => void
  desfazerRecebimento: (id: string) => void

  criarCompra: (c: { setor: string; itens: ItemCompra[]; justificativa: string; urgencia: Compra["urgencia"] }) => string
  aprovarCompra: (id: string, verbaId?: string) => void
  recusarCompra: (id: string, motivo: string) => void
  cancelarCompra: (id: string) => void
  marcarComprada: (id: string, dados: CompraComprada) => void
  vincularBemACompra: (compraId: string, itemId: string, bemId: string) => void

  salvarItemEstoque: (i: Novo<ItemEstoque>) => string
  removerItemEstoque: (id: string) => void
  entradaEstoque: (itemId: string, quantidade: number, motivo: string, compraId?: string) => void
  saidaEstoque: (itemId: string, quantidade: number, setor: string, responsavel: string, motivo: string) => void

  salvarBem: (b: Novo<Bem>) => string
  removerBem: (id: string) => void
  transferirBem: (id: string, paraSetor: string, paraResponsavel: string, motivo: string) => void

  salvarPrestador: (p: Novo<Prestador>) => string
  removerPrestador: (id: string) => void

  marcarLida: (perfil: Perfil, id: string) => void
  marcarTodasLidas: (perfil: Perfil, ids: string[]) => void
}

export type DemoState = DadosDemo & Acoes

const ROTULO_CAMPO: Record<string, string> = {
  nome: "Nome",
  descricao: "Descrição",
  valorCents: "Valor",
  vencimento: "Vencimento",
  categoria: "Categoria",
  fornecedor: "Fornecedor",
  pagador: "Pagador",
  origem: "Origem",
  verbaId: "Verba",
  apoiadorId: "Apoiador",
  observacoes: "Observações",
  inicio: "Início",
  fim: "Fim",
  tipo: "Tipo",
  setor: "Setor",
  responsavel: "Responsável",
  estado: "Estado",
  quantidade: "Quantidade",
  minimo: "Estoque mínimo",
  unidade: "Unidade",
  local: "Local",
  area: "Área",
  telefone: "Telefone",
  email: "E-mail",
  documento: "Documento",
  valorMensalCents: "Valor mensal",
  aquisicao: "Aquisição",
  plaqueta: "Plaqueta",
}

function legivel(campo: string, v: unknown, s: DadosDemo): string {
  if (v === undefined || v === null || v === "") return "vazio"
  if (campo.endsWith("Cents") && typeof v === "number") return formatPrice(v)
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return formatDate(v)
  if (campo === "verbaId") return s.verbas.find((x) => x.id === v)?.nome ?? String(v)
  if (campo === "apoiadorId") return s.apoiadores.find((x) => x.id === v)?.nome ?? String(v)
  if (typeof v === "boolean") return v ? "sim" : "não"
  return String(v)
}

function diff<T extends object>(antes: T, depois: T, s: DadosDemo): Mudanca[] {
  const out: Mudanca[] = []
  for (const campo of Object.keys(ROTULO_CAMPO)) {
    const a = (antes as Record<string, unknown>)[campo]
    const b = (depois as Record<string, unknown>)[campo]
    if (a === b || (a == null && b == null)) continue
    if (!(campo in depois) && !(campo in antes)) continue
    out.push({ campo: ROTULO_CAMPO[campo], de: legivel(campo, a, s), para: legivel(campo, b, s) })
  }
  return out
}

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => {
      /** Próximo id com prefixo — `cp1001`, `co1002`… */
      function novoId(prefixo: string): string {
        const seq = get().seq + 1
        set({ seq })
        return `${prefixo}${seq}`
      }

      /** Grava histórico (e notificação, se houver) junto com a mudança. */
      function registrar(r: Registro, aviso?: Aviso) {
        const u = usuarioAtual()
        const agora = new Date().toISOString()
        const entrada: Auditoria = {
          id: novoId("au"),
          ...r,
          usuario: u.nome,
          perfil: u.perfil,
          data: agora,
        }
        set((s) => ({ auditoria: [entrada, ...s.auditoria] }))
        if (aviso) {
          const n: Notificacao = {
            id: novoId("nt"),
            entidade: r.entidade,
            ator: u.nome,
            data: agora,
            ...aviso,
            // quem gerou não recebe o aviso do próprio gesto
            para: aviso.para.filter((p) => p !== u.perfil),
          }
          if (n.para.length > 0) set((s) => ({ notificacoes: [n, ...s.notificacoes] }))
        }
      }

      function avisarEstoqueBaixo(item: ItemEstoque) {
        if (item.quantidade > item.minimo) return
        registrarSoAviso({
          tom: item.quantidade === 0 ? "perigo" : "alerta",
          titulo: item.quantidade === 0 ? "Item zerado no estoque" : "Estoque abaixo do mínimo",
          corpo: `${item.nome} — ${item.quantidade} ${item.unidade} (mínimo ${item.minimo})`,
          href: `/painel/estoque/${item.id}`,
          para: ["compras", "admin"],
        }, "estoque")
      }

      function registrarSoAviso(aviso: Aviso, entidade: Entidade) {
        const u = usuarioAtual()
        const n: Notificacao = { id: novoId("nt"), entidade, ator: u.nome, data: new Date().toISOString(), ...aviso }
        set((s) => ({ notificacoes: [n, ...s.notificacoes] }))
      }

      function salvarEm<K extends keyof DadosDemo, T extends { id: string }>(
        chave: K,
        prefixo: string,
        entidade: Entidade,
        dados: Novo<T>,
        rotulo: (x: T) => string,
        extra?: Partial<T>
      ): string {
        const lista = get()[chave] as unknown as T[]
        if (dados.id) {
          const antes = lista.find((x) => x.id === dados.id)
          const depois = { ...antes, ...dados } as T
          set({ [chave]: lista.map((x) => (x.id === dados.id ? depois : x)) } as Partial<DadosDemo>)
          if (antes) {
            registrar({ entidade, entidadeId: depois.id, acao: "UPDATE", rotulo: rotulo(depois), mudancas: diff(antes, depois, get()) })
          }
          return depois.id
        }
        const novo = { ...extra, ...dados, id: novoId(prefixo) } as T
        set({ [chave]: [novo, ...(get()[chave] as unknown as T[])] } as Partial<DadosDemo>)
        registrar({ entidade, entidadeId: novo.id, acao: "CREATE", rotulo: rotulo(novo) })
        return novo.id
      }

      function removerDe<K extends keyof DadosDemo, T extends { id: string }>(
        chave: K,
        entidade: Entidade,
        id: string,
        rotulo: (x: T) => string
      ) {
        const lista = get()[chave] as unknown as T[]
        const alvo = lista.find((x) => x.id === id)
        if (!alvo) return
        set({ [chave]: lista.filter((x) => x.id !== id) } as Partial<DadosDemo>)
        registrar({ entidade, entidadeId: id, acao: "DELETE", rotulo: rotulo(alvo) })
      }

      const rotuloCompra = (c: Compra) =>
        `${c.codigo} · ${c.itens[0]?.descricao ?? "sem itens"}${c.itens.length > 1 ? ` e mais ${c.itens.length - 1}` : ""}`

      return {
        ...gerarSeed(),

        restaurar: () => set({ ...gerarSeed() }),

        // ---------- Apoiadores ----------
        salvarApoiador: (a) =>
          salvarEm<"apoiadores", Apoiador>("apoiadores", "ap", "apoiador", a as Novo<Apoiador>, (x) => x.nome, { criadoEm: hoje() }),
        removerApoiador: (id) => removerDe<"apoiadores", Apoiador>("apoiadores", "apoiador", id, (x) => x.nome),

        // ---------- Verbas ----------
        salvarVerba: (v) => salvarEm<"verbas", Verba>("verbas", "vb", "verba", v, (x) => x.nome),
        removerVerba: (id) => removerDe<"verbas", Verba>("verbas", "verba", id, (x) => x.nome),

        // ---------- Contas a pagar ----------
        salvarContaPagar: (c) =>
          salvarEm<"contasPagar", ContaPagar>("contasPagar", "cp", "conta_pagar", c as Novo<ContaPagar>, (x) => `${x.descricao} — ${formatPrice(x.valorCents)}`, { criadoEm: hoje() }),
        removerContaPagar: (id) => removerDe<"contasPagar", ContaPagar>("contasPagar", "conta_pagar", id, (x) => x.descricao),
        pagarConta: (id, data, forma) => {
          const c = get().contasPagar.find((x) => x.id === id)
          if (!c) return
          set((s) => ({ contasPagar: s.contasPagar.map((x) => (x.id === id ? { ...x, pagoEm: data, forma } : x)) }))
          registrar({ entidade: "conta_pagar", entidadeId: id, acao: "PAGAR", rotulo: `${c.descricao} — ${formatPrice(c.valorCents)}` })
        },
        desfazerPagamento: (id) => {
          const c = get().contasPagar.find((x) => x.id === id)
          if (!c) return
          set((s) => ({ contasPagar: s.contasPagar.map((x) => (x.id === id ? { ...x, pagoEm: undefined } : x)) }))
          registrar({ entidade: "conta_pagar", entidadeId: id, acao: "UPDATE", rotulo: c.descricao, mudancas: [{ campo: "Situação", de: "paga", para: "em aberto" }] })
        },

        // ---------- Contas a receber ----------
        salvarContaReceber: (c) =>
          salvarEm<"contasReceber", ContaReceber>("contasReceber", "cr", "conta_receber", c as Novo<ContaReceber>, (x) => `${x.descricao} — ${formatPrice(x.valorCents)}`, { criadoEm: hoje() }),
        removerContaReceber: (id) => removerDe<"contasReceber", ContaReceber>("contasReceber", "conta_receber", id, (x) => x.descricao),
        receberConta: (id, data, forma) => {
          const c = get().contasReceber.find((x) => x.id === id)
          if (!c) return
          set((s) => ({ contasReceber: s.contasReceber.map((x) => (x.id === id ? { ...x, recebidoEm: data, forma } : x)) }))
          registrar({ entidade: "conta_receber", entidadeId: id, acao: "RECEBER", rotulo: `${c.descricao} — ${formatPrice(c.valorCents)}` })
        },
        desfazerRecebimento: (id) => {
          const c = get().contasReceber.find((x) => x.id === id)
          if (!c) return
          set((s) => ({ contasReceber: s.contasReceber.map((x) => (x.id === id ? { ...x, recebidoEm: undefined } : x)) }))
          registrar({ entidade: "conta_receber", entidadeId: id, acao: "UPDATE", rotulo: c.descricao, mudancas: [{ campo: "Situação", de: "recebida", para: "em aberto" }] })
        },

        // ---------- Compras ----------
        criarCompra: (dados) => {
          const u = usuarioAtual()
          const id = novoId("co")
          const numero = get().compras.length + 11
          const compra: Compra = {
            id,
            codigo: `C-${String(numero).padStart(4, "0")}`,
            solicitante: u.perfil,
            solicitanteNome: u.nome,
            status: "solicitada",
            criadoEm: new Date().toISOString(),
            ...dados,
          }
          set((s) => ({ compras: [compra, ...s.compras] }))
          registrar(
            { entidade: "compra", entidadeId: id, acao: "CREATE", rotulo: rotuloCompra(compra) },
            {
              tom: "info",
              titulo: "Nova solicitação de compra",
              corpo: `${rotuloCompra(compra)} — ${compra.setor}${compra.urgencia === "alta" ? " (urgente)" : ""}`,
              href: `/painel/compras/${id}`,
              para: ["admin"],
            }
          )
          return id
        },
        aprovarCompra: (id, verbaId) => {
          const u = usuarioAtual()
          const c = get().compras.find((x) => x.id === id)
          if (!c) return
          const nova: Compra = { ...c, status: "aprovada", verbaId, aprovadoPor: u.nome, aprovadoEm: new Date().toISOString() }
          set((s) => ({ compras: s.compras.map((x) => (x.id === id ? nova : x)) }))
          registrar(
            { entidade: "compra", entidadeId: id, acao: "APROVAR", rotulo: rotuloCompra(c) },
            { tom: "sucesso", titulo: "Compra aprovada — pode comprar", corpo: `${rotuloCompra(c)} (${c.setor})`, href: `/painel/compras/${id}`, para: ["compras", c.solicitante] }
          )
        },
        recusarCompra: (id, motivo) => {
          const u = usuarioAtual()
          const c = get().compras.find((x) => x.id === id)
          if (!c) return
          set((s) => ({
            compras: s.compras.map((x) =>
              x.id === id ? { ...x, status: "recusada", motivoRecusa: motivo, aprovadoPor: u.nome, aprovadoEm: new Date().toISOString() } : x
            ),
          }))
          registrar(
            { entidade: "compra", entidadeId: id, acao: "RECUSAR", rotulo: rotuloCompra(c), mudancas: [{ campo: "Motivo", de: "—", para: motivo }] },
            { tom: "perigo", titulo: "Sua solicitação foi recusada", corpo: `${rotuloCompra(c)} — ${motivo}`, href: `/painel/compras/${id}`, para: [c.solicitante] }
          )
        },
        cancelarCompra: (id) => {
          const c = get().compras.find((x) => x.id === id)
          if (!c) return
          set((s) => ({ compras: s.compras.map((x) => (x.id === id ? { ...x, status: "cancelada" } : x)) }))
          registrar({ entidade: "compra", entidadeId: id, acao: "CANCELAR", rotulo: rotuloCompra(c) })
        },
        marcarComprada: (id, dados) => {
          const u = usuarioAtual()
          const c = get().compras.find((x) => x.id === id)
          if (!c) return
          // 1. a conta a pagar nasce da compra
          const contaId = novoId("cp")
          const conta: ContaPagar = {
            id: contaId,
            descricao: `Compra ${c.codigo} — ${c.itens.map((i) => i.descricao).join(", ")}`,
            valorCents: dados.valorRealCents,
            vencimento: dados.vencimento,
            categoria: dados.categoria,
            fornecedor: dados.fornecedor,
            usaVerba: Boolean(c.verbaId),
            verbaId: c.verbaId,
            forma: dados.forma,
            compraId: id,
            observacoes: `Solicitada por ${c.solicitanteNome} (${c.setor}). ${c.justificativa}`,
            criadoEm: hoje(),
          }
          set((s) => ({
            contasPagar: [conta, ...s.contasPagar],
            compras: s.compras.map((x) =>
              x.id === id
                ? { ...x, status: "comprada", compradoPor: u.nome, compradoEm: new Date().toISOString(), contaPagarId: contaId, ...dados }
                : x
            ),
          }))
          registrar(
            { entidade: "compra", entidadeId: id, acao: "COMPRAR", rotulo: `${c.codigo} · ${dados.fornecedor} — ${formatPrice(dados.valorRealCents)}` },
            {
              tom: "sucesso",
              titulo: "Compra virou conta a pagar",
              corpo: `${c.codigo} · ${dados.fornecedor} — ${formatPrice(dados.valorRealCents)}, vence ${formatDate(dados.vencimento)}`,
              href: `/painel/contas-a-pagar/${contaId}`,
              para: ["financeiro", "admin"],
            }
          )
          registrarSoAviso(
            { tom: "sucesso", titulo: "Sua compra foi realizada", corpo: `${rotuloCompra(c)} — ${dados.fornecedor}`, href: `/painel/compras/${id}`, para: [c.solicitante].filter((p) => p !== u.perfil) },
            "compra"
          )
          // 2. itens de estoque dão entrada
          for (const item of c.itens) {
            if (item.destino === "estoque" && item.itemEstoqueId) {
              get().entradaEstoque(item.itemEstoqueId, item.quantidade, `Compra ${c.codigo}`, id)
            }
          }
        },
        vincularBemACompra: (compraId, itemId, bemId) => {
          set((s) => ({
            compras: s.compras.map((c) =>
              c.id === compraId ? { ...c, itens: c.itens.map((i) => (i.id === itemId ? { ...i, bemId } : i)) } : c
            ),
          }))
        },

        // ---------- Estoque ----------
        salvarItemEstoque: (i) => salvarEm<"itensEstoque", ItemEstoque>("itensEstoque", "es", "estoque", i, (x) => x.nome),
        removerItemEstoque: (id) => removerDe<"itensEstoque", ItemEstoque>("itensEstoque", "estoque", id, (x) => x.nome),
        entradaEstoque: (itemId, quantidade, motivo, compraId) => {
          const u = usuarioAtual()
          const item = get().itensEstoque.find((x) => x.id === itemId)
          if (!item) return
          set((s) => ({
            itensEstoque: s.itensEstoque.map((x) => (x.id === itemId ? { ...x, quantidade: x.quantidade + quantidade } : x)),
            movsEstoque: [
              { id: novoId("me"), itemId, tipo: "entrada", quantidade, responsavel: u.nome, motivo, compraId, data: hoje() },
              ...s.movsEstoque,
            ],
          }))
          registrar({ entidade: "estoque", entidadeId: itemId, acao: "ENTRADA", rotulo: `${item.nome} — +${quantidade} ${item.unidade}` })
        },
        saidaEstoque: (itemId, quantidade, setor, responsavel, motivo) => {
          const item = get().itensEstoque.find((x) => x.id === itemId)
          if (!item) return
          const atualizado = { ...item, quantidade: Math.max(0, item.quantidade - quantidade) }
          set((s) => ({
            itensEstoque: s.itensEstoque.map((x) => (x.id === itemId ? atualizado : x)),
            movsEstoque: [
              { id: novoId("me"), itemId, tipo: "saida", quantidade, setor, responsavel, motivo, data: hoje() },
              ...s.movsEstoque,
            ],
          }))
          registrar({ entidade: "estoque", entidadeId: itemId, acao: "SAIDA", rotulo: `${item.nome} — ${quantidade} ${item.unidade} para ${setor}` })
          avisarEstoqueBaixo(atualizado)
        },

        // ---------- Patrimônio ----------
        salvarBem: (b) => salvarEm<"bens", Bem>("bens", "bm", "bem", b, (x) => `${x.plaqueta} · ${x.nome}`),
        removerBem: (id) => removerDe<"bens", Bem>("bens", "bem", id, (x) => `${x.plaqueta} · ${x.nome}`),
        transferirBem: (id, paraSetor, paraResponsavel, motivo) => {
          const u = usuarioAtual()
          const b = get().bens.find((x) => x.id === id)
          if (!b) return
          const mov = {
            id: novoId("mv"),
            data: hoje(),
            deSetor: b.setor,
            paraSetor,
            deResponsavel: b.responsavel,
            paraResponsavel,
            motivo,
            por: u.nome,
          }
          set((s) => ({
            bens: s.bens.map((x) =>
              x.id === id ? { ...x, setor: paraSetor, responsavel: paraResponsavel, movimentacoes: [mov, ...x.movimentacoes] } : x
            ),
          }))
          registrar({
            entidade: "bem",
            entidadeId: id,
            acao: "TRANSFERIR",
            rotulo: `${b.plaqueta} · ${b.nome}`,
            mudancas: [
              { campo: "Setor", de: b.setor, para: paraSetor },
              ...(b.responsavel !== paraResponsavel ? [{ campo: "Responsável", de: b.responsavel, para: paraResponsavel }] : []),
            ],
          })
        },

        // ---------- Prestadores ----------
        salvarPrestador: (p) => salvarEm<"prestadores", Prestador>("prestadores", "pr", "prestador", p, (x) => `${x.nome} — ${x.area}`),
        removerPrestador: (id) => removerDe<"prestadores", Prestador>("prestadores", "prestador", id, (x) => x.nome),

        // ---------- Notificações ----------
        marcarLida: (perfil, id) =>
          set((s) => ({ lidas: { ...s.lidas, [perfil]: Array.from(new Set([...(s.lidas[perfil] ?? []), id])) } })),
        marcarTodasLidas: (perfil, ids) =>
          set((s) => ({ lidas: { ...s.lidas, [perfil]: Array.from(new Set([...(s.lidas[perfil] ?? []), ...ids])) } })),
      }
    },
    {
      name: "apae-demo",
      version: 1,
      // só os dados vão para o localStorage; as ações são recriadas
      partialize: (s) => {
        const { apoiadores, verbas, contasPagar, contasReceber, compras, itensEstoque, movsEstoque, bens, prestadores, auditoria, notificacoes, lidas, seq } = s
        return { apoiadores, verbas, contasPagar, contasReceber, compras, itensEstoque, movsEstoque, bens, prestadores, auditoria, notificacoes, lidas, seq }
      },
    }
  )
)
