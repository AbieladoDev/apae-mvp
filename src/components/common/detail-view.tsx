import * as React from "react"
import Link from "next/link"
import { ChevronLeft, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Layout das páginas de visualização: ocupa 100% da largura, sem cards.
 * Cabeçalho com voltar + identificação à esquerda e ações no canto direito;
 * conteúdo em seções separadas por linhas.
 */

interface DetailHeaderProps {
  /** Rota da listagem do módulo. */
  backHref: string
  backLabel: string
  title: string
  /** Linha de apoio: descrição, e-mail, período etc. */
  subtitle?: React.ReactNode
  /** Selo ao lado do título (status, badge de sistema...). */
  badge?: React.ReactNode
  /** Foto do registro, à esquerda do título. Módulos sem imagem omitem. */
  media?: React.ReactNode
  /** Botões — ficam no canto superior direito. */
  actions?: React.ReactNode
}

export function DetailHeader({
  backHref,
  backLabel,
  title,
  subtitle,
  badge,
  media,
  actions,
}: DetailHeaderProps) {
  return (
    <div className="border-b pb-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {media}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold">{title}</h2>
              {badge}
            </div>
            {subtitle && (
              <div className="mt-0.5 text-sm text-muted-foreground">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Seção de conteúdo: rótulo opcional + linhas divididas.
 *
 * O título tem o MESMO peso do `Secao` do formulário (`text-sm font-semibold`)
 * — 24/08/2026. Era `text-[11px] uppercase text-muted-foreground`, o texto mais
 * fraco da tela: quem abria a página via os dados e não via onde um assunto
 * terminava e o outro começava. Visualização e cadastro do mesmo módulo agora
 * anunciam suas partes do mesmo jeito.
 *
 * A DIVISÓRIA é da seção, não da linha. Antes era o contrário — `divide-y`
 * separava linha de linha e nada separava assunto de assunto, então a página
 * parecia uma lista só, comprida. Agora a linha entre campos é fraca
 * (`divide-border/60`) e a que separa seções é cheia (`border-t`).
 *
 * `first:border-t-0` porque a primeira seção já encosta no cabeçalho, que tem
 * borda própria: sem isso saem duas linhas coladas.
 */
export function DetailSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string
  /** Uma linha dizendo o que a seção resolve. Igual ao `Secao` do formulário. */
  description?: string
  /** Ação da própria seção ("Ver todas", "Adicionar"), no canto direito. */
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn("w-full border-t pt-5 first:border-t-0 first:pt-0", className)}
    >
      {(title || action) && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold">{title}</h3>}
            {description && (
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="divide-y divide-border/60">{children}</div>
    </section>
  )
}

/**
 * Linha rótulo/valor. O valor alinha à direita no desktop.
 *
 * O VALOR é `font-medium` e o rótulo é cinza (24/08/2026): os dois eram
 * `text-sm` no mesmo tom e o olho não sabia qual dos dois era o dado.
 */
export function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-sm font-medium sm:text-right">{children}</div>
    </div>
  )
}

/**
 * Os dois botões que TODA tela de visualização tem, com hierarquia.
 *
 * Até 24/08/2026 os dois eram `variant="outline" size="sm"`: Editar e Remover
 * tinham exatamente a mesma cara, e o destrutivo não avisava que era
 * destrutivo. Agora Editar é a ação principal (sólida) e Remover é fantasma
 * em vermelho — some do caminho até você procurar por ele.
 *
 * ⚠️ Numa tela que já tem outra ação principal (dar baixa numa despesa,
 * lançar resultado de evento), passe `variant="outline"` no Editar: dois
 * botões sólidos lado a lado não são hierarquia nenhuma.
 */
export function EditAction({
  href,
  onClick,
  label = "Editar",
  variant = "default",
  disabled,
}: {
  /** Link (o caso comum). Use `onClick` quando a tela navega com `router`. */
  href?: string
  onClick?: () => void
  label?: string
  variant?: "default" | "outline"
  disabled?: boolean
}) {
  const conteudo = (
    <>
      <Pencil className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </>
  )

  if (href) {
    return (
      <Button variant={variant} size="sm" asChild disabled={disabled}>
        <Link href={href}>{conteudo}</Link>
      </Button>
    )
  }

  return (
    <Button variant={variant} size="sm" onClick={onClick} disabled={disabled}>
      {conteudo}
    </Button>
  )
}

/** A ação destrutiva: fantasma em vermelho, longe do peso do botão principal. */
export function DeleteAction({
  onClick,
  label = "Remover",
  disabled,
}: {
  onClick: () => void
  label?: string
  disabled?: boolean
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </Button>
  )
}

/** Bolinha + texto de status ativo/inativo. */
export function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-zinc-400"
        )}
      />
      {active ? "Ativo" : "Inativo"}
    </span>
  )
}
