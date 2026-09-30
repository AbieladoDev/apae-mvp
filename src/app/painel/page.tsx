"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, ChevronRight, ShoppingBag, ThumbsUp } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useQuickCreateActions } from "@/components/layout/quick-create"
import { BarraUso, FaixaIndicadores, SituacaoContaBadge } from "@/components/apae/comum"
import { StatusCompraBadge, resumoItens, totalEstimado } from "@/components/compras/compras-comum"
import { GraficoEntrouSaiu } from "@/components/prestacao/graficos"
import { COR_AREA } from "@/components/prestadores/prestadores-comum"
import { DIAS_SEMANA_LONGO, PERFIL_LABEL } from "@/data/catalogo"
import { resumoVerba, situacaoConta, situacaoEstoque, somaCents } from "@/lib/derivados"
import { hoje, mesDe, rotuloMes, somarDias, ultimosMeses } from "@/lib/datas"
import { formatDate, formatPrice, getInitials } from "@/lib/format"
import { MODULOS } from "@/lib/modulos"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { usePode, useSessao, useUsuario } from "@/store/sessao-store"

/**
 * O DASHBOARD — "como a APAE está hoje", recortado pelo perfil.
 * Cada bloco some para quem não tem a permissão dele: a direção vê tudo, o
 * funcionário vê as próprias solicitações e quem está na casa.
 * Começa simples de propósito: é a tela que o cliente mais vai pedir para mudar.
 */
