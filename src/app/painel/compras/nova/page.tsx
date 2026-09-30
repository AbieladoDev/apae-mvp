"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput, NumberInput } from "@/components/ui/currency-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bloco, CampoEmpilhado, FORM_MOLDE, FormFooter } from "@/components/common/form-layout"
import { FiltroChips } from "@/components/common/filtro-chips"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, campoParaCents } from "@/components/apae/comum"
import { DESTINO_LABEL, SETORES, UNIDADES, URGENCIA_LABEL } from "@/data/catalogo"
import type { DestinoItem, ItemCompra, Urgencia } from "@/data/tipos"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { useUsuario } from "@/store/sessao-store"

export default function Page() {
  return (
    <Guard permissao="compras.solicitar" titulo="Solicitar compra">
      <NovaCompra />
    </Guard>
  )
}

interface Linha {
  chave: number
  descricao: string
  quantidade: string
  unidade: string
  estimado: string
  destino: DestinoItem
  itemEstoqueId: string
}

const linhaVazia = (chave: number): Linha => ({ chave, descricao: "", quantidade: "1", unidade: "un", estimado: "", destino: "consumo", itemEstoqueId: "" })

const COR_DESTINO: Record<DestinoItem, string> = {
  consumo: "border-sky-300 bg-sky-50 text-sky-800",
  estoque: "border-teal-300 bg-teal-50 text-teal-800",
  patrimonio: "border-violet-300 bg-violet-50 text-violet-800",
}

