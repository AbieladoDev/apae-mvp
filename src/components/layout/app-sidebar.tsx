"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { MODULOS } from "@/lib/modulos"
import { usePode } from "@/store/sessao-store"
import { useFilteredNavigation } from "./nav-config"
import { acoesDaSecao, NavSectionHeader } from "./nav-section-header"
import { useQuickCreateActions } from "./quick-create"
import { NavModule } from "./nav-module"
import { useBarraStore } from "@/store/barra-store"
import { UserMenu } from "./user-menu"
import { useNotificacoes } from "./notification-list"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const filteredNavigation = useFilteredNavigation()
  const fixados = useBarraStore((s) => s.fixados)
  const recolhidos = useBarraStore((s) => s.recolhidos)
  const alternarRecolhido = useBarraStore((s) => s.alternarRecolhido)
  const quickCreate = useQuickCreateActions()
  const podeVerHistorico = usePode("historico.ler")
  const { naoLidas } = useNotificacoes()

  const modulosFixados = React.useMemo(() => {
    const todos = filteredNavigation.flatMap((sec) => sec.items)
    return fixados.map((url) => todos.find((i) => i.url === url)).filter((i): i is (typeof todos)[number] => !!i)
  }, [filteredNavigation, fixados])

  const navegacao = React.useMemo(
    () =>
      filteredNavigation
        .map((sec) => ({ ...sec, items: sec.items.filter((i) => !fixados.includes(i.url)) }))
        .filter((sec) => sec.items.length > 0),
    [filteredNavigation, fixados]
  )

  const rodape = [
    ...(podeVerHistorico ? [MODULOS.historico] : []),
    MODULOS.notificacoes,
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
        <Link
          href="/painel"
          title="APAE Esteio"
          className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
        >
          <span className="shrink-0 rounded-xl bg-white p-0.5">
            <Image src="/logo.jpeg" alt="APAE Esteio" width={40} height={40} className="h-10 w-10 rounded-[10px] object-contain group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-sm font-extrabold">APAE Esteio</span>
            <span className="block truncate text-xs text-sidebar-foreground/60">Associação de Pais e Amigos</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="min-h-0 flex-1 overflow-y-auto px-2 py-2 group-data-[collapsible=icon]:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {modulosFixados.length > 0 && (
          <SidebarGroup className="py-1 group-data-[collapsible=icon]:px-0">
            <NavSectionHeader label="Fixados" acoes={[]} />
            <SidebarGroupContent>
              <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                {modulosFixados.map((item) => (
                  <NavModule key={`fixado-${item.url}`} item={item} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {navegacao.map((section, index) => (
          <SidebarGroup
            key={section.label ?? `section-${index}`}
            className={cn(
              "py-1 group-data-[collapsible=icon]:px-0",
              (index > 0 || modulosFixados.length > 0) &&
                "mt-1 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:border-t group-data-[collapsible=icon]:border-sidebar-border group-data-[collapsible=icon]:pt-2"
            )}
          >
            {section.label && (
              <NavSectionHeader
                label={section.label}
                acoes={acoesDaSecao(section, quickCreate)}
                recolhido={recolhidos.includes(section.label)}
                onAlternar={() => alternarRecolhido(section.label!)}
              />
            )}
            <SidebarGroupContent
              className={cn(section.label && recolhidos.includes(section.label) && "hidden group-data-[collapsible=icon]:block")}
            >
              <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                {section.items.map((item) => (
                  <NavModule key={item.url} item={item} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-0 p-2 group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="border-t border-sidebar-border pt-2 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:items-center">
          {rodape.map((m) => {
            const Icone = m.icone
            return (
              <SidebarMenuItem key={m.url}>
                <SidebarMenuButton
                  asChild
                  size="sm"
                  tooltip={m.titulo}
                  isActive={pathname.startsWith(m.url)}
                  className="text-sidebar-foreground/75 hover:text-sidebar-foreground"
                >
                  <Link href={m.url}>
                    <Icone className="h-4 w-4" strokeWidth={1.75} />
                    <span>{m.titulo}</span>
                    {m.url === MODULOS.notificacoes.url && naoLidas > 0 && (
                      <span className="ml-auto rounded-full bg-girassol px-1.5 text-[10px] font-bold text-sidebar tabular-nums group-data-[collapsible=icon]:hidden">
                        {naoLidas}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
        <SidebarMenu className="mt-2 border-t border-sidebar-border pt-2 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
