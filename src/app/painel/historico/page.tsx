"use client"

import * as React from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuditTimeline } from "@/components/audit/audit-timeline"
import { ENTIDADE_LABEL } from "@/components/audit/audit-entity-route"
import { classeFiltroSelect } from "@/components/common/filtro-chips"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard } from "@/components/apae/comum"
import type { Entidade } from "@/data/tipos"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"

export default function Page() {
  return (
    <Guard permissao="historico.ler" titulo="Histórico">
      <Historico />
    </Guard>
  )
}

/** Tudo o que foi feito no painel, por quem e quando — a mesma linha do tempo da TodosDan. */
function Historico() {
  const auditoria = useDemo((s) => s.auditoria)
  const [pessoa, setPessoa] = React.useState("todas")
  const [modulo, setModulo] = React.useState("todos")
  const pessoas = Array.from(new Set(auditoria.map((a) => a.usuario))).sort()
  const lista = auditoria
    .filter((a) => (pessoa === "todas" || a.usuario === pessoa) && (modulo === "todos" || a.entidade === modulo))
    .sort((a, b) => b.data.localeCompare(a.data))

  return (
    <DashboardLayout
      title="Histórico"
      description="Quem fez o quê, e quando — cada criação, alteração, aprovação e movimentação"
      toolbar={
        <div className="flex flex-wrap gap-2">
          <Select value={pessoa} onValueChange={setPessoa}>
            <SelectTrigger size="sm" className={cn("w-48", classeFiltroSelect(pessoa !== "todas"))}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as pessoas</SelectItem>
              {pessoas.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={modulo} onValueChange={setModulo}>
            <SelectTrigger size="sm" className={cn("w-48", classeFiltroSelect(modulo !== "todos"))}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os módulos</SelectItem>
              {(Object.keys(ENTIDADE_LABEL) as Entidade[]).map((e) => (
                <SelectItem key={e} value={e}>
                  {ENTIDADE_LABEL[e]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-5">
        <AuditTimeline entries={lista} mostrarEntidade vazio="Nada registrado com esses filtros." />
      </div>
    </DashboardLayout>
  )
}
