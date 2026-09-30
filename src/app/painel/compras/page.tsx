"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableSurface } from "@/components/ui/table"
import { FiltroChips } from "@/components/common/filtro-chips"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, Vazio } from "@/components/apae/comum"
import { StatusCompraBadge, UrgenciaBadge, resumoItens, totalEstimado } from "@/components/compras/compras-comum"
import { formatDateTime, formatPrice } from "@/lib/format"
import { MODULOS } from "@/lib/modulos"
import { useDemo } from "@/store/demo-store"
import { usePode, useSessao } from "@/store/sessao-store"

export default function Page() {
  return (
    <Guard permissao="compras.solicitar" titulo="Compras">
      <Compras />
    </Guard>
  )
}

function Compras() {
  const router = useRouter()
  const compras = useDemo((s) => s.compras)
  const perfil = useSessao((s) => s.perfil)
  const verTodas = usePode("compras.ver_todas")
  const podeAprovar = usePode("compras.aprovar")
  const podeComprar = usePode("compras.comprar")
  const [busca, setBusca] = React.useState("")

  // Cada perfil abre a lista na fila que é DELE: direção no que aprovar, compras no que comprar.
  const inicial = podeAprovar ? "aprovar" : podeComprar ? "comprar" : "minhas"
  const [filtro, setFiltro] = React.useState(inicial)

  const visiveis = verTodas ? compras : compras.filter((c) => c.solicitante === perfil)
  const filas: { value: string; label: string; f: (c: (typeof compras)[number]) => boolean; mostra: boolean }[] = [
    { value: "aprovar", label: "Para aprovar", f: (c) => c.status === "solicitada", mostra: podeAprovar },
    { value: "comprar", label: "Para comprar", f: (c) => c.status === "aprovada", mostra: podeComprar || podeAprovar },
    { value: "minhas", label: "Minhas solicitações", f: (c) => c.solicitante === perfil, mostra: true },
    { value: "compradas", label: "Compradas", f: (c) => c.status === "comprada", mostra: true },
    { value: "todas", label: "Todas", f: () => true, mostra: true },
  ]
  const fila = filas.find((x) => x.value === filtro) ?? filas[4]
  const lista = visiveis
    .filter(fila.f)
    .filter((c) => `${c.codigo} ${c.setor} ${c.solicitanteNome} ${c.itens.map((i) => i.descricao).join(" ")}`.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))

  return (
    <DashboardLayout
      title="Compras"
      description="Quem precisa pede, a direção aprova, compras compra — e a conta cai sozinha no financeiro"
      actions={
        <Button asChild size="sm">
          <Link href="/painel/compras/nova">
            <Plus className="mr-1.5 h-4 w-4" />
            Solicitar compra
          </Link>
        </Button>
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <FiltroChips
            ariaLabel="Fila"
            value={filtro}
            onChange={setFiltro}
            options={filas.filter((x) => x.mostra).map((x) => ({ value: x.value, label: x.label, count: visiveis.filter(x.f).length }))}
          />
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar item, setor ou código" className="w-full sm:ml-auto sm:w-64" />
        </div>
      }
    >
      {lista.length === 0 ? (
        <Vazio
          icone={MODULOS.compras.icone}
          titulo={filtro === "aprovar" ? "Nada esperando aprovação" : filtro === "comprar" ? "Nada aprovado esperando compra" : "Nenhuma solicitação aqui"}
          descricao="Quando o seu setor precisar de algo, peça por aqui: a direção recebe o aviso na hora."
          acao={
            <Button asChild size="sm">
              <Link href="/painel/compras/nova">Solicitar compra</Link>
            </Button>
          }
        />
      ) : (
        <TableSurface>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead className="hidden md:table-cell">Setor · quem pediu</TableHead>
                <TableHead className="hidden sm:table-cell">Urgência</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`/painel/compras/${c.id}`)}>
                  <TableCell className="max-w-[20rem]">
                    <p className="truncate font-semibold">
                      <span className="mr-1.5 text-xs font-bold text-orange-600">{c.codigo}</span>
                      {resumoItens(c)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(c.criadoEm)}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-sm font-semibold">{c.setor}</p>
                    <p className="text-xs text-muted-foreground">{c.solicitanteNome}</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <UrgenciaBadge urgencia={c.urgencia} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <p className="font-bold">{formatPrice(c.valorRealCents ?? totalEstimado(c))}</p>
                    <p className="text-xs text-muted-foreground">{c.valorRealCents ? "valor pago" : "estimado"}</p>
                  </TableCell>
                  <TableCell>
                    <StatusCompraBadge status={c.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableSurface>
      )}
    </DashboardLayout>
  )
}
