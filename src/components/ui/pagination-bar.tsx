"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
export interface PageMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
  hasNext?: boolean
}

/**
 * Barra de paginação das listagens. Some quando só existe uma página — não
 * poluir a tela de quem tem poucos registros.
 */
export function PaginationBar({
  meta,
  onPageChange,
  isLoading,
}: {
  meta: PageMeta
  onPageChange: (page: number) => void
  isLoading?: boolean
}) {
  if (meta.totalPages <= 1) return null

  const from = (meta.page - 1) * meta.perPage + 1
  const to = Math.min(meta.page * meta.perPage, meta.total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        {from}–{to} de {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={isLoading || meta.page <= 1}
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          Anterior
        </Button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {meta.page} / {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={isLoading || meta.page >= meta.totalPages}
        >
          Próxima
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
