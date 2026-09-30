"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { BottomNav } from "./bottom-nav"
import { useSessao } from "@/store/sessao-store"

/**
 * A casca do painel — cabeçalho, barra lateral e a janela de conteúdo.
 * Montada UMA vez em `app/painel/layout.tsx` (mesmo desenho da TodosDan: trocar
 * de rota não desmonta a barra, então a navegação não pisca).
 *
 * ⚠️ Só renderiza depois de montar no navegador: os dados vêm do localStorage
 * (zustand persist) e as datas são relativas a "hoje". Renderizar no servidor
 * daria diferença de hidratação em toda tela.
 */
export function PainelShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const perfil = useSessao((s) => s.perfil)
  const [montado, setMontado] = React.useState(false)

  React.useEffect(() => setMontado(true), [])
  React.useEffect(() => {
    if (montado && !perfil) router.replace("/login")
  }, [montado, perfil, router])

  if (!montado || !perfil) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider
      defaultOpen
      className="flex-col"
      style={{ "--app-header-h": "3rem" } as React.CSSProperties}
    >
      <AppHeader />
      <div className="flex min-h-0 w-full flex-1 bg-sidebar">
        <AppSidebar />
        <SidebarInset className="overflow-hidden md:mt-2 md:ml-2 md:rounded-tl-2xl md:border-t md:border-l">
          {children}
        </SidebarInset>
      </div>
      <BottomNav />
    </SidebarProvider>
  )
}
