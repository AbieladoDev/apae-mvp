"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableSurface } from "@/components/ui/table"
import { classeFiltroSelect } from "@/components/common/filtro-chips"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FaixaIndicadores, Guard, Vazio } from "@/components/apae/comum"
import { EstadoBemBadge, OrigemBemBadge } from "@/components/patrimonio/patrimonio-comum"
import { CATEGORIAS_BEM, SETORES } from "@/data/catalogo"
import { somaCents } from "@/lib/derivados"
import { formatPrice } from "@/lib/format"
import { MODULOS } from "@/lib/modulos"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"

export default function Page() {
  return (
    <Guard permissao="patrimonio.ler" titulo="Patrimônio">
      <Patrimonio />
    </Guard>
  )
}

function Patrimonio() {
  const router = useRouter()
  const bens = useDemo((s) => s.bens)
  const podeEditar = usePode("patrimonio.editar")
  const [setor, setSetor] = React.useState("todos")
  const [categoria, setCategoria] = React.useState("todas")
  const [busca, setBusca] = React.useState("")

  const lista = bens
    .filter((b) => (setor === "todos" || b.setor === setor) && (categoria === "todas" || b.categoria === categoria))
    .filter((b) => `${b.plaqueta} ${b.nome} ${b.responsavel}`.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => a.plaqueta.localeCompare(b.plaqueta))

  return (
    <DashboardLayout
      title="Patrimônio"
      description="Os bens da APAE: onde estão, com quem, em que estado e de onde vieram"
      actions={
        podeEditar && (
          <Button asChild size="sm">
            <Link href="/painel/patrimonio/cadastro">
              <Plus className="mr-1.5 h-4 w-4" />
              Novo bem
            </Link>
          </Button>
        )
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={busca} onChange={setBusca} placeholder="Plaqueta, nome ou responsável" className="w-full sm:w-72" />
          <Select value={setor} onValueChange={setSetor}>
            <SelectTrigger size="sm" className={cn("w-44", classeFiltroSelect(setor !== "todos"))}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os setores</SelectItem>
              {SETORES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger size="sm" className={cn("w-52", classeFiltroSelect(categoria !== "todas"))}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {CATEGORIAS_BEM.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <FaixaIndicadores
        className="mb-5"
        itens={[
          { rotulo: "Bens cadastrados", valor: String(bens.length), cor: "bg-violet-500" },
          { rotulo: "Valor total", valor: formatPrice(somaCents(bens, (b) => b.valorCents)), cor: "bg-blue-500" },
          { rotulo: "Vindos de verba ou doação", valor: String(bens.filter((b) => b.origem !== "compra").length), cor: "bg-amber-400" },
          { rotulo: "Precisam de reparo", valor: String(bens.filter((b) => b.estado === "ruim").length), cor: "bg-rose-500" },
        ]}
      />
      {lista.length === 0 ? (
        <Vazio icone={MODULOS.patrimonio.icone} titulo="Nenhum bem com esses filtros" />
      ) : (
        <TableSurface>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bem</TableHead>
                <TableHead className="hidden md:table-cell">Setor · responsável</TableHead>
                <TableHead className="hidden lg:table-cell">Origem</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((b) => (
                <TableRow key={b.id} className="cursor-pointer" onClick={() => router.push(`/painel/patrimonio/${b.id}`)}>
                  <TableCell className="max-w-[20rem]">
                    <p className="truncate font-semibold">{b.nome}</p>
                    <p className="text-xs">
                      <span className="font-bold text-violet-700">{b.plaqueta}</span> <span className="text-muted-foreground">· {b.categoria}</span>
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-sm font-semibold">{b.setor}</p>
                    <p className="text-xs text-muted-foreground">{b.responsavel}</p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <OrigemBemBadge origem={b.origem} />
                  </TableCell>
                  <TableCell>
                    <EstadoBemBadge estado={b.estado} />
                  </TableCell>
                  <TableCell className="text-right font-bold tabular-nums">{formatPrice(b.valorCents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableSurface>
      )}
    </DashboardLayout>
  )
}
