"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useFilteredNavigation } from "@/components/layout/nav-config"
import { MODULOS, type Modulo } from "@/lib/modulos"
import { formatPrice } from "@/lib/format"
import { temPermissao, type Permissao } from "@/lib/permissoes"
import { useDemo } from "@/store/demo-store"
import { useSessao } from "@/store/sessao-store"

interface Resultado {
  id: string
  titulo: string
  detalhe: string
  href: string
  modulo: Modulo
}

/**
 * Busca global (Ctrl+K): módulos e registros de todos os cadastros que o
 * perfil pode ver. Na demo a busca é local; no sistema real vira o endpoint
 * de busca da API, como na TodosDan.
 */
export function CommandSearch() {
  const router = useRouter()
  const [aberto, setAberto] = React.useState(false)
  const perfil = useSessao((s) => s.perfil)
  const nav = useFilteredNavigation().flatMap((s) => s.items)
  const d = useDemo()

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setAberto((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const grupos = React.useMemo(() => {
    const pode = (p: Permissao) => temPermissao(perfil, p)
    const g: { titulo: string; itens: Resultado[] }[] = []
    if (pode("financeiro.ler")) {
      g.push({
        titulo: "Contas a pagar",
        itens: d.contasPagar.slice(0, 60).map((c) => ({ id: c.id, titulo: c.descricao, detalhe: `${formatPrice(c.valorCents)} · ${c.fornecedor}`, href: `/painel/contas-a-pagar/${c.id}`, modulo: MODULOS.pagar })),
      })
      g.push({
        titulo: "Contas a receber",
        itens: d.contasReceber.slice(0, 60).map((c) => ({ id: c.id, titulo: c.descricao, detalhe: `${formatPrice(c.valorCents)} · ${c.pagador}`, href: `/painel/contas-a-receber/${c.id}`, modulo: MODULOS.receber })),
      })
      g.push({ titulo: "Verbas", itens: d.verbas.map((v) => ({ id: v.id, titulo: v.nome, detalhe: formatPrice(v.valorCents), href: `/painel/verbas/${v.id}`, modulo: MODULOS.verbas })) })
      g.push({ titulo: "Apoiadores", itens: d.apoiadores.map((a) => ({ id: a.id, titulo: a.nome, detalhe: "Apoiador", href: `/painel/apoiadores`, modulo: MODULOS.apoiadores })) })
    }
    if (pode("compras.solicitar")) {
      const minhas = pode("compras.ver_todas") ? d.compras : d.compras.filter((c) => c.solicitante === perfil)
      g.push({ titulo: "Compras", itens: minhas.map((c) => ({ id: c.id, titulo: `${c.codigo} · ${c.itens.map((i) => i.descricao).join(", ")}`, detalhe: c.setor, href: `/painel/compras/${c.id}`, modulo: MODULOS.compras })) })
    }
    if (pode("estoque.ler")) {
      g.push({ titulo: "Estoque", itens: d.itensEstoque.map((i) => ({ id: i.id, titulo: i.nome, detalhe: `${i.quantidade} ${i.unidade} · ${i.local}`, href: `/painel/estoque/${i.id}`, modulo: MODULOS.estoque })) })
    }
    if (pode("patrimonio.ler")) {
      g.push({ titulo: "Patrimônio", itens: d.bens.map((b) => ({ id: b.id, titulo: `${b.plaqueta} · ${b.nome}`, detalhe: `${b.setor} · ${b.responsavel}`, href: `/painel/patrimonio/${b.id}`, modulo: MODULOS.patrimonio })) })
    }
    if (pode("prestadores.ler")) {
      g.push({ titulo: "Prestadores", itens: d.prestadores.map((p) => ({ id: p.id, titulo: p.nome, detalhe: p.area, href: `/painel/prestadores/${p.id}`, modulo: MODULOS.prestadores })) })
    }
    return g.filter((x) => x.itens.length > 0)
  }, [d, perfil])

  function ir(href: string) {
    setAberto(false)
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex h-8 w-9 items-center justify-center gap-2 rounded-full bg-sidebar-accent text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground md:w-[26rem] md:justify-start md:px-3"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden flex-1 truncate text-left md:inline">Buscar conta, compra, bem, prestador…</span>
        <kbd className="hidden rounded bg-sidebar px-1.5 py-0.5 text-[10px] font-bold md:inline">Ctrl K</kbd>
      </button>
      <CommandDialog open={aberto} onOpenChange={setAberto} title="Buscar" description="Busque em todos os módulos">
        <CommandInput placeholder="O que você procura?" />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>Nada encontrado com esse termo.</CommandEmpty>
          <CommandGroup heading="Ir para">
            {nav.map((n) => {
              const Icone = n.icon
              return (
                <CommandItem key={n.url} value={`ir ${n.title}`} onSelect={() => ir(n.url)}>
                  <Icone className="size-4" />
                  {n.title}
                </CommandItem>
              )
            })}
          </CommandGroup>
          {grupos.map((g) => (
            <CommandGroup key={g.titulo} heading={g.titulo}>
              {g.itens.map((r) => {
                const Icone = r.modulo.icone
                return (
                  <CommandItem key={r.id} value={`${r.titulo} ${r.detalhe} ${r.id}`} onSelect={() => ir(r.href)}>
                    <span className={`flex size-7 shrink-0 items-center justify-center rounded-md ${r.modulo.selo}`}>
                      <Icone className="!size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{r.titulo}</span>
                      <span className="block truncate text-xs text-muted-foreground">{r.detalhe}</span>
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
