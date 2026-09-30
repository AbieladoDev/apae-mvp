"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Menu, Plus, ShoppingCart, Wallet, X } from "lucide-react"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { MobileMenuSheet } from "./mobile-menu-sheet"
import { useQuickCreateActions } from "./quick-create"
import { useFilteredNavigation } from "./nav-config"

/** Barra de baixo do celular: Início · Compras · [+] · Contas · Menu. */
export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const acoes = useQuickCreateActions()
  const nav = useFilteredNavigation().flatMap((s) => s.items)
  const [criarAberto, setCriarAberto] = React.useState(false)
  const [menuAberto, setMenuAberto] = React.useState(false)

  const itens = [
    { label: "Início", href: "/painel", icon: Home },
    { label: "Compras", href: "/painel/compras", icon: ShoppingCart },
    { label: "Contas", href: "/painel/contas-a-pagar", icon: Wallet },
  ].filter((i) => i.href === "/painel" || nav.some((n) => n.url === i.href))

  const ativo = (href: string) => (href === "/painel" ? pathname === "/painel" : pathname.startsWith(href))

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="absolute inset-0 border-t bg-card/90 backdrop-blur-lg" />
        <div className="relative flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {itens.slice(0, 2).map((i) => (
            <Botao key={i.href} {...i} ativo={ativo(i.href)} />
          ))}
          <div className="-mt-2 flex flex-col items-center">
            <button
              onClick={() => setCriarAberto(true)}
              aria-label="Criar"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-girassol text-sidebar shadow-md transition-transform active:scale-95"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <span className="mt-0.5 text-[10px] text-muted-foreground">Criar</span>
          </div>
          {itens.slice(2).map((i) => (
            <Botao key={i.href} {...i} ativo={ativo(i.href)} />
          ))}
          <button onClick={() => setMenuAberto((v) => !v)} className="flex min-w-[60px] flex-col items-center justify-center px-3 py-2">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", menuAberto ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
              {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">Menu</span>
          </button>
        </div>
      </nav>

      <Sheet open={criarAberto} onOpenChange={setCriarAberto}>
        <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-6">
          <SheetHeader className="px-0">
            <SheetTitle>Criar</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2.5">
            {acoes.map((a) => {
              const Icone = a.icon
              return (
                <button
                  key={a.href}
                  onClick={() => {
                    setCriarAberto(false)
                    router.push(a.href)
                  }}
                  className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center"
                >
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", a.color)}>
                    <Icone className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold">{a.label}</span>
                </button>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>

      <MobileMenuSheet open={menuAberto} onOpenChange={setMenuAberto} />
    </>
  )
}

function Botao({ label, href, icon: Icone, ativo }: { label: string; href: string; icon: React.ElementType; ativo: boolean }) {
  return (
    <Link href={href} className="flex min-w-[60px] flex-col items-center justify-center px-3 py-2">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", ativo ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
        <Icone className="h-5 w-5" />
      </span>
      <span className={cn("mt-0.5 text-[10px]", ativo ? "font-bold text-primary" : "text-muted-foreground")}>{label}</span>
    </Link>
  )
}
