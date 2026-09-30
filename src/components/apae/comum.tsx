"use client"

import * as React from "react"
import Link from "next/link"
import { Lock, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { StatusBadge } from "@/components/common/status-badge"
import { ListaDeEscolha } from "@/components/common/lista-de-escolha"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { rotuloSituacao, resumoVerba, situacaoConta, SITUACAO_TOM } from "@/lib/derivados"
import { formatPrice } from "@/lib/format"
import type { Permissao } from "@/lib/permissoes"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"

/* ---------- Dinheiro ---------- */

/** O `CurrencyInput` trabalha com decimal em string ("123.45"); o store com centavos. */
export const centsParaCampo = (c: number | undefined) => (c ? String(c / 100) : "")
export const campoParaCents = (v: string) => Math.round((parseFloat(v) || 0) * 100)

/* ---------- Acesso ---------- */

/** Tela inteira bloqueada para quem não tem a permissão (ex.: funcionário abrindo a URL de contas). */
export function Guard({ permissao, titulo, children }: { permissao: Permissao; titulo: string; children: React.ReactNode }) {
  const pode = usePode(permissao)
  if (pode) return <>{children}</>
  return (
    <DashboardLayout title={titulo}>
      <Vazio
        icone={Lock}
        titulo="Seu perfil não tem acesso a esta tela"
        descricao="Troque de perfil no menu do seu nome, no rodapé da barra lateral, para ver esta parte da demonstração."
        acao={
          <Button asChild variant="outline" size="sm">
            <Link href="/painel">Voltar ao início</Link>
          </Button>
        }
      />
    </DashboardLayout>
  )
}

export function NaoEncontrado({ titulo, voltar }: { titulo: string; voltar: string }) {
  return (
    <DashboardLayout title={titulo}>
      <Vazio
        icone={SearchX}
        titulo="Registro não encontrado"
        descricao="Ele pode ter sido removido. Se você restaurou os dados de demonstração, os registros criados foram apagados."
        acao={
          <Button asChild variant="outline" size="sm">
            <Link href={voltar}>Voltar para a lista</Link>
          </Button>
        }
      />
    </DashboardLayout>
  )
}

export function Vazio({
  icone: Icone,
  titulo,
  descricao,
  acao,
  className,
}: {
  icone: React.ElementType
  titulo: string
  descricao?: string
  acao?: React.ReactNode
  className?: string
}) {
  return (
    <Empty className={cn("border bg-card", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-accent text-primary">
          <Icone />
        </EmptyMedia>
        <EmptyTitle>{titulo}</EmptyTitle>
        {descricao && <EmptyDescription>{descricao}</EmptyDescription>}
      </EmptyHeader>
      {acao && <EmptyContent>{acao}</EmptyContent>}
    </Empty>
  )
}

/* ---------- Situação de conta ---------- */

export function SituacaoContaBadge({
  conta,
  tipo,
}: {
  conta: { vencimento: string; pagoEm?: string; recebidoEm?: string }
  tipo: "pagar" | "receber"
}) {
  const s = situacaoConta(conta)
  return <StatusBadge tom={SITUACAO_TOM[s]}>{rotuloSituacao(s, tipo)}</StatusBadge>
}

/* ---------- Faixa de indicadores ---------- */

export interface Indicador {
  rotulo: string
  valor: string
  detalhe?: string
  /** classe de fundo da bolinha — cor do indicador */
  cor: string
}

/**
 * Faixa de números no topo das telas. Sem cartões: uma linha dividida, cada
 * número com a bolinha da sua cor — é a cor que liga o número ao gráfico e à
 * lista logo abaixo.
 */
export function FaixaIndicadores({ itens, className }: { itens: Indicador[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 overflow-hidden rounded-2xl border bg-card lg:grid-cols-4", className)}>
      {itens.map((i, idx) => (
        <div
          key={i.rotulo}
          className={cn(
            "min-w-0 px-4 py-3.5 md:px-5",
            idx % 2 === 1 && "border-l",
            idx >= 2 && "border-t lg:border-t-0",
            idx === 2 && "lg:border-l"
          )}
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <span className={cn("size-2 rounded-full", i.cor)} />
            {i.rotulo}
          </p>
          <p className="mt-1 truncate text-xl font-extrabold tabular-nums md:text-2xl">{i.valor}</p>
          {i.detalhe && <p className="truncate text-xs text-muted-foreground">{i.detalhe}</p>}
        </div>
      ))}
    </div>
  )
}

/* ---------- Escolha de verba ---------- */

/**
 * A lista de verbas com o SALDO de cada uma ao lado do nome — quem lança a
 * conta vê na hora se a verba comporta o gasto.
 */
export function SeletorVerba({
  valor,
  onChange,
  disabled,
}: {
  valor: string
  onChange: (id: string) => void
  disabled?: boolean
}) {
  const verbas = useDemo((s) => s.verbas)
  const apoiadores = useDemo((s) => s.apoiadores)
  const pagar = useDemo((s) => s.contasPagar)
  const receber = useDemo((s) => s.contasReceber)
  return (
    <ListaDeEscolha
      itens={verbas}
      valor={valor}
      onEscolher={onChange}
      chave={(v) => v.id}
      nome={(v) => {
        const r = resumoVerba(v, pagar, receber)
        const ap = apoiadores.find((a) => a.id === v.apoiadorId)?.nome ?? "—"
        return `${v.nome} · ${ap} · saldo ${formatPrice(r.saldoCents)}`
      }}
      selo={() => <span className="size-2.5 shrink-0 rounded-full bg-amber-400" />}
      rotuloVazio="Escolha a verba"
      seloVazio={<span className="size-2.5 shrink-0 rounded-full border border-dashed border-muted-foreground/50" />}
      valorVazio=""
      disabled={disabled}
    />
  )
}

/** Chip da verba em listas. */
export function ChipVerba({ verbaId }: { verbaId?: string }) {
  const verba = useDemo((s) => s.verbas.find((v) => v.id === verbaId))
  if (!verba) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <Link
      href={`/painel/verbas/${verba.id}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex max-w-[14rem] items-center gap-1 truncate rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 hover:bg-amber-200"
    >
      <span className="truncate">{verba.nome}</span>
    </Link>
  )
}

/** Barra de uso de verba: gasto (sólido) + comprometido (listrado). */
export function BarraUso({ gasto, comprometido, total, className }: { gasto: number; comprometido: number; total: number; className?: string }) {
  const pg = total > 0 ? Math.min(100, (gasto / total) * 100) : 0
  const pc = total > 0 ? Math.min(100 - pg, (comprometido / total) * 100) : 0
  const alto = pg + pc >= 80
  return (
    <div className={cn("flex h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full", alto ? "bg-rose-500" : "bg-amber-400")} style={{ width: `${pg}%` }} />
      <div
        className={cn("h-full", alto ? "bg-rose-300" : "bg-amber-200")}
        style={{ width: `${pc}%`, backgroundImage: "repeating-linear-gradient(45deg, transparent 0 4px, rgba(255,255,255,.55) 4px 8px)" }}
      />
    </div>
  )
}
