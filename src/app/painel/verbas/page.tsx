"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { FiltroChips } from "@/components/common/filtro-chips"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BarraUso, FaixaIndicadores, Guard, Vazio } from "@/components/apae/comum"
import { TIPO_VERBA_LABEL } from "@/data/catalogo"
import { resumoVerba, somaCents } from "@/lib/derivados"
import { hoje } from "@/lib/datas"
import { formatDate, formatPrice } from "@/lib/format"
import { MODULOS } from "@/lib/modulos"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"

export default function Page() {
  return (
    <Guard permissao="financeiro.ler" titulo="Verbas">
      <Verbas />
    </Guard>
  )
}

function Verbas() {
  const d = useDemo()
  const podeEditar = usePode("financeiro.editar")
  const [filtro, setFiltro] = React.useState("vigentes")
  const [busca, setBusca] = React.useState("")
  const h = hoje()

  const resumos = d.verbas.map((v) => resumoVerba(v, d.contasPagar, d.contasReceber))
  const vigente = (fim: string, inicio: string) => inicio <= h && fim >= h
  const lista = resumos
    .filter((r) => {
      if (filtro === "vigentes" && !vigente(r.verba.fim, r.verba.inicio)) return false
      if (filtro === "encerradas" && r.verba.fim >= h) return false
      if (filtro === "atencao" && r.usoPct < 80) return false
      const ap = d.apoiadores.find((a) => a.id === r.verba.apoiadorId)?.nome ?? ""
      return `${r.verba.nome} ${ap}`.toLowerCase().includes(busca.toLowerCase())
    })
    .sort((a, b) => b.usoPct - a.usoPct)

  return (
    <DashboardLayout
      title="Verbas"
      description="Dinheiro com destino: convênios, emendas, programas e campanhas — e quanto de cada um já foi usado"
      actions={
        podeEditar && (
          <Button asChild size="sm">
            <Link href="/painel/verbas/cadastro">
              <Plus className="mr-1.5 h-4 w-4" />
              Nova verba
            </Link>
          </Button>
        )
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <FiltroChips
            ariaLabel="Situação da verba"
            value={filtro}
            onChange={setFiltro}
            options={[
              { value: "vigentes", label: "Vigentes", count: resumos.filter((r) => vigente(r.verba.fim, r.verba.inicio)).length },
              { value: "atencao", label: "Acima de 80%", count: resumos.filter((r) => r.usoPct >= 80).length },
              { value: "encerradas", label: "Encerradas", count: resumos.filter((r) => r.verba.fim < h).length },
              { value: "todas", label: "Todas", count: resumos.length },
            ]}
          />
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar verba ou apoiador" className="w-full sm:ml-auto sm:w-64" />
        </div>
      }
    >
      <FaixaIndicadores
        className="mb-5"
        itens={[
          { rotulo: "Valor aprovado", valor: formatPrice(somaCents(resumos, (r) => r.verba.valorCents)), detalhe: `${resumos.length} verbas`, cor: "bg-amber-400" },
          { rotulo: "Já recebido", valor: formatPrice(somaCents(resumos, (r) => r.recebidoCents)), detalhe: `falta receber ${formatPrice(somaCents(resumos, (r) => r.aReceberCents))}`, cor: "bg-emerald-500" },
          { rotulo: "Gasto", valor: formatPrice(somaCents(resumos, (r) => r.gastoCents)), detalhe: `+ ${formatPrice(somaCents(resumos, (r) => r.comprometidoCents))} a pagar`, cor: "bg-rose-500" },
          { rotulo: "Saldo das verbas", valor: formatPrice(somaCents(resumos, (r) => r.saldoCents)), detalhe: "aprovado menos gasto e a pagar", cor: "bg-blue-500" },
        ]}
      />

      {lista.length === 0 ? (
        <Vazio icone={MODULOS.verbas.icone} titulo="Nenhuma verba aqui" descricao="Troque o filtro ou cadastre uma verba nova." />
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
          {lista.map((r) => {
            const ap = d.apoiadores.find((a) => a.id === r.verba.apoiadorId)
            return (
              <li key={r.verba.id}>
                <Link href={`/painel/verbas/${r.verba.id}`} className="grid gap-3 px-4 py-4 transition-colors hover:bg-muted/40 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-center md:gap-6 md:px-5">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{r.verba.nome}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {ap?.nome} · {TIPO_VERBA_LABEL[r.verba.tipo]} · até {formatDate(r.verba.fim)}
                    </p>
                  </div>
                  <div>
                    <BarraUso gasto={r.gastoCents} comprometido={r.comprometidoCents} total={r.verba.valorCents} />
                    <p className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>
                        <span className={cn("font-bold", r.usoPct >= 80 ? "text-rose-600" : "text-foreground")}>{r.usoPct}%</span> usado
                      </span>
                      <span className="tabular-nums">{formatPrice(r.verba.valorCents)}</span>
                    </p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <p className={cn("text-lg font-extrabold tabular-nums", r.saldoCents < 0 && "text-rose-600")}>{formatPrice(r.saldoCents)}</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardLayout>
  )
}
