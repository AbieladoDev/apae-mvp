"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/ui/currency-input"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bloco, CampoEmpilhado, FORM_MOLDE, FormFooter, Interruptor } from "@/components/common/form-layout"
import { FiltroChips } from "@/components/common/filtro-chips"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, NaoEncontrado, SeletorVerba, campoParaCents, centsParaCampo } from "@/components/apae/comum"
import { AREAS_PRESTADOR, DIAS_SEMANA_LONGO, SETORES, TIPO_PRESTADOR_LABEL } from "@/data/catalogo"
import type { DiaNaCasa, TipoPrestador } from "@/data/tipos"
import { dataISO } from "@/lib/datas"
import { useDemo } from "@/store/demo-store"

export function PrestadorForm({ id }: { id?: string }) {
  return (
    <Guard permissao="prestadores.editar" titulo={id ? "Editar prestador" : "Novo prestador"}>
      <Formulario id={id} />
    </Guard>
  )
}

function Formulario({ id }: { id?: string }) {
  const router = useRouter()
  const d = useDemo()
  const e = id ? d.prestadores.find((p) => p.id === id) : undefined
  const ano = new Date().getFullYear()

  const [nome, setNome] = React.useState(e?.nome ?? "")
  const [area, setArea] = React.useState(e?.area ?? AREAS_PRESTADOR[0])
  const [descricao, setDescricao] = React.useState(e?.descricao ?? "")
  const [documento, setDocumento] = React.useState(e?.documento ?? "")
  const [telefone, setTelefone] = React.useState(e?.telefone ?? "")
  const [email, setEmail] = React.useState(e?.email ?? "")
  const [tipo, setTipo] = React.useState<TipoPrestador>(e?.tipo ?? "contrato")
  const [valor, setValor] = React.useState(centsParaCampo(e?.valorMensalCents))
  const [inicio, setInicio] = React.useState(e?.vigenciaInicio ?? `${ano}-01-01`)
  const [fim, setFim] = React.useState(e?.vigenciaFim ?? `${ano}-12-31`)
  const [usaVerba, setUsaVerba] = React.useState(Boolean(e?.verbaId))
  const [verbaId, setVerbaId] = React.useState(e?.verbaId ?? "")
  const [dias, setDias] = React.useState<DiaNaCasa[]>(e?.dias ?? [])

  if (id && !e) return <NaoEncontrado titulo="Editar prestador" voltar="/painel/prestadores" />

  function enviar(ev: React.FormEvent) {
    ev.preventDefault()
    if (!nome.trim()) return toast.error("Informe o nome do prestador.")
    const novoId = d.salvarPrestador({
      id,
      nome: nome.trim(),
      area,
      descricao,
      documento,
      telefone,
      email,
      tipo,
      valorMensalCents: tipo === "contrato" ? campoParaCents(valor) : 0,
      vigenciaInicio: inicio,
      vigenciaFim: fim,
      verbaId: tipo === "contrato" && usaVerba ? verbaId : undefined,
      dias: [...dias].sort((a, b) => a.dia - b.dia || a.inicio.localeCompare(b.inicio)),
    })
    toast.success(id ? "Prestador atualizado" : "Prestador cadastrado")
    router.push(`/painel/prestadores/${novoId}`)
  }

  return (
    <DashboardLayout
      title={id ? "Editar prestador" : "Novo prestador"}
      description="Profissional ou empresa que atende na APAE"
      degrauExtra={e ? { title: e.nome, url: `/painel/prestadores/${e.id}` } : undefined}
    >
      <form onSubmit={enviar} className={FORM_MOLDE}>
        <div className="grid flex-1 bg-card md:grid-cols-2 md:divide-x">
          <div className="space-y-10 px-4 py-6 md:px-6">
            <Bloco titulo="Quem é" descricao="E o que faz aqui dentro.">
              <CampoEmpilhado label="Nome" required largo>
                <Input value={nome} onChange={(x) => setNome(x.target.value)} placeholder="Pessoa ou empresa" />
              </CampoEmpilhado>
              <CampoEmpilhado label="Área" largo>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS_PRESTADOR.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CampoEmpilhado>
              <CampoEmpilhado label="O que faz na APAE" largo>
                <Textarea value={descricao} onChange={(x) => setDescricao(x.target.value)} rows={3} placeholder="Ex.: atendimento individual de fala e deglutição" />
              </CampoEmpilhado>
            </Bloco>
            <Bloco titulo="Contato e documento">
              <CampoEmpilhado label="Telefone">
                <Input value={telefone} onChange={(x) => setTelefone(x.target.value)} placeholder="(51) 99999-9999" />
              </CampoEmpilhado>
              <CampoEmpilhado label="E-mail">
                <Input value={email} onChange={(x) => setEmail(x.target.value)} type="email" />
              </CampoEmpilhado>
              <CampoEmpilhado label="CPF, CNPJ ou registro profissional" largo>
                <Input value={documento} onChange={(x) => setDocumento(x.target.value)} placeholder="Ex.: CREFITO 5-12345 ou CNPJ" />
              </CampoEmpilhado>
            </Bloco>
          </div>
          <div className="space-y-10 border-t px-4 py-6 md:border-t-0 md:px-6">
            <Bloco titulo="Vínculo" descricao="Como a pessoa está ligada à APAE.">
              <CampoEmpilhado label="Tipo" largo>
                <FiltroChips ariaLabel="Tipo" value={tipo} onChange={(v) => setTipo(v as TipoPrestador)} options={Object.entries(TIPO_PRESTADOR_LABEL).map(([value, label]) => ({ value, label }))} />
              </CampoEmpilhado>
              {tipo === "contrato" && (
                <CampoEmpilhado label="Valor mensal" largo>
                  <CurrencyInput value={valor} onChange={setValor} />
                </CampoEmpilhado>
              )}
              <CampoEmpilhado label="Vigência — início">
                <DatePicker value={inicio} onChange={(x) => x && setInicio(dataISO(x))} />
              </CampoEmpilhado>
              <CampoEmpilhado label="Vigência — fim">
                <DatePicker value={fim} onChange={(x) => x && setFim(dataISO(x))} />
              </CampoEmpilhado>
              {tipo === "contrato" && (
                <Interruptor rotulo="Pago por uma verba?" descricao="Ex.: terapeutas pagos pelo programa de reabilitação." marcado={usaVerba} onMarcar={setUsaVerba}>
                  <CampoEmpilhado label="Verba" largo>
                    <SeletorVerba valor={verbaId} onChange={setVerbaId} />
                  </CampoEmpilhado>
                </Interruptor>
              )}
            </Bloco>
            <section>
              <h2 className="text-base font-semibold">Quando está na casa</h2>
              <p className="mt-1 text-sm text-muted-foreground">Deixe vazio para quem vem sob demanda (manutenção, contabilidade).</p>
              <ul className="mt-4 space-y-2">
                {dias.map((dia, i) => (
                  <li key={i} className="grid grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_auto] items-center gap-2 sm:grid-cols-[8rem_5.5rem_5.5rem_minmax(0,1fr)_auto]">
                    <Select value={String(dia.dia)} onValueChange={(v) => setDias((ds) => ds.map((x, j) => (j === i ? { ...x, dia: Number(v) } : x)))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIAS_SEMANA_LONGO.map((n, k) => (
                          <SelectItem key={n} value={String(k)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="time" value={dia.inicio} onChange={(x) => setDias((ds) => ds.map((y, j) => (j === i ? { ...y, inicio: x.target.value } : y)))} />
                    <Input type="time" value={dia.fim} onChange={(x) => setDias((ds) => ds.map((y, j) => (j === i ? { ...y, fim: x.target.value } : y)))} />
                    <Select value={dia.setor} onValueChange={(v) => setDias((ds) => ds.map((y, j) => (j === i ? { ...y, setor: v } : y)))}>
                      <SelectTrigger className="col-span-3 w-full sm:col-span-1">
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
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Remover horário" onClick={() => setDias((ds) => ds.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </li>
                ))}
              </ul>
              <Button type="button" variant="outline" size="sm" className="mt-3 border-dashed" onClick={() => setDias((ds) => [...ds, { dia: 1, inicio: "08:00", fim: "12:00", setor: "Saúde e terapias" }])}>
                <Plus className="mr-1.5 h-4 w-4" />
                Adicionar horário
              </Button>
            </section>
          </div>
        </div>
        <FormFooter submitLabel={id ? "Salvar alterações" : "Cadastrar prestador"} onCancel={() => router.back()} />
      </form>
    </DashboardLayout>
  )
}
