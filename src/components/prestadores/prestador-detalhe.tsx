"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Mail, Phone } from "lucide-react"

import { DeleteAction, DetailRow, DetailSection, EditAction } from "@/components/common/detail-view"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { AuditTimeline } from "@/components/audit/audit-timeline"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, NaoEncontrado } from "@/components/apae/comum"
import { Ficha, Identidade, LinhaInfo } from "@/components/apae/ficha"
import { DIAS_SEMANA_LONGO } from "@/data/catalogo"
import { formatDate, formatPrice, getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"
import { COR_AREA, TipoPrestadorBadge } from "./prestadores-comum"

export function PrestadorDetalhe({ id }: { id: string }) {
  return (
    <Guard permissao="prestadores.ler" titulo="Prestador">
      <Conteudo id={id} />
    </Guard>
  )
}

function Conteudo({ id }: { id: string }) {
  const router = useRouter()
  const d = useDemo()
  const podeEditar = usePode("prestadores.editar")
  const [removendo, setRemovendo] = React.useState(false)
  const p = d.prestadores.find((x) => x.id === id)
  if (!p) return <NaoEncontrado titulo="Prestador" voltar="/painel/prestadores" />

  const verba = d.verbas.find((v) => v.id === p.verbaId)
  const historico = d.auditoria.filter((a) => a.entidade === "prestador" && a.entidadeId === id)
  const hojeDia = new Date().getDay()
  const horasSemana = p.dias.reduce((t, x) => {
    const [h1, m1] = x.inicio.split(":").map(Number)
    const [h2, m2] = x.fim.split(":").map(Number)
    return t + (h2 * 60 + m2 - h1 * 60 - m1) / 60
  }, 0)

  return (
    <DashboardLayout title={p.nome} trilhaApenas>
      <Ficha
        identidade={
          <Identidade
            selo={<span className={cn("flex size-12 items-center justify-center rounded-2xl text-base font-extrabold", COR_AREA[p.area] ?? "bg-muted")}>{getInitials(p.nome)}</span>}
            titulo={p.nome}
            subtitulo={p.area}
            badges={<TipoPrestadorBadge tipo={p.tipo} />}
            destaque={p.valorMensalCents ? formatPrice(p.valorMensalCents) : undefined}
            destaqueRotulo="Valor mensal"
            acoes={podeEditar && <EditAction href={`/painel/prestadores/${p.id}/edicao`} variant="outline" />}
          >
            <div className="space-y-1.5 text-sm">
              {p.telefone && (
                <a href={`tel:${p.telefone.replace(/\D/g, "")}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="size-4" />
                  {p.telefone}
                </a>
              )}
              {p.email && (
                <a href={`mailto:${p.email}`} className="flex items-center gap-2 truncate text-primary hover:underline">
                  <Mail className="size-4" />
                  {p.email}
                </a>
              )}
            </div>
            <div>
              <LinhaInfo rotulo="Documento">{p.documento || "—"}</LinhaInfo>
              <LinhaInfo rotulo="Na casa">{p.dias.length ? `${horasSemana.toLocaleString("pt-BR")} h/semana` : "Sob demanda"}</LinhaInfo>
            </div>
          </Identidade>
        }
        abas={[
          {
            valor: "agenda",
            rotulo: "Na casa",
            conteudo: (
              <>
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-sm font-bold">O que faz aqui</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.descricao || "—"}</p>
                </div>
                {p.dias.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem horário fixo — atende quando chamado.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    {DIAS_SEMANA_LONGO.map((nome, i) => {
                      const doDia = p.dias.filter((x) => x.dia === i)
                      return (
                        <div key={nome} className={cn("min-h-24 rounded-xl border p-2.5", doDia.length ? "bg-pink-50 border-pink-200" : "bg-card", i === hojeDia && "ring-2 ring-girassol")}>
                          <p className={cn("text-xs font-bold", !doDia.length && "text-muted-foreground")}>
                            {nome}
                            {i === hojeDia && <span className="ml-1 font-normal text-amber-700">hoje</span>}
                          </p>
                          {doDia.map((x) => (
                            <div key={x.inicio} className="mt-1.5 rounded-lg bg-pink-500 px-2 py-1 text-white">
                              <p className="text-xs font-bold tabular-nums">
                                {x.inicio}–{x.fim}
                              </p>
                              <p className="truncate text-[11px] text-white/85">{x.setor}</p>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ),
          },
          {
            valor: "contrato",
            rotulo: "Contrato",
            conteudo: (
              <DetailSection title="Vínculo com a APAE">
                <DetailRow label="Tipo">
                  <TipoPrestadorBadge tipo={p.tipo} />
                </DetailRow>
                <DetailRow label="Valor mensal">{p.valorMensalCents ? formatPrice(p.valorMensalCents) : "Sem custo para a APAE"}</DetailRow>
                <DetailRow label="Vigência">
                  {formatDate(p.vigenciaInicio)} a {formatDate(p.vigenciaFim)}
                </DetailRow>
                <DetailRow label="Pago por verba">
                  {verba ? (
                    <Link className="text-primary hover:underline" href={`/painel/verbas/${verba.id}`}>
                      {verba.nome}
                    </Link>
                  ) : (
                    "Não"
                  )}
                </DetailRow>
              </DetailSection>
            ),
          },
          { valor: "historico", rotulo: "Histórico", contagem: historico.length, conteudo: <AuditTimeline entries={historico} semLink /> },
        ]}
      />
      {podeEditar && (
        <div className="mt-6 flex justify-end">
          <DeleteAction onClick={() => setRemovendo(true)} label="Remover prestador" />
        </div>
      )}
      <ConfirmDeleteDialog
        open={removendo}
        onOpenChange={setRemovendo}
        title="Remover prestador?"
        description={`${p.nome} sai da lista de prestadores.`}
        onConfirm={() => {
          d.removerPrestador(p.id)
          toast.success("Prestador removido")
          router.push("/painel/prestadores")
        }}
      />
    </DashboardLayout>
  )
}
