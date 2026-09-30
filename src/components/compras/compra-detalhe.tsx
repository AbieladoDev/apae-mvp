"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Ban, CheckCircle2, Landmark, ShoppingBag, ThumbsDown, ThumbsUp, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/ui/currency-input"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { DetailRow, DetailSection } from "@/components/common/detail-view"
import { AuditTimeline } from "@/components/audit/audit-timeline"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, NaoEncontrado, SeletorVerba, campoParaCents, centsParaCampo } from "@/components/apae/comum"
import { Ficha, Identidade, LinhaInfo, SeloGrande } from "@/components/apae/ficha"
import { CATEGORIAS_DESPESA, DESTINO_LABEL, FORMA_LABEL, URGENCIA_LABEL } from "@/data/catalogo"
import type { Compra, FormaPagamento } from "@/data/tipos"
import { dataISO, hoje, somarDias } from "@/lib/datas"
import { formatDate, formatDateTime, formatPrice } from "@/lib/format"
import { MODULOS } from "@/lib/modulos"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { usePode, useSessao } from "@/store/sessao-store"
import { CaminhoCompra, StatusCompraBadge, UrgenciaBadge, resumoItens, totalEstimado } from "./compras-comum"

export function CompraDetalhe({ id }: { id: string }) {
  return (
    <Guard permissao="compras.solicitar" titulo="Compra">
      <Conteudo id={id} />
    </Guard>
  )
}

/** Categoria sugerida para a conta a pagar, pelo setor que pediu. */
const CATEGORIA_DO_SETOR: Record<string, string> = {
  Cozinha: "Alimentação",
  Pedagogia: "Material pedagógico",
  "Saúde e terapias": "Saúde e terapias",
  Limpeza: "Limpeza e higiene",
  Transporte: "Transporte",
}

function Conteudo({ id }: { id: string }) {
  const d = useDemo()
  const perfil = useSessao((s) => s.perfil)
  const podeAprovar = usePode("compras.aprovar")
  const podeComprar = usePode("compras.comprar")
  const verTodas = usePode("compras.ver_todas")
  const [dialogo, setDialogo] = React.useState<"aprovar" | "recusar" | "comprar" | null>(null)
  const c = d.compras.find((x) => x.id === id)
  if (!c || (!verTodas && c.solicitante !== perfil)) return <NaoEncontrado titulo="Compra" voltar="/painel/compras" />

  const verba = d.verbas.find((v) => v.id === c.verbaId)
  const conta = d.contasPagar.find((x) => x.id === c.contaPagarId)
  const historico = d.auditoria.filter((a) => a.entidade === "compra" && a.entidadeId === id)
  const minha = c.solicitante === perfil

  const acoes = (
    <>
      {c.status === "solicitada" && podeAprovar && (
        <>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setDialogo("aprovar")}>
            <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
            Aprovar
          </Button>
          <Button size="sm" variant="outline" className="text-rose-600" onClick={() => setDialogo("recusar")}>
            <ThumbsDown className="mr-1.5 h-3.5 w-3.5" />
            Recusar
          </Button>
        </>
      )}
      {c.status === "aprovada" && podeComprar && (
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => setDialogo("comprar")}>
          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
          Marcar como comprada
        </Button>
      )}
      {c.status === "solicitada" && minha && (
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => {
            d.cancelarCompra(c.id)
            toast.success("Solicitação cancelada")
          }}
        >
          <Ban className="mr-1.5 h-3.5 w-3.5" />
          Cancelar pedido
        </Button>
      )}
    </>
  )

  return (
    <DashboardLayout title={`${c.codigo} · ${resumoItens(c)}`} trilhaApenas>
      <Ficha
        identidade={
          <Identidade
            selo={<SeloGrande icone={MODULOS.compras.icone} classe={MODULOS.compras.selo} />}
            titulo={`Compra ${c.codigo}`}
            subtitulo={`${c.setor} · ${c.solicitanteNome}`}
            badges={
              <>
                <StatusCompraBadge status={c.status} />
                <UrgenciaBadge urgencia={c.urgencia} />
              </>
            }
            destaque={formatPrice(c.valorRealCents ?? totalEstimado(c))}
            destaqueRotulo={c.valorRealCents ? "Valor pago" : "Valor estimado"}
            acoes={acoes}
          >
            <div>
              <LinhaInfo rotulo="Pedida em">{formatDateTime(c.criadoEm)}</LinhaInfo>
              <LinhaInfo rotulo="Verba">{verba ? <Link className="text-primary hover:underline" href={`/painel/verbas/${verba.id}`}>{verba.nome}</Link> : "Recurso próprio"}</LinhaInfo>
            </div>
          </Identidade>
        }
        abas={[
          {
            valor: "resumo",
            rotulo: "Andamento",
            conteudo: (
              <>
                <div className="overflow-x-auto rounded-2xl border bg-card p-5">
                  <CaminhoCompra compra={c} />
                </div>
                <ProximoPasso compra={c} podeAprovar={podeAprovar} podeComprar={podeComprar} />
                {c.status === "recusada" && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-bold text-rose-800">Recusada por {c.aprovadoPor}</p>
                    <p className="mt-1 text-sm text-rose-800/80">{c.motivoRecusa}</p>
                  </div>
                )}
                {c.status === "comprada" && (
                  <ResultadoCompra compra={c} contaId={conta?.id} />
                )}
                <DetailSection title="O pedido">
                  <DetailRow label="Por que precisa">{c.justificativa}</DetailRow>
                  <DetailRow label="Urgência">{URGENCIA_LABEL[c.urgencia]}</DetailRow>
                  {c.aprovadoPor && c.status !== "recusada" && <DetailRow label="Aprovada por">{`${c.aprovadoPor} em ${formatDateTime(c.aprovadoEm!)}`}</DetailRow>}
                  {c.compradoPor && <DetailRow label="Comprada por">{`${c.compradoPor} em ${formatDateTime(c.compradoEm!)}`}</DetailRow>}
                  {c.fornecedor && <DetailRow label="Fornecedor">{c.fornecedor}</DetailRow>}
                </DetailSection>
              </>
            ),
          },
          {
            valor: "itens",
            rotulo: "Itens",
            contagem: c.itens.length,
            conteudo: (
              <ul className="divide-y rounded-2xl border bg-card">
                {c.itens.map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{i.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.quantidade} {i.unidade} × {formatPrice(i.estimadoCents)} · {DESTINO_LABEL[i.destino]}
                      </p>
                    </div>
                    <p className="font-bold tabular-nums">{formatPrice(i.quantidade * i.estimadoCents)}</p>
                  </li>
                ))}
                <li className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Total estimado</span>
                  <span className="font-extrabold tabular-nums">{formatPrice(totalEstimado(c))}</span>
                </li>
              </ul>
            ),
          },
          { valor: "historico", rotulo: "Histórico", contagem: historico.length, conteudo: <AuditTimeline entries={historico} semLink vazio="Sem movimentações registradas." /> },
        ]}
      />

      <DialogoAprovar compra={dialogo === "aprovar" ? c : null} onClose={() => setDialogo(null)} />
      <DialogoRecusar compra={dialogo === "recusar" ? c : null} onClose={() => setDialogo(null)} />
      <DialogoComprar compra={dialogo === "comprar" ? c : null} onClose={() => setDialogo(null)} />
    </DashboardLayout>
  )
}

