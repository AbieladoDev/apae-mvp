"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeftRight, ArrowRight, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeleteAction, DetailRow, DetailSection, EditAction } from "@/components/common/detail-view"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { AuditTimeline } from "@/components/audit/audit-timeline"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, NaoEncontrado } from "@/components/apae/comum"
import { Ficha, Identidade, LinhaInfo, SeloGrande } from "@/components/apae/ficha"
import { SETORES } from "@/data/catalogo"
import type { Bem } from "@/data/tipos"
import { haQuantoTempo } from "@/lib/tempo-relativo"
import { formatDate, formatPrice } from "@/lib/format"
import { MODULOS } from "@/lib/modulos"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"
import { EstadoBemBadge, OrigemBemBadge } from "./patrimonio-comum"

export function BemDetalhe({ id }: { id: string }) {
  return (
    <Guard permissao="patrimonio.ler" titulo="Patrimônio">
      <Conteudo id={id} />
    </Guard>
  )
}

function Conteudo({ id }: { id: string }) {
  const router = useRouter()
  const d = useDemo()
  const podeEditar = usePode("patrimonio.editar")
  const [transferindo, setTransferindo] = React.useState(false)
  const [removendo, setRemovendo] = React.useState(false)
  const b = d.bens.find((x) => x.id === id)
  if (!b) return <NaoEncontrado titulo="Patrimônio" voltar="/painel/patrimonio" />

  const verba = d.verbas.find((v) => v.id === b.verbaId)
  const apoiador = d.apoiadores.find((a) => a.id === b.apoiadorId)
  const compra = d.compras.find((c) => c.id === b.compraId)
  const historico = d.auditoria.filter((a) => a.entidade === "bem" && a.entidadeId === id)

  return (
    <DashboardLayout title={`${b.plaqueta} · ${b.nome}`} trilhaApenas>
      <Ficha
        identidade={
          <Identidade
            selo={<SeloGrande icone={MODULOS.patrimonio.icone} classe={MODULOS.patrimonio.selo} />}
            titulo={b.nome}
            subtitulo={<span className="font-bold text-violet-700">{b.plaqueta}</span>}
            badges={
              <>
                <EstadoBemBadge estado={b.estado} />
                <OrigemBemBadge origem={b.origem} />
              </>
            }
            destaque={formatPrice(b.valorCents)}
            destaqueRotulo={`Adquirido ${haQuantoTempo(b.aquisicao)}`}
            acoes={
              <>
                {podeEditar && (
                  <Button size="sm" onClick={() => setTransferindo(true)}>
                    <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                    Transferir
                  </Button>
                )}
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/painel/patrimonio/${b.id}/etiqueta`}>
                    <Printer className="mr-1.5 h-3.5 w-3.5" />
                    Etiqueta e termo
                  </Link>
                </Button>
              </>
            }
          >
            <div>
              <LinhaInfo rotulo="Setor">{b.setor}</LinhaInfo>
              <LinhaInfo rotulo="Responsável">{b.responsavel}</LinhaInfo>
              <LinhaInfo rotulo="Categoria">{b.categoria}</LinhaInfo>
            </div>
          </Identidade>
        }
        abas={[
          {
            valor: "resumo",
            rotulo: "Resumo",
            conteudo: (
              <>
                <DetailSection title="Dados do bem" action={podeEditar && <EditAction href={`/painel/patrimonio/${b.id}/edicao`} variant="outline" />}>
                  <DetailRow label="Plaqueta">{b.plaqueta}</DetailRow>
                  <DetailRow label="Descrição">{b.descricao || "—"}</DetailRow>
                  <DetailRow label="Aquisição">{formatDate(b.aquisicao)}</DetailRow>
                  <DetailRow label="Nota fiscal / termo">{b.notaFiscal || "—"}</DetailRow>
                </DetailSection>
                <DetailSection title="Origem" description="Por onde este bem entrou na APAE.">
                  <DetailRow label="Como veio">
                    <OrigemBemBadge origem={b.origem} />
                  </DetailRow>
                  {verba && (
                    <DetailRow label="Verba">
                      <Link className="text-primary hover:underline" href={`/painel/verbas/${verba.id}`}>
                        {verba.nome}
                      </Link>
                    </DetailRow>
                  )}
                  <DetailRow label="Apoiador">{apoiador?.nome ?? "—"}</DetailRow>
                  {compra && (
                    <DetailRow label="Compra">
                      <Link className="text-primary hover:underline" href={`/painel/compras/${compra.id}`}>
                        {compra.codigo}
                      </Link>
                    </DetailRow>
                  )}
                </DetailSection>
              </>
            ),
          },
          {
            valor: "movs",
            rotulo: "Movimentações",
            contagem: b.movimentacoes.length,
            conteudo:
              b.movimentacoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Este bem nunca mudou de setor desde o cadastro.</p>
              ) : (
                <ol className="space-y-3">
                  {b.movimentacoes.map((m) => (
                    <li key={m.id} className="rounded-2xl border bg-card p-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
                        <span>{m.deSetor}</span>
                        <ArrowRight className="size-4 text-violet-500" />
                        <span>{m.paraSetor}</span>
                        <span className="ml-auto text-xs font-normal tabular-nums text-muted-foreground">{formatDate(m.data)}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Responsável: {m.deResponsavel} → <span className="font-semibold text-foreground">{m.paraResponsavel}</span>
                      </p>
                      <p className="mt-1 text-sm">{m.motivo}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Registrado por {m.por}</p>
                    </li>
                  ))}
                </ol>
              ),
          },
          { valor: "historico", rotulo: "Histórico", contagem: historico.length, conteudo: <AuditTimeline entries={historico} semLink /> },
        ]}
      />
      {podeEditar && (
        <div className="mt-6 flex justify-end">
          <DeleteAction onClick={() => setRemovendo(true)} label="Remover bem" />
        </div>
      )}
      <DialogoTransferir bem={transferindo ? b : null} onClose={() => setTransferindo(false)} />
      <ConfirmDeleteDialog
        open={removendo}
        onOpenChange={setRemovendo}
        title="Remover bem do patrimônio?"
        description={`${b.plaqueta} · ${b.nome} sai da lista. Se o bem quebrou ou foi doado, registre isso na descrição antes.`}
        onConfirm={() => {
          d.removerBem(b.id)
          toast.success("Bem removido")
          router.push("/painel/patrimonio")
        }}
      />
    </DashboardLayout>
  )
}

function DialogoTransferir({ bem, onClose }: { bem: Bem | null; onClose: () => void }) {
  const transferir = useDemo((s) => s.transferirBem)
  const [setor, setSetor] = React.useState("")
  const [responsavel, setResponsavel] = React.useState("")
  const [motivo, setMotivo] = React.useState("")
  React.useEffect(() => {
    if (!bem) return
    setSetor(bem.setor)
    setResponsavel(bem.responsavel)
    setMotivo("")
  }, [bem])
  const mudou = bem && (setor !== bem.setor || responsavel !== bem.responsavel)
  return (
    <Dialog open={!!bem} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transferir {bem?.plaqueta}</DialogTitle>
          <DialogDescription>Hoje em {bem?.setor}, com {bem?.responsavel}. A mudança fica registrada nas movimentações do bem.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>Novo setor</Label>
            <Select value={setor} onValueChange={setSetor}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SETORES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Novo responsável</Label>
            <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Motivo</Label>
            <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: sala nova da fisioterapia" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!mudou || !responsavel.trim()}
            onClick={() => {
              if (!bem) return
              transferir(bem.id, setor, responsavel.trim(), motivo || "Transferência")
              toast.success(`Transferido para ${setor}`)
              onClose()
            }}
          >
            Transferir bem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
