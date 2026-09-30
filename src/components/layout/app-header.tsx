"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LogOut, PanelLeft, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"
import { CommandSearch } from "@/components/common/command-search"
import { PERFIL_LABEL } from "@/data/catalogo"
import { cn } from "@/lib/utils"
import { useSessao, useUsuario } from "@/store/sessao-store"
import { NotificationBell } from "./notification-bell"
import { useQuickCreateActions } from "./quick-create"

/**
 * O cabeçalho global — braço de cima do layout em L (mesmo desenho da
 * TodosDan): à esquerda o perfil da demo, no centro recolher + busca, à
 * direita criar · sino · sair.
 *
 * ⚠️ A altura (`h-12`) é o `--app-header-h: 3rem` do `painel-shell.tsx`. A
 * barra lateral é `fixed` e desconta esse valor.
 */
export function AppHeader() {
  const router = useRouter()
  const { toggleSidebar } = useSidebar()
  const sair = useSessao((s) => s.sair)
  const usuario = useUsuario()
  const quickCreate = useQuickCreateActions()

  function handleLogout() {
    sair()
    router.push("/login")
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 bg-sidebar px-3 text-sidebar-foreground md:px-4">
      <div className="flex min-w-0 flex-1 basis-0 items-center">
        {usuario && (
          <span className="hidden items-center gap-2 rounded-full bg-sidebar-accent py-1 pl-1 pr-3 text-xs font-bold sm:inline-flex">
            <span className="rounded-full bg-girassol px-2 py-0.5 text-sidebar">{PERFIL_LABEL[usuario.perfil]}</span>
            <span className="truncate text-sidebar-foreground/85">{usuario.nome}</span>
          </span>
        )}
      </div>

      <div className="relative flex min-w-0 flex-[2] items-center justify-center">
        <div className="relative min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Recolher a barra lateral"
                className="absolute top-1/2 right-full mr-1.5 hidden h-8 w-8 -translate-y-1/2 shrink-0 items-center justify-center rounded-full text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground md:flex"
              >
                <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Recolher a barra</TooltipContent>
          </Tooltip>
          <CommandSearch />
        </div>
      </div>

      <div className="flex flex-1 basis-0 items-center justify-end">
        <div className="flex shrink-0 items-center gap-1.5">
          {quickCreate.length > 0 && (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Criar"
                      className={cn(BOTAO_DO_GRUPO, "bg-girassol text-sidebar hover:bg-white hover:text-sidebar data-[state=open]:bg-white")}
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">Criar</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="min-w-60">
                <DropdownMenuLabel>Criar</DropdownMenuLabel>
                {quickCreate.map(({ label, href, icon: Icon, color }) => (
                  <DropdownMenuItem key={href} onSelect={() => router.push(href)}>
                    <span className={cn("flex size-6 items-center justify-center rounded-md", color)}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <NotificationBell />

          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={handleLogout} aria-label="Sair" className={BOTAO_DO_GRUPO}>
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Sair</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}

const BOTAO_DO_GRUPO =
  "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground/85 transition-colors hover:bg-sidebar-foreground hover:text-sidebar"