function NovaCompra() {
  const router = useRouter()
  const usuario = useUsuario()
  const d = useDemo()
  const [setor, setSetor] = React.useState(usuario?.setor ?? "Pedagogia")
  const [urgencia, setUrgencia] = React.useState<Urgencia>("normal")
  const [justificativa, setJustificativa] = React.useState("")
  const [linhas, setLinhas] = React.useState<Linha[]>([linhaVazia(1)])
  const [erro, setErro] = React.useState("")

  const muda = (chave: number, p: Partial<Linha>) => setLinhas((ls) => ls.map((l) => (l.chave === chave ? { ...l, ...p } : l)))
  const total = linhas.reduce((t, l) => t + (parseFloat(l.quantidade) || 0) * campoParaCents(l.estimado), 0)

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    const validas = linhas.filter((l) => l.descricao.trim())
    if (validas.length === 0) return setErro("Adicione pelo menos um item.")
    if (validas.some((l) => l.destino === "estoque" && !l.itemEstoqueId)) return setErro("Nos itens que vão para o estoque, escolha qual item do estoque recebe a entrada.")
    if (!justificativa.trim()) return setErro("Conte em uma frase por que precisa — é o que a direção lê para aprovar.")
    const itens: ItemCompra[] = validas.map((l, i) => ({
      id: `i${i + 1}`,
      descricao: l.descricao.trim(),
      quantidade: parseFloat(l.quantidade) || 1,
      unidade: l.unidade,
      estimadoCents: campoParaCents(l.estimado),
      destino: l.destino,
      itemEstoqueId: l.destino === "estoque" ? l.itemEstoqueId : undefined,
    }))
    const id = d.criarCompra({ setor, itens, justificativa: justificativa.trim(), urgencia })
    toast.success("Solicitação enviada — a direção foi avisada")
    router.push(`/painel/compras/${id}`)
  }

  return (
    <DashboardLayout title="Solicitar compra" description="A direção recebe um aviso e aprova ou recusa. Você acompanha tudo pela própria solicitação.">
      <form onSubmit={enviar} className={FORM_MOLDE}>
        <div className="grid flex-1 bg-card lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:divide-x">
          <div className="px-4 py-6 md:px-6">
            <Bloco titulo="O pedido" descricao="Para quem é e por que precisa.">
              <CampoEmpilhado label="Setor" required>
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
              </CampoEmpilhado>
              <CampoEmpilhado label="Quem pede">
                <Input value={usuario?.nome ?? ""} disabled />
              </CampoEmpilhado>
              <CampoEmpilhado label="Urgência" largo>
                <FiltroChips ariaLabel="Urgência" value={urgencia} onChange={(v) => setUrgencia(v as Urgencia)} options={Object.entries(URGENCIA_LABEL).map(([value, label]) => ({ value, label }))} />
              </CampoEmpilhado>
              <CampoEmpilhado label="Por que precisa" required largo>
                <Textarea value={justificativa} onChange={(e) => setJustificativa(e.target.value)} rows={4} placeholder="Ex.: a massinha acabou e a oficina de artes da tarde usa todo dia." />
              </CampoEmpilhado>
            </Bloco>
          </div>

          <div className="border-t px-4 py-6 md:px-6 lg:border-t-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Itens</h2>
                <p className="mt-1 text-sm text-muted-foreground">O destino diz o que acontece depois da compra: vai para o estoque, vira patrimônio ou é usado na hora.</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground">Estimado</p>
                <p className="text-lg font-extrabold tabular-nums">{formatPrice(total)}</p>
              </div>
            </div>

            <ul className="mt-5 space-y-3">
              {linhas.map((l, i) => (
                <li key={l.chave} className="rounded-2xl border p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">Item {i + 1}</span>
                    {linhas.length > 1 && (
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => setLinhas((ls) => ls.filter((x) => x.chave !== l.chave))} aria-label="Remover item">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,2fr)_5rem_6rem_minmax(0,1fr)]">
                    <Input value={l.descricao} onChange={(e) => muda(l.chave, { descricao: e.target.value })} placeholder="O que comprar" aria-label="Descrição" />
                    <NumberInput value={l.quantidade} onChange={(v) => muda(l.chave, { quantidade: v })} />
                    <Select value={l.unidade} onValueChange={(v) => muda(l.chave, { unidade: v })}>
                      <SelectTrigger className="w-full" aria-label="Unidade">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIDADES.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <CurrencyInput value={l.estimado} onChange={(v) => muda(l.chave, { estimado: v })} placeholder="R$ por unidade" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label="Destino">
                    {(Object.keys(DESTINO_LABEL) as DestinoItem[]).map((dst) => (
                      <button
                        key={dst}
                        type="button"
                        role="radio"
                        aria-checked={l.destino === dst}
                        onClick={() => muda(l.chave, { destino: dst })}
                        className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors", l.destino === dst ? COR_DESTINO[dst] : "text-muted-foreground hover:border-foreground/30")}
                      >
                        {DESTINO_LABEL[dst]}
                      </button>
                    ))}
                    {l.destino === "estoque" && (
                      <Select
                        value={l.itemEstoqueId || undefined}
                        onValueChange={(v) => {
                          const it = d.itensEstoque.find((x) => x.id === v)
                          muda(l.chave, { itemEstoqueId: v, descricao: l.descricao || it?.nome || "", unidade: it?.unidade ?? l.unidade })
                        }}
                      >
                        <SelectTrigger size="sm" className="ml-auto w-full sm:w-64">
                          <SelectValue placeholder="Qual item do estoque?" />
                        </SelectTrigger>
                        <SelectContent>
                          {d.itensEstoque.map((it) => (
                            <SelectItem key={it.id} value={it.id}>
                              {it.nome} ({it.quantidade} {it.unidade})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <Button type="button" variant="outline" size="sm" className="mt-3 border-dashed" onClick={() => setLinhas((ls) => [...ls, linhaVazia(Math.max(...ls.map((x) => x.chave)) + 1)])}>
              <Plus className="mr-1.5 h-4 w-4" />
              Adicionar item
            </Button>
            {erro && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{erro}</p>}
          </div>
        </div>
        <FormFooter submitLabel="Enviar para aprovação" onCancel={() => router.back()} />
      </form>
    </DashboardLayout>
  )
}
