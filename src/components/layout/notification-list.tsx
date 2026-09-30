"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Check, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Notificacao, TomNotificacao } from "@/data/tipos"
import { formatDate, formatDateTime, formatPrice } from "@/lib/format"
import { resumoVerba, situacaoConta } from "@/lib/derivados"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { useSessao } from "@/store/sessao-store"

const TOM: Record<TomNotificacao, { icone: LucideIcon; selo: string; barra: string }> = {
  info: { icone: Info, selo: "bg-sky-400/20 text-sky-200", barra: "border-l-sky-400" },
  sucesso: { icone: CheckCircle2, selo: "bg-emerald-400/20 text-emerald-200", barra: "border-l-emerald-400" },
  alerta: { icone: AlertTriangle, selo: "bg-amber-400/20 text-amber-200", barra: "border-l-amber-400" },
  perigo: { icone: XCircle, selo: "bg-rose-400/20 text-rose-200", barra: "border-l-rose-400" },
}

/** Na página (fundo claro) os selos usam as cores cheias. */
const TOM_PAGINA: Record<TomNotificacao, string> = {
  info: "bg-sky-100 text-sky-700",
  sucesso: "bg-emerald-100 text-emerald-700",
  alerta: "bg-amber-100 text-amber-700",
  perigo: "bg-rose-100 text-rose-700",
}

/**
 * As notificações do perfil logado: as GRAVADAS (compra criada, aprovada,
 * comprada, estoque baixo…) mais os ALERTAS calculados na hora — conta vencida
 * ou vencendo hoje, recebimento atrasado e verba acima de 80%. Alerta
 * calculado não é gravado: some sozinho quando a conta é paga.
 */
export function useNotificacoes() {
  const perfil = useSessao((s) => s.perfil)
  const notificacoes = useDemo((s) => s.notificacoes)
  const contasPagar = useDemo((s) => s.contasPagar)
  const contasReceber = useDemo((s) => s.contasReceber)
  const verbas = useDemo((s) => s.verbas)
  const lidas = useDemo((s) => s.lidas)
  const marcarLida = useDemo((s) => s.marcarLida)
  const marcarTodasLidas = useDemo((s) => s.marcarTodasLidas)

  const lista = React.useMemo(() => {
    if (!perfil) return []
    const gravadas = notificacoes.filter((n) => n.para.includes(perfil))
    const alertas: Notificacao[] = []
    const agora = new Date().toISOString()
    if (perfil === "admin" || perfil === "financeiro") {
      for (const c of contasPagar) {
        const s = situacaoConta(c)
        if (s === "vencida" || s === "hoje") {
          alertas.push({
            id: `al-cp-${c.id}-${s}`,
            tom: s === "vencida" ? "perigo" : "alerta",
            entidade: "conta_pagar",
            titulo: s === "vencida" ? "Conta a pagar vencida" : "Conta vence hoje",
            corpo: `${c.descricao} — ${formatPrice(c.valorCents)} (${formatDate(c.vencimento)})`,
            href: `/painel/contas-a-pagar/${c.id}`,
            para: [perfil],
            data: agora,
          })
        }
      }
      for (const c of contasReceber) {
        if (situacaoConta(c) === "vencida") {
          alertas.push({
            id: `al-cr-${c.id}`,
            tom: "alerta",
            entidade: "conta_receber",
            titulo: "Recebimento atrasado",
            corpo: `${c.descricao} — ${formatPrice(c.valorCents)}`,
            href: `/painel/contas-a-receber/${c.id}`,
            para: [perfil],
            data: agora,
          })
        }
      }
      for (const v of verbas) {
        const r = resumoVerba(v, contasPagar, contasReceber)
        if (r.usoPct >= 80) {
          alertas.push({
            id: `al-vb-${v.id}-${r.usoPct >= 100 ? "100" : "80"}`,
            tom: r.usoPct >= 100 ? "perigo" : "alerta",
            entidade: "verba",
            titulo: r.usoPct >= 100 ? "Verba esgotada" : "Verba acima de 80%",
            corpo: `${v.nome} — ${r.usoPct}% usado, saldo ${formatPrice(r.saldoCents)}`,
            href: `/painel/verbas/${v.id}`,
            para: [perfil],
            data: agora,
          })
        }
      }
    }
    return [...alertas, ...gravadas]
  }, [perfil, notificacoes, contasPagar, contasReceber, verbas])

  const lidasDoPerfil = React.useMemo(() => new Set(perfil ? lidas[perfil] ?? [] : []), [perfil, lidas])
  const naoLidas = lista.filter((n) => !lidasDoPerfil.has(n.id)).length

  return {
    lista,
    naoLidas,
    lida: (id: string) => lidasDoPerfil.has(id),
    marcarLida: (id: string) => {
      if (perfil) marcarLida(perfil, id)
    },
    marcarTodas: () => {
      if (perfil) marcarTodasLidas(perfil, lista.map((n) => n.id))
    },
  }
}

