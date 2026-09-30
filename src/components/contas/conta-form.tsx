"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/ui/currency-input"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bloco, CampoEmpilhado, FORM_MOLDE, FormFooter, Interruptor } from "@/components/common/form-layout"
import { ListaDeEscolha } from "@/components/common/lista-de-escolha"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, NaoEncontrado, SeletorVerba, campoParaCents, centsParaCampo } from "@/components/apae/comum"
import { FORMA_LABEL } from "@/data/catalogo"
import type { FormaPagamento } from "@/data/tipos"
import { dataISO, hoje } from "@/lib/datas"
import { useDemo } from "@/store/demo-store"
import { TIPO, useContas, type TipoConta } from "./tipo-conta"

export function ContaForm({ tipo, id }: { tipo: TipoConta; id?: string }) {
  const t = TIPO[tipo]
  return (
    <Guard permissao="financeiro.editar" titulo={id ? "Editar conta" : t.nova}>
      <Formulario tipo={tipo} id={id} />
    </Guard>
  )
}

function Formulario({ tipo, id }: { tipo: TipoConta; id?: string }) {
  const t = TIPO[tipo]
  const router = useRouter()
  const { lista, salvar } = useContas(tipo)
  const verbas = useDemo((s) => s.verbas)
  const apoiadores = useDemo((s) => s.apoiadores)
  const prestadores = useDemo((s) => s.prestadores)
  const existente = id ? lista.find((c) => c.id === id) : undefined

  const [descricao, setDescricao] = React.useState(existente?.descricao ?? "")
  const [valor, setValor] = React.useState(centsParaCampo(existente?.valorCents))
  const [contraparte, setContraparte] = React.useState(existente?.contraparte ?? "")
  const [classe, setClasse] = React.useState(existente?.classe ?? "")
  const [observacoes, setObservacoes] = React.useState(existente?.observacoes ?? "")
  const [vencimento, setVencimento] = React.useState(existente?.vencimento ?? "")
  const [usaVerba, setUsaVerba] = React.useState(existente?.usaVerba ?? false)
  const [verbaId, setVerbaId] = React.useState(existente?.verbaId ?? "")
  const [apoiadorId, setApoiadorId] = React.useState(existente?.apoiadorId ?? "")
  const [jaQuitada, setJaQuitada] = React.useState(false)
  const [quitadoEm, setQuitadoEm] = React.useState(hoje())
  const [forma, setForma] = React.useState<FormaPagamento>(existente?.forma ?? "pix")
  const [erros, setErros] = React.useState<Record<string, string>>({})

  if (id && !existente) return <NaoEncontrado titulo="Editar conta" voltar={t.base} />

  const verba = verbas.find((v) => v.id === verbaId)
  const apoiadorDaVerba = apoiadores.find((a) => a.id === verba?.apoiadorId)

  function validar() {
    const e: Record<string, string> = {}
    if (!descricao.trim()) e.descricao = "Diga do que é a conta."
    if (campoParaCents(valor) <= 0) e.valor = "Informe o valor."
    if (!vencimento) e.vencimento = tipo === "pagar" ? "Informe o vencimento." : "Informe a data prevista."
    if (!classe) e.classe = `Escolha ${tipo === "pagar" ? "a categoria" : "a origem"}.`
    if (usaVerba && !verbaId) e.verba = "Escolha qual verba paga esta conta."
    setErros(e)
    return Object.keys(e).length === 0
  }

  function enviar(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validar()) {
      toast.error("Faltam informações — veja os campos marcados.")
      return
    }
    const prestador = prestadores.find((p) => p.nome === contraparte)
    const novoId = salvar({
      id,
      descricao: descricao.trim(),
      valorCents: campoParaCents(valor),
      vencimento,
      classe,
      contraparte: contraparte.trim(),
      usaVerba,
      verbaId: usaVerba ? verbaId : undefined,
      apoiadorId: usaVerba ? verba?.apoiadorId : apoiadorId || undefined,
      prestadorId: existente?.prestadorId ?? prestador?.id,
      compraId: existente?.compraId,
      quitadoEm: existente ? existente.quitadoEm : jaQuitada ? quitadoEm : undefined,
      forma,
      observacoes,
    })
    toast.success(id ? "Conta atualizada" : tipo === "pagar" ? "Conta a pagar lançada" : "Conta a receber lançada")
    router.push(`${t.base}/${novoId}`)
  }

  const erro = (k: string) => erros[k] && <p className="text-xs text-destructive">{erros[k]}</p>

  return (
    <DashboardLayout
      title={id ? "Editar conta" : t.nova}
      description={id ? existente?.descricao : "Os campos com * são obrigatórios"}
      degrauExtra={id && existente ? { title: existente.descricao, url: `${t.base}/${id}` } : undefined}
    >
      <form onSubmit={enviar} className={FORM_MOLDE}>
        <div className="grid flex-1 bg-card md:grid-cols-2 md:divide-x">
          <div className="space-y-8 px-4 py-6 md:px-6">
            <Bloco titulo={tipo === "pagar" ? "A conta" : "O recebimento"} descricao={tipo === "pagar" ? "O que é, quanto custa e para quem." : "O que entra, quanto e de quem."}>
              <CampoEmpilhado label="Descrição" required largo>
                <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={tipo === "pagar" ? "Ex.: Energia elétrica de setembro" : "Ex.: Repasse do convênio municipal"} aria-invalid={!!erros.descricao} />
                {erro("descricao")}
              </CampoEmpilhado>
              <CampoEmpilhado label="Valor" required>
                <CurrencyInput value={valor} onChange={setValor} error={!!erros.valor} />
                {erro("valor")}
              </CampoEmpilhado>
              <CampoEmpilhado label={t.contraparteRotulo} hint={tipo === "pagar" ? "Pode ser um prestador cadastrado." : undefined}>
                <Input value={contraparte} onChange={(e) => setContraparte(e.target.value)} placeholder={t.contrapartePlaceholder} list="contrapartes" />
                <datalist id="contrapartes">
                  {(tipo === "pagar" ? prestadores.map((p) => p.nome) : apoiadores.map((a) => a.nome)).map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </CampoEmpilhado>
              <CampoEmpilhado label={t.classeRotulo} required largo>
                <ListaDeEscolha
                  itens={[...t.classes]}
                  valor={classe}
                  onEscolher={setClasse}
                  chave={(c) => c}
                  nome={(c) => c}
                  selo={(c) => <span className="size-2.5 shrink-0 rounded-full" style={{ background: t.corClasse(c) }} />}
                  rotuloVazio={tipo === "pagar" ? "Escolha a categoria" : "Escolha a origem"}
                  seloVazio={<span className="size-2.5 shrink-0 rounded-full border border-dashed border-muted-foreground/50" />}
                  valorVazio=""
                />
                {erro("classe")}
              </CampoEmpilhado>
              <CampoEmpilhado label="Observações" largo>
                <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} placeholder="Número da nota, combinado com o fornecedor…" />
              </CampoEmpilhado>
            </Bloco>
          </div>

          <div className="space-y-8 border-t px-4 py-6 md:border-t-0 md:px-6">
            <Bloco titulo="Quando e de onde vem o dinheiro" descricao={tipo === "pagar" ? "A verba define em qual prestação de contas este gasto aparece." : "Ligue à verba para ela mostrar quanto já foi recebido."}>
              <CampoEmpilhado label={tipo === "pagar" ? "Vencimento" : "Data prevista"} required>
                <DatePicker value={vencimento} onChange={(d) => setVencimento(d ? dataISO(d) : "")} error={!!erros.vencimento} />
                {erro("vencimento")}
              </CampoEmpilhado>
              <CampoEmpilhado label="Forma">
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
              </CampoEmpilhado>

              <Interruptor
                rotulo={tipo === "pagar" ? "Esta conta usa verba?" : "Este dinheiro é de uma verba?"}
                descricao={tipo === "pagar" ? "Convênio, emenda, programa ou campanha com prestação de contas." : "Repasse de convênio, parcela de emenda, doação de campanha…"}
                marcado={usaVerba}
                onMarcar={setUsaVerba}
              >
                <CampoEmpilhado label="Qual verba" required largo hint={<Link href="/painel/verbas/cadastro" className="font-semibold text-primary hover:underline">A verba ainda não existe? Cadastre aqui.</Link>}>
                  <SeletorVerba valor={verbaId} onChange={setVerbaId} />
                  {erro("verba")}
                </CampoEmpilhado>
                {verba && (
                  <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm sm:col-span-2">
                    <span className="text-muted-foreground">Apoiador desta verba: </span>
                    <span className="font-bold">{apoiadorDaVerba?.nome ?? "—"}</span>
                  </div>
                )}
              </Interruptor>

              {tipo === "receber" && !usaVerba && (
                <CampoEmpilhado label="Apoiador" hint="Opcional: quem fez a doação ou o repasse." largo>
                  <Select value={apoiadorId || "nenhum"} onValueChange={(v) => setApoiadorId(v === "nenhum" ? "" : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                      {apoiadores.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CampoEmpilhado>
              )}

              {!id && (
                <Interruptor
                  rotulo={tipo === "pagar" ? "Já foi paga?" : "Já foi recebida?"}
                  descricao="Para lançar algo que já aconteceu."
                  marcado={jaQuitada}
                  onMarcar={setJaQuitada}
                >
                  <CampoEmpilhado label={t.quitadoEm}>
                    <DatePicker value={quitadoEm} onChange={(d) => d && setQuitadoEm(dataISO(d))} />
                  </CampoEmpilhado>
                </Interruptor>
              )}
            </Bloco>
          </div>
        </div>
        <FormFooter submitLabel={id ? "Salvar alterações" : t.lancar} onCancel={() => router.back()} />
      </form>
    </DashboardLayout>
  )
}
