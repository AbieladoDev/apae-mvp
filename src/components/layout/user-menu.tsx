"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronsUpDown, LogOut, RotateCcw, UserRoundCog } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { APOIO_DA_BARRA, ITEM_DA_BARRA, SUPERFICIE_DA_BARRA } from "@/components/layout/superficie-da-barra"
import { PERFIL_LABEL, USUARIOS } from "@/data/catalogo"
import type { Perfil } from "@/data/tipos"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo-store"
import { useSessao, useUsuario } from "@/store/sessao-store"

/**
 * O usuário no rodapé da barra. Na demo ele também é o lugar de TROCAR DE
 * PERFIL — é o que permite mostrar o fluxo de compras de ponta a ponta sem
 * voltar ao login — e de restaurar os dados de demonstração.
 */
export function UserMenu() {
  const router = useRouter()
  const usuario = useUsuario()
  const entrar = useSessao((s) => s.entrar)
  const sair = useSessao((s) => s.sair)
  const restaurar = useDemo((s) => s.restaurar)
  const [aberto, setAberto] = React.useState(false)

  if (!usuario) return null

  const linha = cn("flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors text-sidebar-foreground/80", ITEM_DA_BARRA)

  function trocar(p: Perfil) {
    setAberto(false)
    entrar(p)
    toast.success(`Agora você é ${USUARIOS[p].nome} (${PERFIL_LABEL[p]})`)
    router.push("/painel")
  }

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <SidebarMenuButton size="lg" tooltip={usuario.nome} className="data-[state=open]:bg-sidebar-accent">
          <Avatar className="h-8 w-8 shrink-0 rounded-full group-data-[collapsible=icon]:mx-auto">
            <AvatarFallback className="rounded-full bg-girassol text-xs font-extrabold text-sidebar">
              {getInitials(usuario.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold">{usuario.nome}</span>
            <span className="truncate text-xs text-sidebar-foreground/60">{usuario.cargo}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" sideOffset={8} className={cn("w-72 p-1", SUPERFICIE_DA_BARRA)}>
        <div className="px-2 py-2">
          <p className="truncate text-sm font-bold">{usuario.nome}</p>
          <p className={cn("truncate text-xs", APOIO_DA_BARRA)}>{usuario.email}</p>
        </div>
        <div className="my-1 h-px bg-sidebar-border" />
        <p className={cn("px-2 pb-1 pt-1.5 text-xs font-bold", APOIO_DA_BARRA)}>Ver a demo como</p>
        {(Object.keys(USUARIOS) as Perfil[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => trocar(p)}
            className={cn(linha, p === usuario.perfil && "bg-sidebar-accent text-sidebar-accent-foreground")}
          >
            <UserRoundCog className="h-4 w-4" strokeWidth={1.75} />
            <span className="min-w-0 flex-1 truncate text-left">{USUARIOS[p].nome}</span>
            <span className={cn("text-xs", APOIO_DA_BARRA)}>{PERFIL_LABEL[p]}</span>
          </button>
        ))}
        <div className="my-1 h-px bg-sidebar-border" />
        <button
          type="button"
          onClick={() => {
            restaurar()
            setAberto(false)
            toast.success("Dados de demonstração restaurados")
          }}
          className={linha}
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          Restaurar dados de demonstração
        </button>
        <button
          type="button"
          onClick={() => {
            sair()
            router.push("/login")
          }}
          className={cn(linha, "text-rose-200 hover:text-rose-100")}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Sair
        </button>
      </PopoverContent>
    </Popover>
  )
}
