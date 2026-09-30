"use client"

import * as React from "react"
import { toast } from "sonner"
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberInput } from "@/components/ui/currency-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CATEGORIAS_ESTOQUE, SETORES, UNIDADES } from "@/data/catalogo"
import type { ItemEstoque } from "@/data/tipos"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { usePode, useUsuario } from "@/store/sessao-store"

/**
 * Entrada ou saída de um item. A SAÍDA pede o setor de destino e quem
 * retirou — é o que permite ver depois quanto cada setor consome.
 */
export function DialogoMovimento({
  aberto,
  onOpenChange,
  itemInicial,
  tipoInicial = "saida",
}: {
  aberto: boolean
  onOpenChange: (v: boolean) => void
  itemInicial?: string
  tipoInicial?: "entrada" | "saida"
}) {
  const d = useDemo()
  const usuario = useUsuario()
  const podeEntrada = usePode("estoque.editar")
  const [tipo, setTipo] = React.useState<"entrada" | "saida">(tipoInicial)
  const [itemId, setItemId] = React.useState(itemInicial ?? "")
  const [qtd, setQtd] = React.useState("1")
  const [setor, setSetor] = React.useState(usuario?.setor ?? "Cozinha")
  const [responsavel, setResponsavel] = React.useState(usuario?.nome ?? "")
  const [motivo, setMotivo] = React.useState("")

  React.useEffect(() => {
    if (!aberto) return
    setTipo(podeEntrada ? tipoInicial : "saida")
    setItemId(itemInicial ?? "")
    setQtd("1")
    setSetor(usuario?.setor ?? "Cozinha")
    setResponsavel(usuario?.nome ?? "")
    setMotivo("")
  }, [aberto, itemInicial, tipoInicial, podeEntrada, usuario])

  const item = d.itensEstoque.find((i) => i.id === itemId)
  const n = parseFloat(qtd) || 0
  const faltando = tipo === "saida" && item && n > item.quantidade

  function confirmar() {
    if (!item || n <= 0) return
    if (tipo === "entrada") {
      d.entradaEstoque(item.id, n, motivo || "Entrada manual")
      toast.success(`Entrada de ${n} ${item.unidade} registrada`)
    } else {
      d.saidaEstoque(item.id, n, setor, responsavel || "—", motivo || "Uso do setor")
      toast.success(`Saída de ${n} ${item.unidade} para ${setor}`)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Movimentar estoque</DialogTitle>
          <DialogDescription>Registre o que entrou ou o que saiu, e para qual setor.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {(["saida", "entrada"] as const).map((t) => {
            const Icone = t === "saida" ? ArrowUpFromLine : ArrowDownToLine
            const bloqueado = t === "entrada" && !podeEntrada
            return (
              <button
                key={t}
                type="button"
                disabled={bloqueado}
                onClick={() => setTipo(t)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors disabled:opacity-40",
                  tipo === t ? (t === "saida" ? "border-amber-400 bg-amber-50 text-amber-800" : "border-teal-400 bg-teal-50 text-teal-800") : "border-border text-muted-foreground"
                )}
              >
                <Icone className="size-4" />
                {t === "saida" ? "Saída (retirar)" : "Entrada (chegou)"}
              </button>
            )
          })}
        </div>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
          <div className="space-y-1.5">
            <Label>Item</Label>
            <Select value={itemId || undefined} onValueChange={setItemId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha o item" />
              </SelectTrigger>
              <SelectContent>
                {d.itensEstoque.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.nome} — {i.quantidade} {i.unidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Quantidade</Label>
            <NumberInput value={qtd} onChange={setQtd} suffix={item?.unidade} error={!!faltando} />
          </div>
          {tipo === "saida" && (
            <>
              <div className="space-y-1.5">
                <Label>Para qual setor</Label>
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
                <Label>Quem retirou</Label>
                <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
              </div>
            </>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Motivo</Label>
            <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder={tipo === "saida" ? "Ex.: almoço da semana" : "Ex.: doação do mercado"} />
          </div>
        </div>
        {faltando && <p className="text-sm text-rose-600">Só há {item?.quantidade} {item?.unidade} no estoque.</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!item || n <= 0 || !!faltando}>
            {tipo === "saida" ? "Registrar saída" : "Registrar entrada"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Cadastro/edição do item de estoque — poucos campos, cabe num diálogo. */
export function DialogoItem({ alvo, onClose }: { alvo: ItemEstoque | "novo" | null; onClose: () => void }) {
  const salvar = useDemo((s) => s.salvarItemEstoque)
  const [nome, setNome] = React.useState("")
  const [categoria, setCategoria] = React.useState<string>(CATEGORIAS_ESTOQUE[0])
  const [unidade, setUnidade] = React.useState("un")
  const [quantidade, setQuantidade] = React.useState("0")
  const [minimo, setMinimo] = React.useState("5")
  const [local, setLocal] = React.useState("Almoxarifado")

  React.useEffect(() => {
    if (!alvo) return
    const e = alvo === "novo" ? null : alvo
    setNome(e?.nome ?? "")
    setCategoria(e?.categoria ?? CATEGORIAS_ESTOQUE[0])
    setUnidade(e?.unidade ?? "un")
    setQuantidade(String(e?.quantidade ?? 0))
    setMinimo(String(e?.minimo ?? 5))
    setLocal(e?.local ?? "Almoxarifado")
  }, [alvo])

  return (
    <Dialog open={!!alvo} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{alvo === "novo" ? "Novo item de estoque" : "Editar item"}</DialogTitle>
          <DialogDescription>O mínimo é o ponto em que Compras recebe o aviso para repor.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Arroz tipo 1 (5 kg)" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_ESTOQUE.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Onde fica</Label>
            <Input value={local} onChange={(e) => setLocal(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Unidade</Label>
            <Select value={unidade} onValueChange={setUnidade}>
              <SelectTrigger className="w-full">
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{alvo === "novo" ? "Tem hoje" : "Quantidade"}</Label>
              <NumberInput value={quantidade} onChange={setQuantidade} disabled={alvo !== "novo"} />
            </div>
            <div className="space-y-1.5">
              <Label>Mínimo</Label>
              <NumberInput value={minimo} onChange={setMinimo} />
            </div>
          </div>
        </div>
        {alvo !== "novo" && <p className="text-xs text-muted-foreground">A quantidade muda só por entrada e saída — assim o histórico bate.</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!nome.trim()}
            onClick={() => {
              salvar({
                id: alvo && alvo !== "novo" ? alvo.id : undefined,
                nome: nome.trim(),
                categoria,
                unidade,
                quantidade: alvo && alvo !== "novo" ? alvo.quantidade : parseFloat(quantidade) || 0,
                minimo: parseFloat(minimo) || 0,
                local,
              })
              toast.success(alvo === "novo" ? "Item cadastrado" : "Item atualizado")
              onClose()
            }}
          >
            {alvo === "novo" ? "Cadastrar item" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
