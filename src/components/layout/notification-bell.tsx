"use client"

import * as React from "react"
import Link from "next/link"
import { Bell } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SUPERFICIE_DA_BARRA } from "@/components/layout/superficie-da-barra"
import { cn } from "@/lib/utils"
import { ListaNotificacoes, useNotificacoes } from "./notification-list"

export function NotificationBell() {
  const [aberto, setAberto] = React.useState(false)
  const estado = useNotificacoes()

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notificações"
          className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground/85 transition-colors hover:bg-sidebar-foreground hover:text-sidebar"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
          {estado.naoLidas > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-girassol px-1 text-[10px] font-extrabold text-sidebar tabular-nums">
              {estado.naoLidas > 9 ? "9+" : estado.naoLidas}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className={cn("w-[22rem] p-0", SUPERFICIE_DA_BARRA)}>
        <ListaNotificacoes variante="barra" estado={estado} onNavegou={() => setAberto(false)} limite={8} />
        <Link
          href="/painel/notificacoes"
          onClick={() => setAberto(false)}
          className="block border-t border-sidebar-border px-3 py-2 text-center text-xs font-bold text-sidebar-foreground/80 hover:bg-sidebar-accent"
        >
          Ver todas
        </Link>
      </PopoverContent>
    </Popover>
  )
}
