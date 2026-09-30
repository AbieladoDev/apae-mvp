"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MODULOS } from "@/lib/modulos"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useSessao, useUsuario } from "@/store/sessao-store"
import { isNavItemActive, useFilteredNavigation } from "./nav-config"

/** O menu completo no celular: todos os módulos do perfil, em grade. */
export function MobileMenuSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const usuario = useUsuario()
  const sair = useSessao((s) => s.sair)
  const itens = [
    ...useFilteredNavigation().flatMap((s) => s.items),
    { title: MODULOS.historico.titulo, url: MODULOS.historico.url, icon: MODULOS.historico.icone },
    { title: MODULOS.notificacoes.titulo, url: MODULOS.notificacoes.url, icon: MODULOS.notificacoes.icone },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] gap-0 overflow-y-auto rounded-t-3xl px-4 pb-6">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Módulos do painel</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border bg-card p-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-girassol font-extrabold text-sidebar">{getInitials(usuario?.nome ?? "")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{usuario?.nome}</p>
            <p className="truncate text-xs text-muted-foreground">{usuario?.cargo}</p>
          </div>
          <button
            onClick={() => {
              onOpenChange(false)
              sair()
              router.push("/login")
            }}
            className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold text-rose-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {itens.map((item) => {
            const Icone = item.icon
            const ativo = isNavItemActive(item.url, pathname)
            return (
              <Link
                key={item.url}
                href={item.url}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex h-[76px] flex-col items-center justify-center gap-1.5 rounded-xl px-1 text-center text-[11px] font-bold leading-tight",
                  ativo ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icone className="h-5 w-5" />
                <span className="line-clamp-2">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
