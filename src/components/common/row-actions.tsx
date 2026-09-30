"use client"

import { MoreHorizontal, type LucideIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface RowAction {
  label: string
  icon: LucideIcon
  onSelect: () => void
  /** Ação de remoção: sai em vermelho e abaixo de um separador. */
  destructive?: boolean
  /** Oculta o item (ex.: sem permissão). Mais legível que `cond && {...}`. */
  hidden?: boolean
}

interface RowActionsProps {
  actions: RowAction[]
  /** Largura do menu. Padrão: `w-40`. */
  className?: string
}

/**
 * Menu "..." das linhas de tabela.
 *
 * Cada cadastro tinha sua própria cópia deste dropdown, e elas já divergiam
 * entre si (separador aparecendo sem item acima, por exemplo). O separador
 * aqui é derivado: só existe quando há item normal E item destrutivo.
 */
export function RowActions({ actions, className }: RowActionsProps) {
  const visible = actions.filter((action) => !action.hidden)
  if (visible.length === 0) return null

  const normal = visible.filter((action) => !action.destructive)
  const destructive = visible.filter((action) => action.destructive)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Ações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-40", className)}>
        {normal.map((action) => (
          <ActionItem key={action.label} action={action} />
        ))}
        {normal.length > 0 && destructive.length > 0 && (
          <DropdownMenuSeparator />
        )}
        {destructive.map((action) => (
          <ActionItem key={action.label} action={action} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ActionItem({ action }: { action: RowAction }) {
  const Icon = action.icon
  return (
    <DropdownMenuItem
      onClick={action.onSelect}
      className={cn(
        action.destructive && "text-destructive focus:text-destructive"
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      {action.label}
    </DropdownMenuItem>
  )
}
