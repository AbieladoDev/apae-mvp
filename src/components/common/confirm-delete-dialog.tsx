"use client"

import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Título do diálogo — ex.: "Remover serviço". */
  title: string
  /** Explicação do efeito da remoção. Aceita JSX para destacar o nome. */
  description: React.ReactNode
  /**
   * Aviso que bloqueia a remoção (ex.: grupo com funcionários vinculados).
   * Quando presente, o botão de confirmar fica desabilitado.
   */
  blockedReason?: React.ReactNode
  onConfirm: () => void
  isLoading?: boolean
  /** Rótulo do botão destrutivo. Padrão: "Remover". */
  confirmLabel?: string
}

/**
 * Confirmação de remoção — um único diálogo para todos os cadastros.
 * Só o texto muda entre serviço, produto, cliente, funcionário etc.; manter
 * seis cópias fazia cada ajuste de layout virar seis edições.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  blockedReason,
  onConfirm,
  isLoading = false,
  confirmLabel = "Remover",
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {blockedReason && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{blockedReason}</p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading || Boolean(blockedReason)}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
