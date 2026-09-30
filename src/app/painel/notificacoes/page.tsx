"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ListaNotificacoes, useNotificacoes } from "@/components/layout/notification-list"

export default function Page() {
  const estado = useNotificacoes()
  return (
    <DashboardLayout title="Notificações" description="Avisos para o seu perfil: solicitações, aprovações, compras, contas e estoque">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-card">
        <ListaNotificacoes variante="pagina" estado={estado} />
      </div>
    </DashboardLayout>
  )
}
