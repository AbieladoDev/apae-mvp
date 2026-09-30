"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Eye, Pencil, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableSurface } from "@/components/ui/table"
import { FiltroChips, classeFiltroSelect } from "@/components/common/filtro-chips"
import { RowActions } from "@/components/common/row-actions"
import { StatusBadge } from "@/components/common/status-badge"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FaixaIndicadores, Guard, Vazio } from "@/components/apae/comum"
import { DialogoItem, DialogoMovimento } from "@/components/estoque/dialogos-estoque"
import { CATEGORIAS_ESTOQUE } from "@/data/catalogo"
import type { ItemEstoque } from "@/data/tipos"
import { ESTOQUE_LABEL, ESTOQUE_TOM, situacaoEstoque } from "@/lib/derivados"
import { hoje, mesDe } from "@/lib/datas"
import { MODULOS } from "@/lib/modulos"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"

export default function Page() {
  return (
    <Guard permissao="estoque.ler" titulo="Estoque">
      <Estoque />
    </Guard>
  )
}

function Estoque() {
  const router = useRouter()
  const d = useDemo()
  const podeEditar = usePode("estoque.editar")
  const podeSaida = usePode("estoque.saida")
  const [filtro, setFiltro] = React.useState("todos")
  const [categoria, setCategoria] = React.useState("todas")
  const [busca, setBusca] = React.useState("")
  const [mov, setMov] = React.useState<{ item?: string; tipo: "entrada" | "saida" } | null>(null)
  const [editando, setEditando] = React.useState<ItemEstoque | "novo" | null>(null)

  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mov") && podeSaida) setMov({ tipo: "saida" })
  }, [podeSaida])

  const itens = d.itensEstoque
  const lista = itens
    .filter((i) => {
      const s = situacaoEstoque(i)
      if (filtro === "repor" && s === "ok") return false
      if (categoria !== "todas" && i.categoria !== categoria) return false
      return `${i.nome} ${i.local}`.toLowerCase().includes(busca.toLowerCase())
    })
    .sort((a, b) => a.quantidade / Math.max(a.minimo, 1) - b.quantidade / Math.max(b.minimo, 1))

  const mes = mesDe(hoje())
  const movsMes = d.movsEstoque.filter((m) => mesDe(m.data) === mes)

  return (
    <DashboardLayout
      title="Estoque"
      description="O que a APAE tem guardado, e quem retirou o quê para qual setor"
      actions={
        <>
          {podeSaida && (
            <Button size="sm" onClick={() => setMov({ tipo: "saida" })}>
              <ArrowLeftRight className="mr-1.5 h-4 w-4" />
              Movimentar
            </Button>
          )}
          {podeEditar && (
            <Button size="sm" variant="outline" onClick={() => setEditando("novo")}>
              <Plus className="mr-1.5 h-4 w-4" />
              Novo item
            </Button>
          )}
        </>
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <FiltroChips
            ariaLabel="Situação"
            value={filtro}
            onChange={setFiltro}
            options={[
              { value: "todos", label: "Todos", count: itens.length },
              { value: "repor", label: "Precisa repor", count: itens.filter((i) => situacaoEstoque(i) !== "ok").length },
            ]}
          />
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger size="sm" className={cn("w-44", classeFiltroSelect(categoria !== "todas"))}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {CATEGORIAS_ESTOQUE.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar item" className="w-full sm:ml-auto sm:w-60" />
        </div>
      }
    >
      <FaixaIndicadores
        className="mb-5"
        itens={[
          { rotulo: "Itens cadastrados", valor: String(itens.length), cor: "bg-teal-500" },
          { rotulo: "Abaixo do mínimo", valor: String(itens.filter((i) => situacaoEstoque(i) === "baixo").length), cor: "bg-amber-400" },
          { rotulo: "Zerados", valor: String(itens.filter((i) => situacaoEstoque(i) === "zerado").length), cor: "bg-rose-500" },
          { rotulo: "Movimentações no mês", valor: String(movsMes.length), detalhe: `${movsMes.filter((m) => m.tipo === "saida").length} saídas`, cor: "bg-blue-500" },
        ]}
      />
      {lista.length === 0 ? (
        <Vazio icone={MODULOS.estoque.icone} titulo="Nenhum item com esses filtros" />
      ) : (
        <TableSurface className="first:mt-0 first:border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="hidden md:table-cell">Onde fica</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((i) => {
                const s = situacaoEstoque(i)
                const pct = Math.min(100, (i.quantidade / Math.max(i.minimo * 2, 1)) * 100)
                return (
                  <TableRow key={i.id} className="cursor-pointer" onClick={() => router.push(`/painel/estoque/${i.id}`)}>
                    <TableCell>
                      <p className="font-semibold">{i.nome}</p>
                      <p className="text-xs text-muted-foreground">{i.categoria}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{i.local}</TableCell>
                    <TableCell>
                      <p className="font-bold tabular-nums">
                        {i.quantidade} <span className="font-normal text-muted-foreground">{i.unidade}</span>
                      </p>
                      <div className="mt-1 h-1.5 w-28 rounded-full bg-muted">
                        <div className={cn("h-1.5 rounded-full", s === "ok" ? "bg-teal-500" : s === "baixo" ? "bg-amber-400" : "bg-rose-500")} style={{ width: `${Math.max(pct, 4)}%` }} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">mínimo {i.minimo}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tom={ESTOQUE_TOM[s]}>{ESTOQUE_LABEL[s]}</StatusBadge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex">
                        <RowActions
                          actions={[
                            { label: "Ver", icon: Eye, onSelect: () => router.push(`/painel/estoque/${i.id}`) },
                            { label: "Retirar", icon: ArrowUpFromLine, onSelect: () => setMov({ item: i.id, tipo: "saida" }), hidden: !podeSaida },
                            { label: "Dar entrada", icon: ArrowDownToLine, onSelect: () => setMov({ item: i.id, tipo: "entrada" }), hidden: !podeEditar },
                            { label: "Editar", icon: Pencil, onSelect: () => setEditando(i), hidden: !podeEditar },
                          ]}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableSurface>
      )}
      <DialogoMovimento aberto={!!mov} onOpenChange={(v) => !v && setMov(null)} itemInicial={mov?.item} tipoInicial={mov?.tipo} />
      <DialogoItem alvo={editando} onClose={() => setEditando(null)} />
    </DashboardLayout>
  )
}
