"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/ui/currency-input"
import { DatePicker } from "@/components/ui/date-picker"
import { Bloco, CampoEmpilhado, FORM_MOLDE, FormFooter } from "@/components/common/form-layout"
import { FiltroChips } from "@/components/common/filtro-chips"
import { ListaDeEscolha } from "@/components/common/lista-de-escolha"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, NaoEncontrado, campoParaCents, centsParaCampo } from "@/components/apae/comum"
import { TIPO_VERBA_LABEL } from "@/data/catalogo"
import type { TipoVerba } from "@/data/tipos"
import { dataISO } from "@/lib/datas"
import { useDemo } from "@/store/demo-store"

export function VerbaForm({ id }: { id?: string }) {
  return (
    <Guard permissao="financeiro.editar" titulo={id ? "Editar verba" : "Nova verba"}>
      <Formulario id={id} />
    </Guard>
  )
}

function Formulario({ id }: { id?: string }) {
  const router = useRouter()
  const d = useDemo()
  const existente = id ? d.verbas.find((v) => v.id === id) : undefined
  const ano = new Date().getFullYear()

  const [nome, setNome] = React.useState(existente?.nome ?? "")
  const [tipo, setTipo] = React.useState<TipoVerba>(existente?.tipo ?? "convenio")
  const [apoiadorId, setApoiadorId] = React.useState(existente?.apoiadorId ?? "")
  const [valor, setValor] = React.useState(centsParaCampo(existente?.valorCents))
  const [inicio, setInicio] = React.useState(existente?.inicio ?? `${ano}-01-01`)
  const [fim, setFim] = React.useState(existente?.fim ?? `${ano}-12-31`)
  const [descricao, setDescricao] = React.useState(existente?.descricao ?? "")
  const [novoApoiador, setNovoApoiador] = React.useState("")
  const [erros, setErros] = React.useState<Record<string, string>>({})

  if (id && !existente) return <NaoEncontrado titulo="Editar verba" voltar="/painel/verbas" />

  function criarApoiador() {
    if (!novoApoiador.trim()) return
    const novo = d.salvarApoiador({ nome: novoApoiador.trim() })
    setApoiadorId(novo)
    setNovoApoiador("")
    toast.success("Apoiador cadastrado e escolhido")
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!nome.trim()) er.nome = "Dê um nome que a equipe reconheça."
    if (!apoiadorId) er.apoiador = "Escolha de qual apoiador vem a verba."
    if (campoParaCents(valor) <= 0) er.valor = "Informe o valor aprovado."
    if (fim < inicio) er.fim = "O fim não pode ser antes do início."
    setErros(er)
    if (Object.keys(er).length) {
      toast.error("Faltam informações — veja os campos marcados.")
      return
    }
    const novoId = d.salvarVerba({ id, nome: nome.trim(), tipo, apoiadorId, valorCents: campoParaCents(valor), inicio, fim, descricao })
    toast.success(id ? "Verba atualizada" : "Verba cadastrada")
    router.push(`/painel/verbas/${novoId}`)
  }

  const erro = (k: string) => erros[k] && <p className="text-xs text-destructive">{erros[k]}</p>

  return (
    <DashboardLayout
      title={id ? "Editar verba" : "Nova verba"}
      description="Toda conta ligada a esta verba entra na prestação de contas dela"
      degrauExtra={existente ? { title: existente.nome, url: `/painel/verbas/${existente.id}` } : undefined}
    >
      <form onSubmit={enviar} className={FORM_MOLDE}>
        <div className="grid flex-1 bg-card md:grid-cols-2 md:divide-x">
          <div className="px-4 py-6 md:px-6">
            <Bloco titulo="A verba" descricao="O nome que aparece nas contas e nos relatórios.">
              <CampoEmpilhado label="Nome da verba" required largo>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Convênio Municipal 2026 — Educação Especial" aria-invalid={!!erros.nome} />
                {erro("nome")}
              </CampoEmpilhado>
              <CampoEmpilhado label="Tipo" largo>
                <FiltroChips
                  ariaLabel="Tipo da verba"
                  value={tipo}
                  onChange={(v) => setTipo(v as TipoVerba)}
                  options={Object.entries(TIPO_VERBA_LABEL).map(([value, label]) => ({ value, label }))}
                />
              </CampoEmpilhado>
              <CampoEmpilhado label="Para que serve" largo hint="O objeto do convênio ou da campanha — ajuda a decidir o que pode ser pago com ela.">
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} />
              </CampoEmpilhado>
            </Bloco>
          </div>
          <div className="border-t px-4 py-6 md:border-t-0 md:px-6">
            <Bloco titulo="De quem, quanto e até quando" descricao="O valor aprovado é a base do saldo.">
              <CampoEmpilhado label="Apoiador" required largo>
                <ListaDeEscolha
                  itens={d.apoiadores}
                  valor={apoiadorId}
                  onEscolher={setApoiadorId}
                  chave={(a) => a.id}
                  nome={(a) => a.nome}
                  selo={() => <span className="size-2.5 shrink-0 rounded-full bg-lime-500" />}
                  rotuloVazio="Escolha o apoiador"
                  seloVazio={<span className="size-2.5 shrink-0 rounded-full border border-dashed border-muted-foreground/50" />}
                  valorVazio=""
                />
                {erro("apoiador")}
                <div className="mt-1 flex gap-2">
                  <Input value={novoApoiador} onChange={(e) => setNovoApoiador(e.target.value)} placeholder="Ou cadastre um apoiador novo" className="h-8 text-sm" />
                  <Button type="button" size="sm" variant="outline" onClick={criarApoiador} disabled={!novoApoiador.trim()}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>
              </CampoEmpilhado>
              <CampoEmpilhado label="Valor aprovado" required largo>
                <CurrencyInput value={valor} onChange={setValor} error={!!erros.valor} />
                {erro("valor")}
              </CampoEmpilhado>
              <CampoEmpilhado label="Início">
                <DatePicker value={inicio} onChange={(x) => x && setInicio(dataISO(x))} />
              </CampoEmpilhado>
              <CampoEmpilhado label="Fim (prazo de uso)">
                <DatePicker value={fim} onChange={(x) => x && setFim(dataISO(x))} error={!!erros.fim} />
                {erro("fim")}
              </CampoEmpilhado>
            </Bloco>
          </div>
        </div>
        <FormFooter submitLabel={id ? "Salvar alterações" : "Cadastrar verba"} onCancel={() => router.back()} />
      </form>
    </DashboardLayout>
  )
}
