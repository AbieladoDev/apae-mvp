"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FiltroChips, classeFiltroSelect } from "@/components/common/filtro-chips"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BarraUso, FaixaIndicadores, Guard } from "@/components/apae/comum"
import { COR_ENTROU, COR_SAIU, GraficoEntrouSaiu, Ranking } from "@/components/prestacao/graficos"
import { COR_CATEGORIA, COR_ORIGEM } from "@/data/catalogo"
import { resumoVerba, somaCents } from "@/lib/derivados"
import { hoje, mesDe, rotuloMes, ultimosMeses } from "@/lib/datas"
import { formatDate, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"

export default function Page() {
  return (
    <Guard permissao="prestacao.ler" titulo="Prestação de contas">
      <Prestacao />
    </Guard>
  )
}

const PERIODOS = [
  { value: "mes", label: "Este mês", meses: 1 },
  { value: "3m", label: "3 meses", meses: 3 },
  { value: "6m", label: "6 meses", meses: 6 },
  { value: "ano", label: "Este ano", meses: 0 },
]

/**
 * A PRESTAÇÃO DE CONTAS — o financeiro visto de cima.
 *
 * Regime de CAIXA: o período conta o que foi efetivamente pago e recebido
 * (data de pagamento/recebimento), que é o que convênio e apoiador cobram.
 * O "em aberto" é a exceção: contas a pagar com vencimento no período e ainda
 * não pagas.
 */
function Prestacao() {
  const d = useDemo()
  const [periodo, setPeriodo] = React.useState("6m")
  const [verbaId, setVerbaId] = React.useState("todas")
  const [apoiadorId, setApoiadorId] = React.useState("todos")

  const meses = React.useMemo(() => {
    const p = PERIODOS.find((x) => x.value === periodo)!
    if (p.meses) return ultimosMeses(p.meses)
    return ultimosMeses(new Date().getMonth() + 1)
  }, [periodo])
  const inicio = `${meses[0]}-01`
  const fim = hoje()

  const verbasDoApoiador = apoiadorId === "todos" ? null : new Set(d.verbas.filter((v) => v.apoiadorId === apoiadorId).map((v) => v.id))
  const passa = (c: { verbaId?: string; apoiadorId?: string }) => {
    if (verbaId === "sem" && c.verbaId) return false
    if (verbaId !== "todas" && verbaId !== "sem" && c.verbaId !== verbaId) return false
    if (verbasDoApoiador && !(c.verbaId && verbasDoApoiador.has(c.verbaId)) && c.apoiadorId !== apoiadorId) return false
    return true
  }
  const noPeriodo = (data?: string) => !!data && data >= inicio && data <= fim

  const pagas = d.contasPagar.filter((c) => noPeriodo(c.pagoEm) && passa(c))
  const recebidas = d.contasReceber.filter((c) => noPeriodo(c.recebidoEm) && passa(c))
  const emAberto = d.contasPagar.filter((c) => !c.pagoEm && c.vencimento >= inicio && c.vencimento <= `${meses.at(-1)}-31` && passa(c))

  const entrou = somaCents(recebidas, (c) => c.valorCents)
  const saiu = somaCents(pagas, (c) => c.valorCents)

  const serie = meses.map((m) => ({
    mes: rotuloMes(m),
    entrou: somaCents(recebidas.filter((c) => mesDe(c.recebidoEm!) === m), (c) => c.valorCents),
    saiu: somaCents(pagas.filter((c) => mesDe(c.pagoEm!) === m), (c) => c.valorCents),
  }))

  const agrupa = <T,>(lista: T[], chave: (x: T) => string, valor: (x: T) => number) =>
    Object.entries(lista.reduce<Record<string, number>>((acc, x) => ({ ...acc, [chave(x)]: (acc[chave(x)] ?? 0) + valor(x) }), {}))
      .map(([rotulo, v]) => ({ rotulo, valor: v }))
      .sort((a, b) => b.valor - a.valor)

  const porCategoria = agrupa(pagas, (c) => c.categoria, (c) => c.valorCents).map((x) => ({ ...x, ponto: COR_CATEGORIA[x.rotulo]?.hex }))
  const porOrigem = agrupa(recebidas, (c) => c.origem, (c) => c.valorCents).map((x) => ({ ...x, ponto: COR_ORIGEM[x.rotulo] }))

  const verbas = d.verbas.filter((v) => (verbaId === "todas" || v.id === verbaId) && (apoiadorId === "todos" || v.apoiadorId === apoiadorId))
  const resumos = verbas.map((v) => ({ r: resumoVerba(v, d.contasPagar, d.contasReceber), ap: d.apoiadores.find((a) => a.id === v.apoiadorId) }))

  const porApoiador = d.apoiadores
    .filter((a) => apoiadorId === "todos" || a.id === apoiadorId)
    .map((a) => {
      const ids = new Set(d.verbas.filter((v) => v.apoiadorId === a.id).map((v) => v.id))
      const dele = (c: { verbaId?: string; apoiadorId?: string }) => (c.verbaId && ids.has(c.verbaId)) || c.apoiadorId === a.id
      return {
        a,
        verbas: ids.size,
        recebido: somaCents(recebidas.filter(dele), (c) => c.valorCents),
        aplicado: somaCents(pagas.filter((c) => c.verbaId && ids.has(c.verbaId)), (c) => c.valorCents),
      }
    })
    .filter((x) => x.recebido || x.aplicado || x.verbas)
    .sort((x, y) => y.recebido - x.recebido)

  const lancamentos = [
    ...recebidas.map((c) => ({ id: c.id, data: c.recebidoEm!, descricao: c.descricao, quem: c.pagador, classe: c.origem, valor: c.valorCents, verbaId: c.verbaId, href: `/painel/contas-a-receber/${c.id}` })),
    ...pagas.map((c) => ({ id: c.id, data: c.pagoEm!, descricao: c.descricao, quem: c.fornecedor, classe: c.categoria, valor: -c.valorCents, verbaId: c.verbaId, href: `/painel/contas-a-pagar/${c.id}` })),
  ].sort((a, b) => b.data.localeCompare(a.data))

  const rotuloPeriodo = `${formatDate(inicio)} a ${formatDate(fim)}`
  const verbaSel = d.verbas.find((v) => v.id === verbaId)
  const apoiadorSel = d.apoiadores.find((a) => a.id === apoiadorId)

  return (
    <DashboardLayout
      title="Prestação de contas"
      description="O que entrou, o que saiu e para onde foi — por verba e por apoiador"
      actions={
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Printer className="mr-1.5 h-4 w-4" />
          Imprimir relatório
        </Button>
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <FiltroChips ariaLabel="Período" value={periodo} onChange={setPeriodo} options={PERIODOS.map(({ value, label }) => ({ value, label }))} />
          <Select value={verbaId} onValueChange={setVerbaId}>
            <SelectTrigger size="sm" className={cn("w-56", classeFiltroSelect(verbaId !== "todas"))}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as verbas</SelectItem>
              <SelectItem value="sem">Só recurso próprio (sem verba)</SelectItem>
              {d.verbas.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={apoiadorId} onValueChange={setApoiadorId}>
            <SelectTrigger size="sm" className={cn("w-56", classeFiltroSelect(apoiadorId !== "todos"))}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os apoiadores</SelectItem>
              {d.apoiadores.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="area-impressao space-y-5">
        {/* Cabeçalho que só aparece no papel */}
        <div className="hidden items-center gap-3 border-b pb-3 print:flex">
          <Image src="/logo.jpeg" alt="" width={48} height={48} />
          <div>
            <p className="text-lg font-extrabold">APAE de Esteio — Prestação de contas</p>
            <p className="text-sm">
              {rotuloPeriodo}
              {verbaSel && ` · Verba: ${verbaSel.nome}`}
              {apoiadorSel && ` · Apoiador: ${apoiadorSel.nome}`}
            </p>
          </div>
        </div>

        <FaixaIndicadores
          itens={[
            { rotulo: "Entrou", valor: formatPrice(entrou), detalhe: `${recebidas.length} recebimentos`, cor: "bg-[#1d64d8]" },
            { rotulo: "Saiu", valor: formatPrice(saiu), detalhe: `${pagas.length} pagamentos`, cor: "bg-[#ea580c]" },
            { rotulo: "Saldo do período", valor: formatPrice(entrou - saiu), detalhe: entrou >= saiu ? "sobrou" : "faltou", cor: entrou >= saiu ? "bg-folha" : "bg-rose-500" },
            { rotulo: "A pagar no período", valor: formatPrice(somaCents(emAberto, (c) => c.valorCents)), detalhe: `${emAberto.length} contas em aberto`, cor: "bg-girassol" },
          ]}
        />

        <Tabs defaultValue="resumo">
          <TabsList className="no-print">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="verbas">Por verba</TabsTrigger>
            <TabsTrigger value="apoiadores">Por apoiador</TabsTrigger>
            <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="mt-4 space-y-5">
            <section className="rounded-2xl border bg-card p-5">
              <p className="font-bold">Mês a mês</p>
              <p className="text-sm text-muted-foreground">Recebimentos e pagamentos efetivados em cada mês.</p>
              <div className="mt-3">
                <GraficoEntrouSaiu dados={serie} />
              </div>
            </section>
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-2xl border bg-card p-5">
                <p className="font-bold">Para onde foi o dinheiro</p>
                <p className="mb-4 text-sm text-muted-foreground">Pagamentos por categoria.</p>
                <Ranking itens={porCategoria} cor={COR_SAIU} vazio="Nenhum pagamento no período." />
              </section>
              <section className="rounded-2xl border bg-card p-5">
                <p className="font-bold">De onde veio</p>
                <p className="mb-4 text-sm text-muted-foreground">Recebimentos por origem.</p>
                <Ranking itens={porOrigem} cor={COR_ENTROU} vazio="Nenhum recebimento no período." />
              </section>
            </div>
          </TabsContent>

          <TabsContent value="verbas" className="mt-4">
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Verba</TableHead>
                    <TableHead className="text-right">Aprovado</TableHead>
                    <TableHead className="text-right">Recebido</TableHead>
                    <TableHead className="text-right">Gasto</TableHead>
                    <TableHead className="text-right">A pagar</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="w-40 pr-4">Uso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumos.map(({ r, ap }) => (
                    <TableRow key={r.verba.id}>
                      <TableCell className="max-w-[16rem] pl-4">
                        <Link href={`/painel/verbas/${r.verba.id}`} className="block truncate font-semibold hover:underline">
                          {r.verba.nome}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">{ap?.nome}</p>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatPrice(r.verba.valorCents)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPrice(r.recebidoCents)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPrice(r.gastoCents)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPrice(r.comprometidoCents)}</TableCell>
                      <TableCell className={cn("text-right font-bold tabular-nums", r.saldoCents < 0 && "text-rose-600")}>{formatPrice(r.saldoCents)}</TableCell>
                      <TableCell className="pr-4">
                        <BarraUso gasto={r.gastoCents} comprometido={r.comprometidoCents} total={r.verba.valorCents} />
                        <p className="mt-1 text-right text-xs tabular-nums text-muted-foreground">{r.usoPct}%</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">
                Valores acumulados desde o início de cada verba — é o que o apoiador pede na prestação de contas.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="apoiadores" className="mt-4">
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Apoiador</TableHead>
                    <TableHead className="text-right">Verbas</TableHead>
                    <TableHead className="text-right">Recebido no período</TableHead>
                    <TableHead className="pr-4 text-right">Aplicado no período</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {porApoiador.map(({ a, verbas: n, recebido, aplicado }) => (
                    <TableRow key={a.id}>
                      <TableCell className="pl-4 font-semibold">{a.nome}</TableCell>
                      <TableCell className="text-right tabular-nums">{n}</TableCell>
                      <TableCell className="text-right font-bold tabular-nums">{formatPrice(recebido)}</TableCell>
                      <TableCell className="pr-4 text-right tabular-nums">{formatPrice(aplicado)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="lancamentos" className="mt-4">
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="hidden md:table-cell">Categoria / origem</TableHead>
                    <TableHead className="pr-4 text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lancamentos.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="pl-4 tabular-nums">{formatDate(l.data)}</TableCell>
                      <TableCell className="max-w-[20rem]">
                        <Link href={l.href} className="block truncate font-semibold hover:underline">
                          {l.descricao}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">{l.quem}</p>
                      </TableCell>
                      <TableCell className="hidden text-sm md:table-cell">{l.classe}</TableCell>
                      <TableCell className="pr-4 text-right font-bold tabular-nums">
                        <span className="mr-1.5 inline-block size-2 rounded-full" style={{ background: l.valor >= 0 ? COR_ENTROU : COR_SAIU }} />
                        {l.valor >= 0 ? "+" : "−"} {formatPrice(Math.abs(l.valor))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 border-t px-4 py-2.5 text-sm">
                <span>
                  Entrou <b className="tabular-nums">{formatPrice(entrou)}</b>
                </span>
                <span>
                  Saiu <b className="tabular-nums">{formatPrice(saiu)}</b>
                </span>
                <span>
                  Saldo <b className="tabular-nums">{formatPrice(entrou - saiu)}</b>
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