function diaDe(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function rotuloDoDia(chave: string): string {
  const hoje = diaDe(new Date().toISOString())
  const ontem = diaDe(new Date(Date.now() - 86400000).toISOString())
  if (chave === hoje) return "Hoje"
  if (chave === ontem) return "Ontem"
  const [ano, mes, dia] = chave.split("-")
  return `${dia}/${mes}/${ano}`
}

/**
 * A lista, em duas peles: `barra` (popover azul do sino) e `pagina` (a tela de
 * Notificações, fundo claro).
 */
export function ListaNotificacoes({
  variante,
  estado,
  onNavegou,
  limite,
}: {
  variante: "barra" | "pagina"
  estado: ReturnType<typeof useNotificacoes>
  onNavegou?: () => void
  limite?: number
}) {
  const router = useRouter()
  const naBarra = variante === "barra"
  const fraco = naBarra ? "text-sidebar-foreground/60" : "text-muted-foreground"
  const lista = limite ? estado.lista.slice(0, limite) : estado.lista

  function abrir(n: Notificacao) {
    estado.marcarLida(n.id)
    onNavegou?.()
    router.push(n.href)
  }

  return (
    <>
      <div className={cn("flex items-center justify-between border-b px-3 py-2", naBarra && "border-sidebar-border")}>
        <span className="text-sm font-bold">Notificações</span>
        {estado.naoLidas > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-auto p-1 text-xs", naBarra && "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground")}
            onClick={estado.marcarTodas}
          >
            <Check className="mr-1 h-3 w-3" />
            Marcar todas como lidas
          </Button>
        )}
      </div>
      <div className={cn(naBarra && "max-h-96 overflow-y-auto")}>
        {lista.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className={cn("text-sm", fraco)}>Nada por aqui.</p>
            <p className={cn("mt-1 text-xs", fraco)}>Quando alguém precisar de você, aparece aqui.</p>
          </div>
        ) : (
          <ul className={cn("divide-y", naBarra && "divide-sidebar-border")}>
            {lista.map((n, i) => {
              const tom = TOM[n.tom]
              const Icone = tom.icone
              const lida = estado.lida(n.id)
              const dia = diaDe(n.data)
              const abreDia = i === 0 || diaDe(lista[i - 1].data) !== dia
              return (
                <React.Fragment key={n.id}>
                  {abreDia && <li className={cn("px-3 pb-1 pt-2.5 text-xs font-bold", fraco)}>{rotuloDoDia(dia)}</li>}
                  <li>
                    <button
                      type="button"
                      onClick={() => abrir(n)}
                      className={cn(
                        "w-full border-l-[3px] px-3 py-2.5 pl-2.5 text-left transition-colors",
                        tom.barra,
                        naBarra ? "hover:bg-sidebar-accent" : "hover:bg-muted/60",
                        !lida && (naBarra ? "bg-sidebar-accent/50" : "bg-accent/50")
                      )}
                    >
                      <span className="flex items-start gap-2.5">
                        <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", naBarra ? tom.selo : TOM_PAGINA[n.tom])}>
                          <Icone className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-sm", !lida && "font-bold")}>{n.titulo}</span>
                          <span className={cn("block text-xs", fraco)}>{n.corpo}</span>
                          <span className={cn("block text-xs tabular-nums", fraco)}>
                            {n.id.startsWith("al-") ? "Alerta automático" : `${n.ator ? `${n.ator} · ` : ""}${formatDateTime(n.data)}`}
                          </span>
                        </span>
                        {!lida && <span className="mt-2 size-2 shrink-0 rounded-full bg-girassol" aria-label="Não lida" />}
                      </span>
                    </button>
                  </li>
                </React.Fragment>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}
