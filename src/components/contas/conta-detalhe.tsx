"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, ShoppingCart, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DetailRow, DetailSection, DeleteAction, EditAction } from "@/components/common/detail-view"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { AuditTimeline } from "@/components/audit/audit-timeline"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BarraUso, Guard, NaoEncontrado, SituacaoContaBadge } from "@/components/apae/comum"
import { Ficha, Identidade, LinhaInfo, SeloGrande } from "@/components/apae/ficha"
import { FORMA_LABEL } from "@/data/catalogo"
import { resumoVerba } from "@/lib/derivados"
import { formatDate, formatPrice } from "@/lib/format"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"
import { DialogoQuitar } from "./dialogo-quitar"
import { TIPO, useContas, type TipoConta } from "./tipo-conta"

export function ContaDetalhe({ tipo, id }: { tipo: TipoConta; id: string }) {
  return (
    <Guard permissao="financeiro.ler" titulo={TIPO[tipo].titulo}>
      <Conteudo tipo={tipo} id={id} />
    </Guard>
  )
}

function Conteudo({ tipo, id }: { tipo: TipoConta; id: string }) {
  const t = TIPO[tipo]
  const router = useRouter()
  const { lista, remover, quitar, desfazer } = useContas(tipo)
  const d = useDemo()
  const podeEditar = usePode("financeiro.editar")
  const [quitando, setQuitando] = React.useState(false)
  const [removendo, setRemovendo] = React.useState(false)
  const c = lista.find((x) => x.id === id)
  if (!c) return <NaoEncontrado titulo={t.titulo} voltar={t.base} />

  const verba = d.verbas.find((v) => v.id === c.verbaId)
  const rv = verba ? resumoVerba(verba, d.contasPagar, d.contasReceber) : null
  const apoiador = d.apoiadores.find((a) => a.id === (verba?.apoiadorId ?? c.apoiadorId))
  const compra = d.compras.find((x) => x.id === c.compraId)
  const prestador = d.prestadores.find((p) => p.id === c.prestadorId)
  const historico = d.auditoria.filter((a) => a.entidade === (tipo === "pagar" ? "conta_pagar" : "conta_receber") && a.entidadeId === id)

  return (
    <DashboardLayout title={c.descricao} trilhaApenas>
      <Ficha
        identidade={
          <Identidade
            selo={<SeloGrande icone={t.modulo.icone} classe={t.modulo.selo} />}
            titulo={c.descricao}
            subtitulo={c.contraparte || "—"}
            badges={<SituacaoContaBadge conta={{ vencimento: c.vencimento, pagoEm: c.quitadoEm }} tipo={tipo} />}
            destaque={formatPrice(c.valorCents)}
            destaqueRotulo={`Vence em ${formatDate(c.vencimento)}`}
            acoes={
              podeEditar && (
                <>
                  {c.quitadoEm ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        desfazer(c.id)
                        toast.success("A conta voltou para em aberto")
                      }}
                    >
                      <Undo2 className="mr-1.5 h-3.5 w-3.5" />
                      {t.desfazer}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setQuitando(true)}>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      {t.quitar}
                    </Button>
                  )}
                  <EditAction href={`${t.base}/${c.id}/edicao`} variant="outline" />
                </>
              )
            }
          >
            <div>
              <LinhaInfo rotulo={t.classeRotulo}>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: t.corClasse(c.classe) }} />
                  {c.classe}
                </span>
              </LinhaInfo>
              <LinhaInfo rotulo="Forma">{c.forma ? FORMA_LABEL[c.forma] : "—"}</LinhaInfo>
              {c.quitadoEm && <LinhaInfo rotulo={t.quitadoEm}>{formatDate(c.quitadoEm)}</LinhaInfo>}
            </div>
          </Identidade>
        }
        abas={[
          {
            valor: "resumo",
            rotulo: "Resumo",
            conteudo: (
              <>
                {compra && (
                  <Link href={`/painel/compras/${compra.id}`} className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 transition-colors hover:bg-orange-100">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                      <ShoppingCart className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">Esta conta veio da compra {compra.codigo}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        Pedida por {compra.solicitanteNome} ({compra.setor}) · aprovada por {compra.aprovadoPor} · comprada por {compra.compradoPor}
                      </span>
                    </span>
                  </Link>
                )}
                <DetailSection title="Dados da conta">
                  <DetailRow label="Descrição">{c.descricao}</DetailRow>
                  <DetailRow label={t.contraparteRotulo}>
                    {prestador ? (
                      <Link className="text-primary hover:underline" href={`/painel/prestadores/${prestador.id}`}>
                        {prestador.nome}
                      </Link>
                    ) : (
                      c.contraparte || "—"
                    )}
                  </DetailRow>
                  <DetailRow label="Valor">{formatPrice(c.valorCents)}</DetailRow>
                  <DetailRow label={tipo === "pagar" ? "Vencimento" : "Data prevista"}>{formatDate(c.vencimento)}</DetailRow>
                  <DetailRow label="Lançada em">{formatDate(c.criadoEm)}</DetailRow>
                  {c.observacoes && <DetailRow label="Observações">{c.observacoes}</DetailRow>}
                </DetailSection>
                <DetailSection title="Verba e apoiador" description={verba ? "Esta conta entra na prestação de contas desta verba." : "Esta conta não está ligada a nenhuma verba."}>
                  <DetailRow label="Usa verba">{verba ? "Sim" : "Não"}</DetailRow>
                  {verba && (
                    <DetailRow label="Verba">
                      <Link className="text-primary hover:underline" href={`/painel/verbas/${verba.id}`}>
                        {verba.nome}
                      </Link>
                    </DetailRow>
                  )}
                  <DetailRow label="Apoiador">{apoiador?.nome ?? "—"}</DetailRow>
                </DetailSection>
                {verba && rv && (
                  <div className="rounded-2xl border bg-card p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-bold">Como está a verba</p>
                      <p className="text-sm tabular-nums text-muted-foreground">{rv.usoPct}% usado</p>
                    </div>
                    <BarraUso className="mt-2" gasto={rv.gastoCents} comprometido={rv.comprometidoCents} total={verba.valorCents} />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Saldo de <span className="font-bold text-foreground">{formatPrice(rv.saldoCents)}</span> de {formatPrice(verba.valorCents)}.
                    </p>
                  </div>
                )}
              </>
            ),
          },
          {
            valor: "historico",
            rotulo: "Histórico",
            contagem: historico.length,
            conteudo: <AuditTimeline entries={historico} semLink vazio="Esta conta ainda não teve alterações registradas." />,
          },
        ]}
      />
      {podeEditar && (
        <div className="mt-6 flex justify-end">
          <DeleteAction onClick={() => setRemovendo(true)} label="Remover conta" />
        </div>
      )}

      <DialogoQuitar tipo={tipo} conta={quitando ? c : null} onOpenChange={setQuitando} onConfirmar={(dt, f) => quitar(c.id, dt, f)} />
      <ConfirmDeleteDialog
        open={removendo}
        onOpenChange={setRemovendo}
        title={`Remover ${t.singular}?`}
        description={`"${c.descricao}" sai da lista e da prestação de contas.`}
        onConfirm={() => {
          remover(c.id)
          toast.success("Conta removida")
          router.push(t.base)
        }}
      />
    </DashboardLayout>
  )
}
