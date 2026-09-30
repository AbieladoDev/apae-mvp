"use client"

import * as React from "react"
import { History } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Entidade } from "@/data/tipos"
import { formatDateTime } from "@/lib/format"
import { useDemo } from "@/store/demo-store"
import { usePode } from "@/store/sessao-store"
import { AuditTimeline } from "./audit-timeline"

/** "Última alteração em … por …" no pé de cada ficha, com o histórico completo num diálogo. */
export function AuditFooter({ entidade, entidadeId }: { entidade: Entidade; entidadeId: string }) {
  const pode = usePode("historico.ler")
  const auditoria = useDemo((s) => s.auditoria)
  const [aberto, setAberto] = React.useState(false)
  const historico = React.useMemo(
    () => auditoria.filter((a) => a.entidade === entidade && a.entidadeId === entidadeId),
    [auditoria, entidade, entidadeId]
  )
  const ultima = historico[0]
  if (!pode || !ultima) return null

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
      <History className="h-3.5 w-3.5" />
      <span>
        Última alteração em <span className="tabular-nums">{formatDateTime(ultima.data)}</span> por {ultima.usuario}
      </span>
      <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setAberto(true)}>
        Ver histórico
      </Button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Histórico deste registro</DialogTitle>
            <DialogDescription>O que mudou, quem mudou e quando.</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto pr-1">
            <AuditTimeline entries={historico} semLink />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
