"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchInput } from "@/components/ui/search-input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableSurface } from "@/components/ui/table"
import { RowActions } from "@/components/common/row-actions"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, Vazio } from "@/components/apae/comum"
import type { Apoiador } from "@/data/tipos"
import { somaCents } from "@/lib/derivados"
import { formatPrice, getInitials } from "@/lib/format"
import { MODULOS } from "@/lib/modulos"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"

export default function Page() {
  return (
    <Guard permissao="financeiro.ler" titulo="Apoiadores">
      <Apoiadores />
    </Guard>
  )
}

/** Cores dos avatares — rotação fixa pela posição, para a lista ficar colorida sem sortear. */
const CORES = ["bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-800", "bg-violet-100 text-violet-700", "bg-pink-100 text-pink-700", "bg-teal-100 text-teal-700", "bg-orange-100 text-orange-700"]

function Apoiadores() {
  const d = useDemo()
  const podeEditar = usePode("financeiro.editar")
  const [busca, setBusca] = React.useState("")
  const [editando, setEditando] = React.useState<Apoiador | "novo" | null>(null)
  const [removendo, setRemovendo] = React.useState<Apoiador | null>(null)

  // atalho "Novo apoiador" do botão Criar chega com ?novo=1
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get("novo") && podeEditar) setEditando("novo")
  }, [podeEditar])

  const linhas = d.apoiadores
    .filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()))
    .map((a) => {
      const verbas = d.verbas.filter((v) => v.apoiadorId === a.id)
      const recebido = somaCents(
        d.contasReceber.filter((c) => c.recebidoEm && (c.apoiadorId === a.id || verbas.some((v) => v.id === c.verbaId))),
        (c) => c.valorCents
      )
      return { a, verbas, recebido, totalVerbas: somaCents(verbas, (v) => v.valorCents) }
    })
    .sort((x, y) => y.recebido - x.recebido)

  const bloqueio = removendo && d.verbas.some((v) => v.apoiadorId === removendo.id)

  return (
    <DashboardLayout
      title="Apoiadores"
      description="Prefeitura, governo, empresas, clubes e doadores que sustentam a APAE"
      actions={
        podeEditar && (
          <Button size="sm" onClick={() => setEditando("novo")}>
            <Plus className="mr-1.5 h-4 w-4" />
            Novo apoiador
          </Button>
        )
      }
      toolbar={<SearchInput value={busca} onChange={setBusca} placeholder="Buscar apoiador" className="w-full sm:w-72" />}
    >
      {linhas.length === 0 ? (
        <Vazio icone={MODULOS.apoiadores.icone} titulo="Nenhum apoiador encontrado" descricao="Cadastre quem repassa verba ou faz doações para a APAE." />
      ) : (
        <TableSurface>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apoiador</TableHead>
                <TableHead>Verbas</TableHead>
                <TableHead className="text-right">Valor das verbas</TableHead>
                <TableHead className="text-right">Já recebido</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map(({ a, verbas, recebido, totalVerbas }, i) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <span className="flex items-center gap-3">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${CORES[i % CORES.length]}`}>{getInitials(a.nome)}</span>
                      <span className="font-semibold">{a.nome}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {verbas.length === 0 && <span className="text-xs text-muted-foreground">Nenhuma</span>}
                      {verbas.map((v) => (
                        <Link key={v.id} href={`/painel/verbas/${v.id}`} className="max-w-[16rem] truncate rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 hover:bg-amber-200">
                          {v.nome}
                        </Link>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{totalVerbas ? formatPrice(totalVerbas) : "—"}</TableCell>
                  <TableCell className="text-right font-bold tabular-nums">{formatPrice(recebido)}</TableCell>
                  <TableCell>
                    <div className="flex">
                      <RowActions
                        actions={[
                          { label: "Renomear", icon: Pencil, onSelect: () => setEditando(a), hidden: !podeEditar },
                          { label: "Remover", icon: Trash2, onSelect: () => setRemovendo(a), destructive: true, hidden: !podeEditar },
                        ]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableSurface>
      )}

      <DialogoApoiador
        alvo={editando}
        onClose={() => setEditando(null)}
        onSalvar={(nome) => {
          d.salvarApoiador({ id: editando && editando !== "novo" ? editando.id : undefined, nome })
          toast.success(editando === "novo" ? "Apoiador cadastrado" : "Apoiador atualizado")
          setEditando(null)
        }}
      />
      <ConfirmDeleteDialog
        open={!!removendo}
        onOpenChange={(v) => !v && setRemovendo(null)}
        title="Remover apoiador?"
        description={`"${removendo?.nome}" sai da lista de apoiadores.`}
        blockedReason={bloqueio ? "Este apoiador tem verbas cadastradas. Remova ou troque o apoiador das verbas antes." : undefined}
        onConfirm={() => {
          if (removendo) d.removerApoiador(removendo.id)
          toast.success("Apoiador removido")
          setRemovendo(null)
        }}
      />
    </DashboardLayout>
  )
}

function DialogoApoiador({ alvo, onClose, onSalvar }: { alvo: Apoiador | "novo" | null; onClose: () => void; onSalvar: (nome: string) => void }) {
  const [nome, setNome] = React.useState("")
  React.useEffect(() => {
    if (alvo) setNome(alvo === "novo" ? "" : alvo.nome)
  }, [alvo])
  return (
    <Dialog open={!!alvo} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (nome.trim()) onSalvar(nome.trim())
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>{alvo === "novo" ? "Novo apoiador" : "Renomear apoiador"}</DialogTitle>
            <DialogDescription>Por enquanto basta o nome. As verbas deste apoiador são cadastradas em Verbas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="nome-apoiador">Nome</Label>
            <Input id="nome-apoiador" autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Lions Clube de Esteio" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nome.trim()}>
              {alvo === "novo" ? "Cadastrar apoiador" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
