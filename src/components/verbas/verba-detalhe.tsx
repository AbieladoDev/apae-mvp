"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteAction, DetailRow, DetailSection, EditAction } from "@/components/common/detail-view"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { AuditTimeline } from "@/components/audit/audit-timeline"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BarraUso, FaixaIndicadores, Guard, NaoEncontrado, SituacaoContaBadge } from "@/components/apae/comum"
import { Ficha, Identidade, LinhaInfo, SeloGrande } from "@/components/apae/ficha"
import { COR_CATEGORIA, TIPO_VERBA_LABEL } from "@/data/catalogo"
import { resumoVerba, somaCents } from "@/lib/derivados"
import { formatDate, formatPrice } from "@/lib/format"
import { MODULOS } from "@/lib/modulos"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"

export function VerbaDetalhe({ id }: { id: string }) {
  return (
    <Guard permissao="financeiro.ler" titulo="Verba">
      <Conteudo id={id} />
    </Guard>
  )
}

function Conteudo({ id }: { id: string }) {
  const router = useRouter()
  const d = useDemo()
  const podeEditar = usePode("financeiro.editar")
  const [removendo, setRemovendo] = React.useState(false)
  const v = d.verbas.find((x) => x.id === id)
  if (!v) return <NaoEncontrado titulo="Verba" voltar="/painel/verbas" />

  const r = resumoVerba(v, d.contasPagar, d.contasReceber)
  const ap = d.apoiadores.find((a) => a.id === v.apoiadorId)
  const gastos = d.contasPagar.filter((c) => c.verbaId === id).sort((a, b) => b.vencimento.localeCompare(a.vencimento))
  const entradas = d.contasReceber.filter((c) => c.verbaId === id).sort((a, b) => b.vencimento.localeCompare(a.vencimento))
  const bens = d.bens.filter((b) => b.verbaId === id)
  const prestadores = d.prestadores.filter((p) => p.verbaId === id)
  const historico = d.auditoria.filter((a) => a.entidade === "verba" && a.entidadeId === id)

  const porCategoria = Object.entries(
    gastos.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.categoria]: (acc[c.categoria] ?? 0) + c.valorCents }), {})
  ).sort((a, b) => b[1] - a[1])
  const maior = porCategoria[0]?.[1] ?? 1
  const temVinculo = gastos.length + entradas.length + bens.length > 0

  return (
    <DashboardLayout title={v.nome} trilhaApenas>
      <Ficha
        identidade={
          <Identidade
            selo={<SeloGrande icone={MODULOS.verbas.icone} classe={MODULOS.verbas.selo} />}
            titulo={v.nome}
            subtitulo={ap?.nome}
            badges={<span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">{TIPO_VERBA_LABEL[v.tipo]}</span>}
            destaque={formatPrice(r.saldoCents)}
            destaqueRotulo="Saldo disponível"
            acoes={podeEditar && <EditAction href={`/painel/verbas/${v.id}/edicao`} variant="outline" />}
          >
            <div>
              <BarraUso gasto={r.gastoCents} comprometido={r.comprometidoCents} total={v.valorCents} />
              <p className="mt-1.5 text-xs text-muted-foreground">{r.usoPct}% do valor aprovado já tem destino</p>
            </div>
            <div>
              <LinhaInfo rotulo="Aprovado">{formatPrice(v.valorCents)}</LinhaInfo>
              <LinhaInfo rotulo="Período">
                {formatDate(v.inicio)} a {formatDate(v.fim)}
              </LinhaInfo>
            </div>
          </Identidade>
        }
        abas={[
          {
            valor: "resumo",
            rotulo: "Resumo",
            conteudo: (
              <>
                <FaixaIndicadores
                  itens={[
                    { rotulo: "Recebido", valor: formatPrice(r.recebidoCents), detalhe: `falta ${formatPrice(r.aReceberCents)}`, cor: "bg-emerald-500" },
                    { rotulo: "Gasto (pago)", valor: formatPrice(r.gastoCents), cor: "bg-amber-400" },
                    { rotulo: "A pagar", valor: formatPrice(r.comprometidoCents), cor: "bg-amber-200" },
                    { rotulo: "Saldo", valor: formatPrice(r.saldoCents), cor: "bg-blue-500" },
                  ]}
                />
                <div className="rounded-2xl border bg-card p-5">
                  <p className="font-bold">Onde a verba foi usada</p>
                  <p className="text-sm text-muted-foreground">Gastos pagos e a pagar, por categoria.</p>
                  {porCategoria.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">Nenhuma conta usa esta verba ainda.</p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {porCategoria.map(([cat, valor]) => (
                        <li key={cat}>
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">{cat}</span>
                            <span className="tabular-nums">{formatPrice(valor)}</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-muted">
                            <div className="h-2 rounded-full" style={{ width: `${(valor / maior) * 100}%`, background: COR_CATEGORIA[cat]?.hex ?? "#94a3b8" }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <DetailSection title="Sobre a verba">
                  <DetailRow label="Apoiador">{ap?.nome ?? "—"}</DetailRow>
                  <DetailRow label="Para que serve">{v.descricao || "—"}</DetailRow>
                  <DetailRow label="Bens adquiridos com ela">{bens.length}</DetailRow>
                  <DetailRow label="Prestadores pagos por ela">{prestadores.map((p) => p.nome).join(", ") || "—"}</DetailRow>
                </DetailSection>
              </>
            ),
          },
          {
            valor: "gastos",
            rotulo: "Gastos",
            contagem: gastos.length,
            conteudo: (
              <TabelaContas
                linhas={gastos.map((c) => ({ id: c.id, href: `/painel/contas-a-pagar/${c.id}`, descricao: c.descricao, sub: c.fornecedor, vencimento: c.vencimento, valor: c.valorCents, conta: { vencimento: c.vencimento, pagoEm: c.pagoEm } }))}
                tipo="pagar"
                total={somaCents(gastos, (c) => c.valorCents)}
              />
            ),
          },
          {
            valor: "entradas",
            rotulo: "Entradas",
            contagem: entradas.length,
            conteudo: (
              <TabelaContas
                linhas={entradas.map((c) => ({ id: c.id, href: `/painel/contas-a-receber/${c.id}`, descricao: c.descricao, sub: c.pagador, vencimento: c.vencimento, valor: c.valorCents, conta: { vencimento: c.vencimento, recebidoEm: c.recebidoEm } }))}
                tipo="receber"
                total={somaCents(entradas, (c) => c.valorCents)}
              />
            ),
          },
          {
            valor: "bens",
            rotulo: "Bens",
            contagem: bens.length,
            conteudo:
              bens.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum bem do patrimônio foi adquirido com esta verba.</p>
              ) : (
                <ul className="divide-y rounded-2xl border bg-card">
                  {bens.map((b) => (
                    <li key={b.id}>
                      <Link href={`/painel/patrimonio/${b.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40">
                        <span>
                          <span className="block text-sm font-bold">{b.nome}</span>
                          <span className="block text-xs text-muted-foreground">
                            {b.plaqueta} · {b.setor}
                          </span>
                        </span>
                        <span className="text-sm font-bold tabular-nums">{formatPrice(b.valorCents)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ),
          },
          { valor: "historico", rotulo: "Histórico", contagem: historico.length, conteudo: <AuditTimeline entries={historico} semLink vazio="Sem alterações registradas nesta verba." /> },
        ]}
      />
      {podeEditar && (
        <div className="mt-6 flex justify-end">
          <DeleteAction onClick={() => setRemovendo(true)} label="Remover verba" />
        </div>
      )}
      <ConfirmDeleteDialog
        open={removendo}
        onOpenChange={setRemovendo}
        title="Remover verba?"
        description={`"${v.nome}" sai da lista de verbas.`}
        blockedReason={temVinculo ? "Há contas ou bens ligados a esta verba. Desvincule-os antes de remover — a prestação de contas depende deles." : undefined}
        onConfirm={() => {
          d.removerVerba(v.id)
          toast.success("Verba removida")
          router.push("/painel/verbas")
        }}
      />
    </DashboardLayout>
  )
}

function TabelaContas({
  linhas,
  tipo,
  total,
}: {
  linhas: { id: string; href: string; descricao: string; sub: string; vencimento: string; valor: number; conta: { vencimento: string; pagoEm?: string; recebidoEm?: string } }[]
  tipo: "pagar" | "receber"
  total: number
}) {
  const router = useRouter()
  if (linhas.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma conta ligada a esta verba.</p>
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Descrição</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="pr-4">Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map((l) => (
            <TableRow key={l.id} className="cursor-pointer" onClick={() => router.push(l.href)}>
              <TableCell className="max-w-[20rem] pl-4">
                <p className="truncate font-semibold">{l.descricao}</p>
                <p className="truncate text-xs text-muted-foreground">{l.sub}</p>
              </TableCell>
              <TableCell className="tabular-nums">{formatDate(l.vencimento)}</TableCell>
              <TableCell className="text-right font-bold tabular-nums">{formatPrice(l.valor)}</TableCell>
              <TableCell className="pr-4">
                <SituacaoContaBadge conta={l.conta} tipo={tipo} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="border-t px-4 py-2.5 text-right text-sm">
        Total <span className="ml-1 font-extrabold tabular-nums">{formatPrice(total)}</span>
      </p>
    </div>
  )
}
