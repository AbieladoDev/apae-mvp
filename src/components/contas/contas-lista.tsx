"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, Eye, Pencil, Plus, Trash2, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MonthPicker } from "@/components/ui/month-picker"
import { SearchInput } from "@/components/ui/search-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableSurface } from "@/components/ui/table"
import { FiltroChips, classeFiltroSelect } from "@/components/common/filtro-chips"
import { RowActions } from "@/components/common/row-actions"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FaixaTotais } from "@/components/finance/faixa-totais"
import { ChipVerba, Guard, SituacaoContaBadge, Vazio } from "@/components/apae/comum"
import { situacaoConta, somaCents } from "@/lib/derivados"
import { hoje, mesDe } from "@/lib/datas"
import { formatDate, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { usePode } from "@/store/sessao-store"
import { useDemo } from "@/store/demo-store"
import { DialogoQuitar } from "./dialogo-quitar"
import { TIPO, useContas, type ContaView, type TipoConta } from "./tipo-conta"

export function ContasLista({ tipo }: { tipo: TipoConta }) {
  return (
    <Guard permissao="financeiro.ler" titulo={TIPO[tipo].titulo}>
      <Conteudo tipo={tipo} />
    </Guard>
  )
}

function Conteudo({ tipo }: { tipo: TipoConta }) {
  const t = TIPO[tipo]
  const router = useRouter()
  const { lista, remover, quitar, desfazer } = useContas(tipo)
  const verbas = useDemo((s) => s.verbas)
  const podeEditar = usePode("financeiro.editar")

  const [situacao, setSituacao] = React.useState("todas")
  const [mes, setMes] = React.useState(mesDe(hoje()))
  const [classe, setClasse] = React.useState("todas")
  const [verba, setVerba] = React.useState("todas")
  const [busca, setBusca] = React.useState("")
  const [quitando, setQuitando] = React.useState<ContaView | null>(null)
  const [removendo, setRemovendo] = React.useState<ContaView | null>(null)

  const doMes = React.useMemo(
    () =>
      lista.filter((c) => {
        if (mes && mesDe(c.vencimento) !== mes) return false
        if (classe !== "todas" && c.classe !== classe) return false
        if (verba === "sem" && c.verbaId) return false
        if (verba !== "todas" && verba !== "sem" && c.verbaId !== verba) return false
        if (busca) {
          const b = busca.toLowerCase()
          if (!`${c.descricao} ${c.contraparte}`.toLowerCase().includes(b)) return false
        }
        return true
      }),
    [lista, mes, classe, verba, busca]
  )

  const conta = (f: (c: ContaView) => boolean) => doMes.filter(f).length
  const filtradas = doMes
    .filter((c) => {
      const s = situacaoConta(c)
      if (situacao === "abertas") return s !== "quitada"
      if (situacao === "vencidas") return s === "vencida"
      if (situacao === "quitadas") return s === "quitada"
      return true
    })
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))

  const abertas = doMes.filter((c) => !c.quitadoEm)
  const quitadas = doMes.filter((c) => c.quitadoEm)
  const vencidas = doMes.filter((c) => situacaoConta(c) === "vencida")

  return (
    <DashboardLayout
      title={t.titulo}
      description={t.descricao}
      actions={
        podeEditar && (
          <Button asChild size="sm">
            <Link href={`${t.base}/cadastro`}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t.nova}
            </Link>
          </Button>
        )
      }
      toolbar={
        <div className="flex flex-col gap-3">
          <FiltroChips
            ariaLabel="Situação"
            value={situacao}
            onChange={setSituacao}
            options={[
              { value: "todas", label: "Todas", count: doMes.length },
              { value: "abertas", label: "Em aberto", count: conta((c) => !c.quitadoEm) },
              { value: "vencidas", label: "Vencidas", count: conta((c) => situacaoConta(c) === "vencida") },
              { value: "quitadas", label: tipo === "pagar" ? "Pagas" : "Recebidas", count: conta((c) => !!c.quitadoEm) },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput value={busca} onChange={setBusca} placeholder={`Buscar descrição ou ${t.contraparteRotulo.toLowerCase()}`} className="w-full sm:w-72" />
            <MonthPicker value={mes} onChange={setMes} compact className="w-36" aria-label="Mês de vencimento" />
            {mes && (
              <Button variant="ghost" size="sm" onClick={() => setMes("")}>
                Todos os meses
              </Button>
            )}
            <Select value={classe} onValueChange={setClasse}>
              <SelectTrigger size="sm" className={cn("w-44", classeFiltroSelect(classe !== "todas"))}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">{tipo === "pagar" ? "Todas as categorias" : "Todas as origens"}</SelectItem>
                {t.classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={verba} onValueChange={setVerba}>
              <SelectTrigger size="sm" className={cn("w-48", classeFiltroSelect(verba !== "todas"))}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Com e sem verba</SelectItem>
                <SelectItem value="sem">Sem verba</SelectItem>
                {verbas.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      }
    >
      {filtradas.length === 0 ? (
        <Vazio
          icone={t.modulo.icone}
          titulo="Nenhuma conta com esses filtros"
          descricao={mes ? "Tente outro mês ou limpe os filtros." : "Ajuste os filtros ou lance uma conta nova."}
          acao={
            podeEditar && (
              <Button asChild size="sm">
                <Link href={`${t.base}/cadastro`}>{t.nova}</Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <TableSurface>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="hidden md:table-cell">{t.classeRotulo}</TableHead>
                  <TableHead className="hidden lg:table-cell">Verba</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`${t.base}/${c.id}`)}>
                    <TableCell className="max-w-[18rem]">
                      <p className="truncate font-semibold">{c.descricao}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.contraparte}
                        {c.compraId && " · veio de uma compra"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <span className="size-2 rounded-full" style={{ background: t.corClasse(c.classe) }} />
                        {c.classe}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <ChipVerba verbaId={c.verbaId} />
                    </TableCell>
                    <TableCell className="tabular-nums">{formatDate(c.vencimento)}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums">{formatPrice(c.valorCents)}</TableCell>
                    <TableCell>
                      <SituacaoContaBadge conta={{ vencimento: c.vencimento, pagoEm: c.quitadoEm }} tipo={tipo} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex">
                        <RowActions
                          actions={[
                            { label: "Ver", icon: Eye, onSelect: () => router.push(`${t.base}/${c.id}`) },
                            { label: t.quitar, icon: CheckCircle2, onSelect: () => setQuitando(c), hidden: !podeEditar || !!c.quitadoEm },
                            {
                              label: t.desfazer,
                              icon: Undo2,
                              onSelect: () => {
                                desfazer(c.id)
                                toast.success("Pronto, a conta voltou para em aberto")
                              },
                              hidden: !podeEditar || !c.quitadoEm,
                            },
                            { label: "Editar", icon: Pencil, onSelect: () => router.push(`${t.base}/${c.id}/edicao`), hidden: !podeEditar },
                            { label: "Remover", icon: Trash2, onSelect: () => setRemovendo(c), destructive: true, hidden: !podeEditar },
                          ]}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableSurface>
          <FaixaTotais
            className="mt-4"
            contagem={filtradas.length}
            substantivo={{ um: "conta", muitos: "contas" }}
            itens={[
              { rotulo: "Em aberto", valorCents: somaCents(abertas, (c) => c.valorCents) },
              { rotulo: "Vencido", valorCents: somaCents(vencidas, (c) => c.valorCents) },
              { rotulo: tipo === "pagar" ? "Pago" : "Recebido", valorCents: somaCents(quitadas, (c) => c.valorCents) },
              { rotulo: "Total", valorCents: somaCents(doMes, (c) => c.valorCents), destaque: true },
            ]}
          />
        </>
      )}

      <DialogoQuitar tipo={tipo} conta={quitando} onOpenChange={(v) => !v && setQuitando(null)} onConfirmar={(d, f) => quitando && quitar(quitando.id, d, f)} />
      <ConfirmDeleteDialog
        open={!!removendo}
        onOpenChange={(v) => !v && setRemovendo(null)}
        title={`Remover ${t.singular}?`}
        description={`"${removendo?.descricao}" sai da lista e da prestação de contas. O histórico guarda que ela existiu.`}
        onConfirm={() => {
          if (removendo) remover(removendo.id)
          toast.success("Conta removida")
          setRemovendo(null)
        }}
      />
    </DashboardLayout>
  )
}
