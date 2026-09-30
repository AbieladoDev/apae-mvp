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
import { COR_AREA, DiasNaCasa, TipoPrestadorBadge } from "@/components/prestadores/prestadores-comum"
import { DIAS_SEMANA_LONGO, TIPO_PRESTADOR_LABEL } from "@/data/catalogo"
import { formatPrice, getInitials } from "@/lib/format"
import { MODULOS } from "@/lib/modulos"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"

export default function Page() {
  return (
    <Guard permissao="prestadores.ler" titulo="Prestadores">
      <Prestadores />
    </Guard>
  )
}

function Prestadores() {
  const router = useRouter()
  const prestadores = useDemo((s) => s.prestadores)
  const podeEditar = usePode("prestadores.editar")
  const [tipo, setTipo] = React.useState("todos")
  const [busca, setBusca] = React.useState("")
  const hojeDia = new Date().getDay()

  const naCasaHoje = prestadores
    .flatMap((p) => p.dias.filter((d) => d.dia === hojeDia).map((d) => ({ p, d })))
    .sort((a, b) => a.d.inicio.localeCompare(b.d.inicio))

  const lista = prestadores
    .filter((p) => tipo === "todos" || p.tipo === tipo)
    .filter((p) => `${p.nome} ${p.area} ${p.descricao}`.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  return (
    <DashboardLayout
      title="Prestadores de serviço"
      description="Quem atende na APAE, o que faz e quando está na casa"
      actions={
        podeEditar && (
          <Button asChild size="sm">
            <Link href="/painel/prestadores/cadastro">
              <Plus className="mr-1.5 h-4 w-4" />
              Novo prestador
            </Link>
          </Button>
        )
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <FiltroChips
            ariaLabel="Tipo"
            value={tipo}
            onChange={setTipo}
            options={[{ value: "todos", label: "Todos", count: prestadores.length }, ...Object.entries(TIPO_PRESTADOR_LABEL).map(([value, label]) => ({ value, label, count: prestadores.filter((p) => p.tipo === value).length }))]}
          />
          <SearchInput value={busca} onChange={setBusca} placeholder="Nome ou área" className="w-full sm:ml-auto sm:w-60" />
        </div>
      }
    >
      <section className="mb-5 rounded-2xl border bg-card p-4">
        <p className="text-sm font-bold">
          Na casa hoje <span className="font-normal text-muted-foreground">· {DIAS_SEMANA_LONGO[hojeDia]}</span>
        </p>
        {naCasaHoje.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">Nenhum prestador tem horário hoje.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {naCasaHoje.map(({ p, d }) => (
              <li key={`${p.id}-${d.inicio}`}>
                <Link href={`/painel/prestadores/${p.id}`} className="flex items-center gap-2 rounded-full border bg-background py-1 pl-1 pr-3 hover:border-pink-300">
                  <span className={cn("flex size-7 items-center justify-center rounded-full text-[10px] font-extrabold", COR_AREA[p.area] ?? "bg-muted")}>{getInitials(p.nome)}</span>
                  <span className="text-sm">
                    <span className="font-bold">{p.nome.split(" ")[0]}</span> <span className="text-muted-foreground">{p.area} · {d.inicio}–{d.fim}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {lista.length === 0 ? (
        <Vazio icone={MODULOS.prestadores.icone} titulo="Nenhum prestador encontrado" />
      ) : (
        <TableSurface>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prestador</TableHead>
                <TableHead className="hidden md:table-cell">O que faz aqui</TableHead>
                <TableHead className="hidden sm:table-cell">Dias na casa</TableHead>
                <TableHead>Vínculo</TableHead>
                <TableHead className="text-right">Valor mensal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push(`/painel/prestadores/${p.id}`)}>
                  <TableCell>
                    <span className="flex items-center gap-3">
                      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold", COR_AREA[p.area] ?? "bg-muted")}>{getInitials(p.nome)}</span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{p.nome}</span>
                        <span className="block text-xs text-muted-foreground">{p.area}</span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="hidden max-w-[22rem] md:table-cell">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{p.descricao}</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {p.dias.length ? <DiasNaCasa dias={p.dias} /> : <span className="text-xs text-muted-foreground">Sob demanda</span>}
                  </TableCell>
                  <TableCell>
                    <TipoPrestadorBadge tipo={p.tipo} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.valorMensalCents ? <span className="font-bold">{formatPrice(p.valorMensalCents)}</span> : <span className="text-muted-foreground">—</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableSurface>
      )}
    </DashboardLayout>
  )
}
