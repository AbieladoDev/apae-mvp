"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowDownToLine, ArrowUpFromLine, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { DeleteAction } from "@/components/common/detail-view"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { AuditTimeline } from "@/components/audit/audit-timeline"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, NaoEncontrado } from "@/components/apae/comum"
import { Ficha, Identidade, LinhaInfo, SeloGrande } from "@/components/apae/ficha"
import { DialogoItem, DialogoMovimento } from "@/components/estoque/dialogos-estoque"
import { ESTOQUE_LABEL, ESTOQUE_TOM, situacaoEstoque } from "@/lib/derivados"
import { formatDate } from "@/lib/format"
import { MODULOS } from "@/lib/modulos"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return (
    <Guard permissao="estoque.ler" titulo="Estoque">
      <Item id={id} />
    </Guard>
  )
}

function Item({ id }: { id: string }) {
  const router = useRouter()
  const d = useDemo()
  const podeEditar = usePode("estoque.editar")
  const podeSaida = usePode("estoque.saida")
  const [mov, setMov] = React.useState<"entrada" | "saida" | null>(null)
  const [editando, setEditando] = React.useState(false)
  const [removendo, setRemovendo] = React.useState(false)
  const item = d.itensEstoque.find((i) => i.id === id)
  if (!item) return <NaoEncontrado titulo="Estoque" voltar="/painel/estoque" />

  const s = situacaoEstoque(item)
  const movs = d.movsEstoque.filter((m) => m.itemId === id)
  const historico = d.auditoria.filter((a) => a.entidade === "estoque" && a.entidadeId === id)
  const porSetor = Object.entries(
    movs.filter((m) => m.tipo === "saida").reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.setor ?? "—"]: (acc[m.setor ?? "—"] ?? 0) + m.quantidade }), {})
  ).sort((a, b) => b[1] - a[1])
  const maior = porSetor[0]?.[1] ?? 1

  return (
    <DashboardLayout title={item.nome} trilhaApenas>
      <Ficha
        identidade={
          <Identidade
            selo={<SeloGrande icone={MODULOS.estoque.icone} classe={MODULOS.estoque.selo} />}
            titulo={item.nome}
            subtitulo={`${item.categoria} · ${item.local}`}
            badges={<StatusBadge tom={ESTOQUE_TOM[s]}>{ESTOQUE_LABEL[s]}</StatusBadge>}
            destaque={`${item.quantidade} ${item.unidade}`}
            destaqueRotulo="Em estoque agora"
            acoes={
              <>
                {podeSaida && (
                  <Button size="sm" onClick={() => setMov("saida")}>
                    <ArrowUpFromLine className="mr-1.5 h-3.5 w-3.5" />
                    Retirar
                  </Button>
                )}
                {podeEditar && (
                  <Button size="sm" variant="outline" onClick={() => setMov("entrada")}>
                    <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5" />
                    Dar entrada
                  </Button>
                )}
              </>
            }
          >
            <div>
              <LinhaInfo rotulo="Mínimo">
                {item.minimo} {item.unidade}
              </LinhaInfo>
              <LinhaInfo rotulo="Movimentações">{movs.length}</LinhaInfo>
            </div>
            {podeEditar && (
              <Button size="sm" variant="ghost" onClick={() => setEditando(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Editar item
              </Button>
            )}
          </Identidade>
        }
        abas={[
          {
            valor: "movs",
            rotulo: "Movimentações",
            contagem: movs.length,
            conteudo:
              movs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4">Data</TableHead>
                        <TableHead>Movimento</TableHead>
                        <TableHead>Setor · quem</TableHead>
                        <TableHead className="pr-4">Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movs.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="pl-4 tabular-nums">{formatDate(m.data)}</TableCell>
                          <TableCell>
                            <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold", m.tipo === "entrada" ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-800")}>
                              {m.tipo === "entrada" ? "+" : "−"}
                              {m.quantidade} {item.unidade}
                            </span>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-semibold">{m.setor ?? "Entrada"}</p>
                            <p className="text-xs text-muted-foreground">{m.responsavel}</p>
                          </TableCell>
                          <TableCell className="pr-4 text-sm">
                            {m.compraId ? (
                              <Link href={`/painel/compras/${m.compraId}`} className="text-primary hover:underline">
                                {m.motivo}
                              </Link>
                            ) : (
                              m.motivo
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ),
          },
          {
            valor: "setores",
            rotulo: "Consumo por setor",
            conteudo:
              porSetor.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma saída registrada.</p>
              ) : (
                <div className="rounded-2xl border bg-card p-5">
                  <p className="font-bold">Quem mais usa este item</p>
                  <ul className="mt-4 space-y-3">
                    {porSetor.map(([setor, q]) => (
                      <li key={setor}>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">{setor}</span>
                          <span className="tabular-nums">
                            {q} {item.unidade}
                          </span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-teal-500" style={{ width: `${(q / maior) * 100}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
          },
          { valor: "historico", rotulo: "Histórico", contagem: historico.length, conteudo: <AuditTimeline entries={historico} semLink /> },
        ]}
      />
      {podeEditar && (
        <div className="mt-6 flex justify-end">
          <DeleteAction onClick={() => setRemovendo(true)} label="Remover item" />
        </div>
      )}
      <DialogoMovimento aberto={!!mov} onOpenChange={(v) => !v && setMov(null)} itemInicial={item.id} tipoInicial={mov ?? "saida"} />
      <DialogoItem alvo={editando ? item : null} onClose={() => setEditando(false)} />
      <ConfirmDeleteDialog
        open={removendo}
        onOpenChange={setRemovendo}
        title="Remover item do estoque?"
        description={`"${item.nome}" e suas movimentações deixam de aparecer na lista.`}
        onConfirm={() => {
          d.removerItemEstoque(item.id)
          toast.success("Item removido")
          router.push("/painel/estoque")
        }}
      />
    </DashboardLayout>
  )
}