/** Uma frase dizendo com quem a compra está agora — a pergunta que todo mundo faz. */
function ProximoPasso({ compra: c, podeAprovar, podeComprar }: { compra: Compra; podeAprovar: boolean; podeComprar: boolean }) {
  const txt =
    c.status === "solicitada"
      ? podeAprovar
        ? "Esta solicitação espera a sua aprovação."
        : "Aguardando a direção aprovar. Você recebe um aviso quando ela decidir."
      : c.status === "aprovada"
        ? podeComprar
          ? "Aprovada. Depois de comprar, marque como comprada: a conta a pagar é criada e os itens de estoque dão entrada sozinhos."
          : "Aprovada — o setor de compras já foi avisado."
        : null
  if (!txt) return null
  return <p className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">{txt}</p>
}

function ResultadoCompra({ compra: c, contaId }: { compra: Compra; contaId?: string }) {
  const podeCadastrarBem = usePode("patrimonio.editar")
  const bens = useDemo((s) => s.bens)
  const estoque = c.itens.filter((i) => i.destino === "estoque")
  const patrimonio = c.itens.filter((i) => i.destino === "patrimonio")
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {contaId && (
        <Link href={`/painel/contas-a-pagar/${contaId}`} className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 hover:bg-rose-100">
          <span className="flex size-10 items-center justify-center rounded-xl bg-rose-500 text-white">
            <Wallet className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-bold">Conta a pagar criada</span>
            <span className="block text-xs text-muted-foreground">
              {c.fornecedor} · vence {c.vencimento && formatDate(c.vencimento)}
            </span>
          </span>
        </Link>
      )}
      {estoque.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-teal-500 text-white">
            <CheckCircle2 className="size-5" />
          </span>
          <span className="text-sm">
            <span className="block font-bold">Entrada no estoque feita</span>
            {estoque.map((i) => (
              <Link key={i.id} href={`/painel/estoque/${i.itemEstoqueId}`} className="block text-xs text-teal-800 hover:underline">
                +{i.quantidade} {i.unidade} · {i.descricao}
              </Link>
            ))}
          </span>
        </div>
      )}
      {patrimonio.map((i) => {
        const bem = bens.find((b) => b.id === i.bemId)
        return (
          <div key={i.id} className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white">
              <Landmark className="size-5" />
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block font-bold">{i.descricao} vira patrimônio</span>
              {bem ? (
                <Link href={`/painel/patrimonio/${bem.id}`} className="text-xs text-violet-800 hover:underline">
                  Cadastrado como {bem.plaqueta}
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground">Ainda não cadastrado no patrimônio.</span>
              )}
            </span>
            {!bem && podeCadastrarBem && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/painel/patrimonio/cadastro?compra=${c.id}&item=${i.id}`}>Cadastrar</Link>
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function DialogoAprovar({ compra, onClose }: { compra: Compra | null; onClose: () => void }) {
  const aprovar = useDemo((s) => s.aprovarCompra)
  const [usaVerba, setUsaVerba] = React.useState(false)
  const [verbaId, setVerbaId] = React.useState("")
  React.useEffect(() => {
    setUsaVerba(false)
    setVerbaId("")
  }, [compra])
  return (
    <Dialog open={!!compra} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Aprovar {compra?.codigo}</DialogTitle>
          <DialogDescription>Compras recebe o aviso para comprar. Se já souber de onde sai o dinheiro, escolha a verba — a conta a pagar nasce ligada a ela.</DialogDescription>
        </DialogHeader>
        <label className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
          <span className="text-sm font-semibold">Pagar com uma verba</span>
          <Switch checked={usaVerba} onCheckedChange={setUsaVerba} />
        </label>
        {usaVerba && <SeletorVerba valor={verbaId} onChange={setVerbaId} />}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={usaVerba && !verbaId}
            onClick={() => {
              if (!compra) return
              aprovar(compra.id, usaVerba ? verbaId : undefined)
              toast.success("Compra aprovada — Compras foi avisado")
              onClose()
            }}
          >
            Aprovar compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DialogoRecusar({ compra, onClose }: { compra: Compra | null; onClose: () => void }) {
  const recusar = useDemo((s) => s.recusarCompra)
  const [motivo, setMotivo] = React.useState("")
  React.useEffect(() => setMotivo(""), [compra])
  return (
    <Dialog open={!!compra} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recusar {compra?.codigo}</DialogTitle>
          <DialogDescription>Quem pediu recebe o aviso com o motivo.</DialogDescription>
        </DialogHeader>
        <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} placeholder="Ex.: vamos buscar doação antes de comprar." autoFocus />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!motivo.trim()}
            onClick={() => {
              if (!compra) return
              recusar(compra.id, motivo.trim())
              toast.success("Solicitação recusada")
              onClose()
            }}
          >
            Recusar compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DialogoComprar({ compra, onClose }: { compra: Compra | null; onClose: () => void }) {
  const marcar = useDemo((s) => s.marcarComprada)
  const [fornecedor, setFornecedor] = React.useState("")
  const [valor, setValor] = React.useState("")
  const [vencimento, setVencimento] = React.useState(somarDias(hoje(), 15))
  const [forma, setForma] = React.useState<FormaPagamento>("boleto")
  const [categoria, setCategoria] = React.useState("Outros")

  React.useEffect(() => {
    if (!compra) return
    setFornecedor("")
    setValor(centsParaCampo(totalEstimado(compra)))
    setVencimento(somarDias(hoje(), 15))
    setForma("boleto")
    setCategoria(compra.itens.some((i) => i.destino === "patrimonio") ? "Equipamentos" : CATEGORIA_DO_SETOR[compra.setor] ?? "Outros")
  }, [compra])

  const temEstoque = compra?.itens.some((i) => i.destino === "estoque")

  return (
    <Dialog open={!!compra} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Marcar {compra?.codigo} como comprada</DialogTitle>
          <DialogDescription>
            Com isto, a conta a pagar é criada para o financeiro{temEstoque ? " e os itens de estoque dão entrada" : ""}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Fornecedor</Label>
            <Input value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} placeholder="Onde foi comprado" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Valor pago</Label>
            <CurrencyInput value={valor} onChange={setValor} />
          </div>
          <div className="space-y-1.5">
            <Label>Vencimento</Label>
            <DatePicker value={vencimento} onChange={(x) => x && setVencimento(dataISO(x))} />
          </div>
          <div className="space-y-1.5">
            <Label>Forma</Label>
            <Select value={forma} onValueChange={(v) => setForma(v as FormaPagamento)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FORMA_LABEL).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Categoria da conta</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_DESPESA.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className={cn("bg-orange-500 hover:bg-orange-600")}
            disabled={!fornecedor.trim() || campoParaCents(valor) <= 0}
            onClick={() => {
              if (!compra) return
              marcar(compra.id, { fornecedor: fornecedor.trim(), valorRealCents: campoParaCents(valor), vencimento, forma, categoria })
              toast.success("Compra registrada — a conta a pagar foi criada")
              onClose()
            }}
          >
            Marcar como comprada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
