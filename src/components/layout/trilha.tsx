"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { moduloDaRota } from "./nav-config"

export interface DegrauDaTrilha {
  title: string
  url: string
}

/**
 * "Onde estou e por onde vim" — os degraus anteriores são links, o atual é uma
 * pastilha.
 *
 * Estava inline no `DashboardLayout` até 27/08/2026, quando Configurações
 * passou a precisar dela **dentro** do próprio conteúdo: lá a coluna de seções
 * sobe até o topo, então uma trilha na faixa do layout passaria por cima dela
 * e a coluna começaria abaixo de um cabeçalho que não é dela.
 *
 * ⚠️ A pastilha do fim NÃO é link. É o que separa "onde estou" de "por onde
 * vim" — um link para a página em que já se está é um clique que não faz nada.
 */
export function Trilha({
  degraus,
  atual,
  className,
}: {
  /** Os degraus ANTES do atual, na ordem. */
  degraus: DegrauDaTrilha[]
  /** A tela em que se está. Vira a pastilha do fim. */
  atual: string
  className?: string
}) {
  return (
    <nav
      aria-label="Trilha"
      className={cn(
        "flex min-w-0 items-center gap-1 text-xs text-muted-foreground",
        className
      )}
    >
      {degraus.map((degrau) => (
        <div key={degrau.url} className="flex shrink-0 items-center gap-1">
          <Link
            href={degrau.url}
            className="transition-colors hover:text-foreground"
          >
            {degrau.title}
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
        </div>
      ))}
      <span className="truncate rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
        {atual}
      </span>
    </nav>
  )
}

/**
 * Os degraus ANTES da tela atual, para uma rota.
 *
 * ⚠️ **Deduplicado por url.** Tela cujo módulo É o Dashboard — o Relatório,
 * que é sub-item dele — produzia "Início › Dashboard", e os dois degraus têm a
 * mesma `url` (`/painel`): além de repetir a palavra, o React reclamava de
 * duas chaves iguais no `map`.
 *
 * ⚠️ `extra` existe para o módulo que **não está em `navSections`**:
 * Configurações vive no rodapé da barra lateral, então `moduloDaRota` devolve
 * `null` e a trilha pularia o meio.
 */
export function degrausDaRota(
  pathname: string,
  extra?: DegrauDaTrilha
): DegrauDaTrilha[] {
  const modulo = moduloDaRota(pathname)
  const todos = [
    ...(pathname === "/painel" ? [] : [{ title: "Início", url: "/painel" }]),
    ...(modulo ? [modulo] : []),
    ...(extra ? [extra] : []),
  ]
  /* `findIndex` e não um `Set` acumulado: a trilha tem no máximo três degraus,
     e mutar variável de fora dentro de um `filter` é o que o React Compiler
     recusa (armadilha 27). */
  return todos.filter(
    (degrau, i) => todos.findIndex((d) => d.url === degrau.url) === i
  )
}