export default function Dashboard() {
  const usuario = useUsuario()
  const perfil = useSessao((s) => s.perfil)
  const d = useDemo()
  const acoes = useQuickCreateActions()
  const verFinanceiro = usePode("financeiro.ler")
  const aprovar = usePode("compras.aprovar")
  const comprar = usePode("compras.comprar")
  const verEstoque = usePode("estoque.ler")
  const h = hoje()

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite"
  const dataLonga = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })

  // ---------- pendências ----------
  const paraAprovar = d.compras.filter((c) => c.status === "solicitada")
  const paraComprar = d.compras.filter((c) => c.status === "aprovada")
  // em andamento, ou decididas na última semana (para a pessoa ver o desfecho)
  const semanaPassada = somarDias(h, -7)
  const minhas = d.compras.filter(
    (c) => c.solicitante === perfil && (c.status === "solicitada" || c.status === "aprovada" || (c.compradoEm ?? c.aprovadoEm ?? "").slice(0, 10) >= semanaPassada)
  )
  const vencidas = d.contasPagar.filter((c) => situacaoConta(c) === "vencida")
  const estoqueBaixo = d.itensEstoque.filter((i) => situacaoEstoque(i) !== "ok")

  // ---------- financeiro do mês ----------
  const mes = mesDe(h)
  const entrouMes = somaCents(d.contasReceber.filter((c) => c.recebidoEm && mesDe(c.recebidoEm) === mes), (c) => c.valorCents)
  const saiuMes = somaCents(d.contasPagar.filter((c) => c.pagoEm && mesDe(c.pagoEm) === mes), (c) => c.valorCents)
  const proximas = d.contasPagar.filter((c) => !c.pagoEm && c.vencimento <= somarDias(h, 7)).sort((a, b) => a.vencimento.localeCompare(b.vencimento))
  const aReceber7 = d.contasReceber.filter((c) => !c.recebidoEm && c.vencimento >= h && c.vencimento <= somarDias(h, 7))
  const serie = ultimosMeses(6).map((m) => ({
    mes: rotuloMes(m),
    entrou: somaCents(d.contasReceber.filter((c) => c.recebidoEm && mesDe(c.recebidoEm) === m), (c) => c.valorCents),
    saiu: somaCents(d.contasPagar.filter((c) => c.pagoEm && mesDe(c.pagoEm) === m), (c) => c.valorCents),
  }))
  const verbas = d.verbas
    .filter((v) => v.inicio <= h && v.fim >= h)
    .map((v) => resumoVerba(v, d.contasPagar, d.contasReceber))
    .sort((a, b) => b.usoPct - a.usoPct)

  const hojeDia = new Date().getDay()
  const naCasa = d.prestadores.flatMap((p) => p.dias.filter((x) => x.dia === hojeDia).map((x) => ({ p, x }))).sort((a, b) => a.x.inicio.localeCompare(b.x.inicio))

  const pendencias = [
    aprovar && paraAprovar.length > 0 && { href: "/painel/compras", icone: ThumbsUp, cor: "bg-orange-100 text-orange-700", titulo: `${paraAprovar.length} ${paraAprovar.length === 1 ? "compra espera" : "compras esperam"} a sua aprovação`, detalhe: paraAprovar.map((c) => c.codigo).join(", ") },
    comprar && paraComprar.length > 0 && { href: "/painel/compras", icone: ShoppingBag, cor: "bg-orange-100 text-orange-700", titulo: `${paraComprar.length} ${paraComprar.length === 1 ? "compra aprovada" : "compras aprovadas"} para comprar`, detalhe: paraComprar.map((c) => `${c.codigo} · ${c.setor}`).join(", ") },
    verFinanceiro && vencidas.length > 0 && { href: "/painel/contas-a-pagar", icone: AlertTriangle, cor: "bg-rose-100 text-rose-700", titulo: `${vencidas.length} ${vencidas.length === 1 ? "conta vencida" : "contas vencidas"}`, detalhe: `${formatPrice(somaCents(vencidas, (c) => c.valorCents))} em atraso` },
    verEstoque && (comprar || aprovar) && estoqueBaixo.length > 0 && { href: "/painel/estoque", icone: MODULOS.estoque.icone, cor: "bg-teal-100 text-teal-700", titulo: `${estoqueBaixo.length} itens para repor no estoque`, detalhe: estoqueBaixo.slice(0, 3).map((i) => i.nome).join(", ") },
  ].filter(Boolean) as { href: string; icone: React.ElementType; cor: string; titulo: string; detalhe: string }[]

  return (
    <DashboardLayout title="Dashboard" bare>
      <div className="space-y-6 px-4 py-5 md:px-6 md:py-6">
        {/* Saudação + criar */}
        <section className="anim-sobe relative overflow-hidden rounded-3xl bg-sidebar px-5 py-6 text-sidebar-foreground md:px-7">
          <Petalas />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm capitalize text-sidebar-foreground/70">{dataLonga}</p>
              <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">
                {saudacao}, {usuario?.nome.split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-sidebar-foreground/75">
                {pendencias.length === 0 ? "Nada pendente com você agora." : `${pendencias.length} ${pendencias.length === 1 ? "assunto precisa" : "assuntos precisam"} de você hoje.`}{" "}
                <span className="text-sidebar-foreground/50">Perfil: {perfil && PERFIL_LABEL[perfil]}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {acoes.slice(0, 5).map((a) => {
                const Icone = a.icon
                return (
                  <Link key={a.href} href={a.href} className="group flex w-[4.5rem] flex-col items-center gap-1.5 text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 transition-colors group-hover:bg-girassol group-hover:text-sidebar">
                      <Icone className="size-5" />
                    </span>
                    <span className="text-[11px] font-semibold leading-tight text-sidebar-foreground/85">{a.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Pendências */}
        {pendencias.length > 0 && (
          <section className="grid gap-3 md:grid-cols-2">
            {pendencias.map((p) => {
              const Icone = p.icone
              return (
                <Link key={p.titulo} href={p.href} className="group flex items-center gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40">
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", p.cor)}>
                    <Icone className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{p.titulo}</span>
                    <span className="block truncate text-sm text-muted-foreground">{p.detalhe}</span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              )
            })}
          </section>
        )}

        {/* Financeiro */}
        {verFinanceiro && (
          <>
            <FaixaIndicadores
              itens={[
                { rotulo: `Entrou em ${rotuloMes(mes, true).split(" de ")[0]}`, valor: formatPrice(entrouMes), cor: "bg-[#1d64d8]" },
                { rotulo: "Saiu no mês", valor: formatPrice(saiuMes), cor: "bg-[#ea580c]" },
                { rotulo: "A pagar em 7 dias", valor: formatPrice(somaCents(proximas, (c) => c.valorCents)), detalhe: `${proximas.length} contas, com as vencidas`, cor: "bg-rose-500" },
                { rotulo: "A receber em 7 dias", valor: formatPrice(somaCents(aReceber7, (c) => c.valorCents)), detalhe: `${aReceber7.length} recebimentos`, cor: "bg-folha" },
              ]}
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <section className="rounded-2xl border bg-card p-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-bold">Entrou e saiu — últimos 6 meses</p>
                  <Link href="/painel/prestacao-de-contas" className="text-sm font-semibold text-primary hover:underline">
                    Prestação de contas
                  </Link>
                </div>
                <div className="mt-3">
                  <GraficoEntrouSaiu dados={serie} altura={220} />
                </div>
              </section>
              <section className="rounded-2xl border bg-card p-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-bold">Para pagar nesta semana</p>
                  <Link href="/painel/contas-a-pagar" className="text-sm font-semibold text-primary hover:underline">
                    Ver contas
                  </Link>
                </div>
                {proximas.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">Nenhuma conta vence nos próximos 7 dias.</p>
                ) : (
                  <ul className="mt-3 divide-y">
                    {proximas.slice(0, 6).map((c) => (
                      <li key={c.id}>
                        <Link href={`/painel/contas-a-pagar/${c.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80">
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">{c.descricao}</span>
                            <span className="block text-xs text-muted-foreground">{formatDate(c.vencimento)}</span>
                          </span>
                          <span className="flex shrink-0 flex-col items-end gap-1">
                            <span className="text-sm font-bold tabular-nums">{formatPrice(c.valorCents)}</span>
                            <SituacaoContaBadge conta={c} tipo="pagar" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <section className="rounded-2xl border bg-card p-5">
              <div className="flex items-baseline justify-between">
                <p className="font-bold">Verbas em uso</p>
                <Link href="/painel/verbas" className="text-sm font-semibold text-primary hover:underline">
                  Todas as verbas
                </Link>
              </div>
              <ul className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-2">
                {verbas.map((r) => (
                  <li key={r.verba.id}>
                    <Link href={`/painel/verbas/${r.verba.id}`} className="block hover:opacity-85">
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate font-semibold">{r.verba.nome}</span>
                        <span className={cn("shrink-0 tabular-nums", r.usoPct >= 80 ? "font-bold text-rose-600" : "text-muted-foreground")}>{r.usoPct}%</span>
                      </div>
                      <BarraUso className="mt-1.5" gasto={r.gastoCents} comprometido={r.comprometidoCents} total={r.verba.valorCents} />
                      <p className="mt-1 text-xs text-muted-foreground">Saldo {formatPrice(r.saldoCents)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Minhas solicitações */}
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <p className="font-bold">Minhas solicitações de compra</p>
              <Link href="/painel/compras/nova" className="text-sm font-semibold text-primary hover:underline">
                Solicitar
              </Link>
            </div>
            {minhas.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Nenhuma solicitação sua em andamento.</p>
            ) : (
              <ul className="mt-3 divide-y">
                {minhas.map((c) => (
                  <li key={c.id}>
                    <Link href={`/painel/compras/${c.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {c.codigo} · {resumoItens(c)}
                        </span>
                        <span className="block text-xs text-muted-foreground">{formatPrice(totalEstimado(c))} estimado</span>
                      </span>
                      <StatusCompraBadge status={c.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Na casa hoje */}
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <p className="font-bold">
                Na casa hoje <span className="font-normal text-muted-foreground">· {DIAS_SEMANA_LONGO[hojeDia]}</span>
              </p>
              <Link href="/painel/prestadores" className="text-sm font-semibold text-primary hover:underline">
                Prestadores
              </Link>
            </div>
            {naCasa.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Nenhum prestador com horário hoje.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {naCasa.map(({ p, x }) => (
                  <li key={`${p.id}-${x.inicio}`}>
                    <Link href={`/painel/prestadores/${p.id}`} className="flex items-center gap-3 hover:opacity-80">
                      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold", COR_AREA[p.area] ?? "bg-muted")}>{getInitials(p.nome)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{p.nome}</span>
                        <span className="block text-xs text-muted-foreground">
                          {p.area} · {x.setor}
                        </span>
                      </span>
                      <span className="text-sm font-bold tabular-nums">
                        {x.inicio}–{x.fim}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {verEstoque && estoqueBaixo.length > 0 && (
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <p className="font-bold">Estoque para repor</p>
              <Link href="/painel/estoque" className="text-sm font-semibold text-primary hover:underline">
                Estoque
              </Link>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {estoqueBaixo.map((i) => (
                <li key={i.id}>
                  <Link
                    href={`/painel/estoque/${i.id}`}
                    className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", situacaoEstoque(i) === "zerado" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800")}
                  >
                    {i.nome}
                    <span className="tabular-nums opacity-70">
                      {i.quantidade}/{i.minimo}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}

/** Um girassol grande e apagado no canto do cartão de boas-vindas — a assinatura visual da APAE. */
function Petalas() {
  const petalas = Array.from({ length: 14 }, (_, i) => i * (360 / 14))
  return (
    <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -top-20 -right-10 h-72 w-72 opacity-[0.14]">
      {petalas.map((a) => (
        <ellipse key={a} cx="100" cy="42" rx="15" ry="36" fill="#f5b700" transform={`rotate(${a} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="30" fill="#f5b700" />
    </svg>
  )
}
