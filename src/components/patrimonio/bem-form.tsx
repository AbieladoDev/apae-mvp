"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/ui/currency-input"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bloco, CampoEmpilhado, FORM_MOLDE, FormFooter } from "@/components/common/form-layout"
import { FiltroChips } from "@/components/common/filtro-chips"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, NaoEncontrado, SeletorVerba, campoParaCents, centsParaCampo } from "@/components/apae/comum"
import { CATEGORIAS_BEM, ESTADO_BEM_LABEL, ORIGEM_BEM_LABEL, SETORES } from "@/data/catalogo"
import type { EstadoBem, OrigemBem } from "@/data/tipos"
import { dataISO, hoje } from "@/lib/datas"
import { useDemo } from "@/store/demo-store"
import { proximaPlaqueta } from "./patrimonio-comum"

export function BemForm({ id }: { id?: string }) {
  return (
    <Guard permissao="patrimonio.editar" titulo={id ? "Editar bem" : "Novo bem"}>
      <Formulario id={id} />
    </Guard>
  )
}

function Formulario({ id }: { id?: string }) {
  const router = useRouter()
  const d = useDemo()
  const existente = id ? d.bens.find((b) => b.id === id) : undefined

  // vindo de uma compra: ?compra=co3&item=i2 pré-preenche e liga os dois
  const [origemCompra, setOrigemCompra] = React.useState<{ compraId: string; itemId: string } | null>(null)

  const [plaqueta, setPlaqueta] = React.useState(existente?.plaqueta ?? proximaPlaqueta(d.bens.map((b) => b.plaqueta)))
  const [nome, setNome] = React.useState(existente?.nome ?? "")
  const [categoria, setCategoria] = React.useState<string>(existente?.categoria ?? CATEGORIAS_BEM[0])
  const [descricao, setDescricao] = React.useState(existente?.descricao ?? "")
  const [setor, setSetor] = React.useState(existente?.setor ?? "Administrativo")
  const [responsavel, setResponsavel] = React.useState(existente?.responsavel ?? "")
  const [estado, setEstado] = React.useState<EstadoBem>(existente?.estado ?? "novo")
  const [valor, setValor] = React.useState(centsParaCampo(existente?.valorCents))
  const [aquisicao, setAquisicao] = React.useState(existente?.aquisicao ?? hoje())
  const [origem, setOrigem] = React.useState<OrigemBem>(existente?.origem ?? "compra")
  const [verbaId, setVerbaId] = React.useState(existente?.verbaId ?? "")
  const [apoiadorId, setApoiadorId] = React.useState(existente?.apoiadorId ?? "")
  const [notaFiscal, setNotaFiscal] = React.useState(existente?.notaFiscal ?? "")
  const [erro, setErro] = React.useState("")

  React.useEffect(() => {
    if (id) return
    const q = new URLSearchParams(window.location.search)
    const compra = d.compras.find((c) => c.id === q.get("compra"))
    const item = compra?.itens.find((i) => i.id === q.get("item"))
    if (!compra || !item) return
    setOrigemCompra({ compraId: compra.id, itemId: item.id })
    setNome(item.descricao)
    setSetor(compra.setor)
    setResponsavel(compra.solicitanteNome)
    setValor(centsParaCampo(item.estimadoCents))
    setOrigem(compra.verbaId ? "verba" : "compra")
    setVerbaId(compra.verbaId ?? "")
    setCategoria(compra.setor === "Cozinha" ? "Cozinha" : "Equipamentos terapêuticos")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (id && !existente) return <NaoEncontrado titulo="Editar bem" voltar="/painel/patrimonio" />

  const verba = d.verbas.find((v) => v.id === verbaId)

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !responsavel.trim()) return setErro("Nome do bem e responsável são obrigatórios.")
    if (origem === "verba" && !verbaId) return setErro("Escolha a verba que pagou este bem.")
    const novoId = d.salvarBem({
      id,
      plaqueta,
      nome: nome.trim(),
      categoria,
      descricao,
      setor,
      responsavel: responsavel.trim(),
      estado,
      valorCents: campoParaCents(valor),
      aquisicao,
      origem,
      verbaId: origem === "verba" ? verbaId : undefined,
      apoiadorId: origem === "verba" ? verba?.apoiadorId : origem === "doacao" ? apoiadorId || undefined : undefined,
      compraId: existente?.compraId ?? origemCompra?.compraId,
      notaFiscal,
      movimentacoes: existente?.movimentacoes ?? [],
    })
    if (origemCompra) d.vincularBemACompra(origemCompra.compraId, origemCompra.itemId, novoId)
    toast.success(id ? "Bem atualizado" : `Bem cadastrado como ${plaqueta}`)
    router.push(`/painel/patrimonio/${novoId}`)
  }

  return (
    <DashboardLayout
      title={id ? "Editar bem" : "Novo bem"}
      description={origemCompra ? "Dados trazidos da compra — confira e complete" : "A plaqueta é gerada na sequência; você pode trocar se já houver etiqueta física"}
      degrauExtra={existente ? { title: existente.plaqueta, url: `/painel/patrimonio/${existente.id}` } : undefined}
    >
      <form onSubmit={enviar} className={FORM_MOLDE}>
        <div className="grid flex-1 bg-card md:grid-cols-2 md:divide-x">
          <div className="px-4 py-6 md:px-6">
            <Bloco titulo="O bem" descricao="O que é e onde está.">
              <CampoEmpilhado label="Plaqueta" required>
                <Input value={plaqueta} onChange={(e) => setPlaqueta(e.target.value.toUpperCase())} className="font-bold" />
              </CampoEmpilhado>
              <CampoEmpilhado label="Categoria">
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_BEM.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CampoEmpilhado>
              <CampoEmpilhado label="Nome do bem" required largo>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Cadeira de rodas adulto" />
              </CampoEmpilhado>
              <CampoEmpilhado label="Descrição" largo hint="Marca, modelo, número de série, placa…">
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
              </CampoEmpilhado>
              <CampoEmpilhado label="Setor">
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
              <CampoEmpilhado label="Responsável" required>
                <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Quem responde pelo bem" />
              </CampoEmpilhado>
              <CampoEmpilhado label="Estado" largo>
                <FiltroChips ariaLabel="Estado" value={estado} onChange={(v) => setEstado(v as EstadoBem)} options={Object.entries(ESTADO_BEM_LABEL).map(([value, label]) => ({ value, label }))} />
              </CampoEmpilhado>
            </Bloco>
          </div>
          <div className="border-t px-4 py-6 md:border-t-0 md:px-6">
            <Bloco titulo="De onde veio" descricao="A origem liga o bem à prestação de contas da verba ou ao apoiador que doou.">
              <CampoEmpilhado label="Origem" largo>
                <FiltroChips ariaLabel="Origem" value={origem} onChange={(v) => setOrigem(v as OrigemBem)} options={Object.entries(ORIGEM_BEM_LABEL).map(([value, label]) => ({ value, label }))} />
              </CampoEmpilhado>
              {origem === "verba" && (
                <CampoEmpilhado label="Verba" required largo>
                  <SeletorVerba valor={verbaId} onChange={setVerbaId} />
                </CampoEmpilhado>
              )}
              {origem === "doacao" && (
                <CampoEmpilhado label="Quem doou" largo>
                  <Select value={apoiadorId || "nenhum"} onValueChange={(v) => setApoiadorId(v === "nenhum" ? "" : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Não informado</SelectItem>
                      {d.apoiadores.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CampoEmpilhado>
              )}
              <CampoEmpilhado label="Valor">
                <CurrencyInput value={valor} onChange={setValor} />
              </CampoEmpilhado>
              <CampoEmpilhado label="Data de aquisição">
                <DatePicker value={aquisicao} onChange={(x) => x && setAquisicao(dataISO(x))} />
              </CampoEmpilhado>
              <CampoEmpilhado label="Nota fiscal / termo de doação" largo>
                <Input value={notaFiscal} onChange={(e) => setNotaFiscal(e.target.value)} placeholder="Ex.: NF 18.442" />
              </CampoEmpilhado>
            </Bloco>
            {erro && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{erro}</p>}
          </div>
        </div>
        <FormFooter submitLabel={id ? "Salvar alterações" : "Cadastrar bem"} onCancel={() => router.back()} />
      </form>
    </DashboardLayout>
  )
}
