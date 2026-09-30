"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ChevronRight, Pin, PinOff } from "lucide-react"

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import {
  APOIO_DA_BARRA,
  ITEM_DA_BARRA,
  SUPERFICIE_DA_BARRA,
} from "@/components/layout/superficie-da-barra"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavLink, isModuloAberto, isNavItemActive } from "./nav-config"
import { useBarraStore } from "@/store/barra-store"

/** Abre rápido, fecha devagar: o cursor precisa atravessar até o painel. */
const ABRIR_MS = 80
const FECHAR_MS = 160

/**
 * Um módulo da barra e seus sub-itens, em **painel lateral** (flyout).
 *
 * Desde 21/08/2026 os sub-itens não moram mais na barra: com todos visíveis a
 * lista dava ~18 linhas contra ~695px de altura útil, e a rolagem existia
 * SEMPRE — inclusive com tudo fechado, que é o oposto do que a barra deveria
 * comunicar. Agora a barra mostra só os módulos (9 linhas, nunca rola) e os
 * sub-itens aparecem ao lado, sobre o conteúdo.
 *
 * **Hover com atraso nos dois lados**, e não um `HoverCard`: o pacote não está
 * instalado, e o `Popover` (que está) resolve em modo controlado. O atraso para
 * FECHAR é o que permite tirar o cursor da linha e entrar no painel sem ele
 * sumir no caminho — sem isso, o menu é impossível de usar.
 *
 * **No celular não há flyout**: lá a barra é uma folha lateral, hover não
 * existe e o toque no módulo tem que navegar. Os sub-itens voltam a ser
 * inline, como eram.
 */
export function NavModule({
  item,
  pathname,
  discreto = false,
}: {
  item: NavLink
  pathname: string
  /**
   * A forma do RODAPÉ: linha menor e em tom mais baixo, igual a Histórico e
   * Configurações (30/08/2026, pedido do Arthur).
   *
   * ⚠️ Estrutura mora no rodapé mas continua sendo um MÓDULO — precisa do
   * flyout de sub-itens. Sem esta prop ela ficaria com o peso dos módulos da
   * lista, e o rodapé teria duas alturas de linha.
   */
  discreto?: boolean
}) {
  const { isMobile, state } = useSidebar()
  const fixado = useBarraStore((st) => st.fixados.includes(item.url))
  const alternarFixado = useBarraStore((st) => st.alternarFixado)
  const [aberto, setAberto] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const subItens = item.items ?? []
  const Icon = item.icon
  const ativo = isNavItemActive(item.url, pathname, item.exact)
  // O pai acende também quando um filho está ativo — senão, na grade, nada na
  // barra indicaria o módulo.
  const dentro = isModuloAberto(item, pathname)

  const agendar = React.useCallback((valor: boolean, ms: number) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setAberto(valor), ms)
  }, [])

  // Trocar de rota fecha o painel: sem isso ele fica aberto sobre a tela nova.
  React.useEffect(() => {
    setAberto(false)
  }, [pathname])

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  /**
   * O PINO (30/08/2026) — fixa o módulo no topo da barra.
   *
   * ⚠️ Só aparece no HOVER e com a barra ABERTA: no trilho de 3.5rem não há
   * onde pôr um segundo alvo de clique, e um pino visível em nove linhas
   * ganharia mais peso que os próprios módulos.
   *
   * ⚠️ `preventDefault` + `stopPropagation`: ele vive DENTRO do `<Link>` do
   * módulo (é o único jeito de ficar na linha sem quebrar o `SidebarMenuButton`
   * com `asChild`), e sem os dois o clique navegaria em vez de fixar.
   */
  const pino = !isMobile && (
    <span
      role="button"
      tabIndex={-1}
      aria-label={fixado ? `Desafixar ${item.title}` : `Fixar ${item.title}`}
      title={fixado ? "Desafixar" : "Fixar no topo"}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        alternarFixado(item.url)
      }}
      className={cn(
        "ml-1 hidden shrink-0 rounded p-0.5 text-sidebar-foreground/40 transition-colors hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden",
        /* Fixado, ele fica SEMPRE visível — é o que diz por que o módulo está
           lá em cima. Não fixado, só no hover da linha. */
        fixado ? "md:inline-flex" : "md:group-hover/menu-item:inline-flex"
      )}
    >
      {fixado ? (
        <PinOff className="h-3 w-3" strokeWidth={2} />
      ) : (
        <Pin className="h-3 w-3" strokeWidth={2} />
      )}
    </span>
  )

  const linha = (
    <SidebarMenuButton
      asChild
      tooltip={item.title}
      isActive={ativo || dentro}
      size={discreto ? "sm" : "default"}
      className={cn(
        discreto && "text-sidebar-foreground/70 hover:text-sidebar-foreground"
      )}
    >
      <Link href={item.url}>
        <Icon className={cn("h-4 w-4", item.cor)} strokeWidth={2} />
        <span>{item.title}</span>

        {/* ⚠️ Pino e chevron andam JUNTOS, num bloco com `ml-auto`: com o
            `ml-auto` no chevron, o pino ficava colado ao nome do módulo e a
            linha tinha dois pontos de peso; com ele no pino, o chevron pulava
            de lugar quando o pino sumia (ele só aparece no hover). Assim os
            dois ficam à direita, e sem chevron o pino ocupa aquele lugar
            sozinho. */}
        <span className="ml-auto flex shrink-0 items-center gap-1 group-data-[collapsible=icon]:hidden">
          {pino}
          {subItens.length > 0 && (
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40"
            />
          )}
        </span>
      </Link>
    </SidebarMenuButton>
  )

  // Sem sub-itens, ou no celular: a linha simples resolve.
  if (subItens.length === 0) {
    return <SidebarMenuItem className="group/menu-item">{linha}</SidebarMenuItem>
  }

  if (isMobile) {
    return (
      <SidebarMenuItem className="group/menu-item">
        {linha}
        <SidebarMenuSub>
          {subItens.map((sub) => (
            <SubLink key={sub.url} sub={sub} pathname={pathname} />
          ))}
        </SidebarMenuSub>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem
      className="group/menu-item"
      onMouseEnter={() => agendar(true, ABRIR_MS)}
      onMouseLeave={() => agendar(false, FECHAR_MS)}
      // Teclado: focar o módulo abre o painel, senão os sub-itens seriam
      // inalcançáveis sem mouse.
      onFocus={() => agendar(true, 0)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          agendar(false, FECHAR_MS)
        }
      }}
    >
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverAnchor asChild>{linha}</PopoverAnchor>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={state === "collapsed" ? 8 : 4}
          // `onOpenAutoFocus` bloqueado: abrir por hover NÃO pode roubar o
          // foco de onde a pessoa está digitando.
          onOpenAutoFocus={(e) => e.preventDefault()}
          onMouseEnter={() => agendar(true, 0)}
          onMouseLeave={() => agendar(false, FECHAR_MS)}
          /*
            ⚠️ **CORES DE POPOVER DA PÁGINA**, e não as da barra (28/08/2026).

            Ele usava `bg-sidebar` — literalmente a cor da barra — e por isso
            sumia ao abrir por cima dela: o painel encostava no trilho e não
            havia divisa entre os dois. Valia nos DOIS temas, porque a barra
            inverte junto (preta no claro, branca no escuro) e o painel a
            acompanhava.

            ⚠️ Consequência: os itens de dentro NÃO podem mais usar os tokens
            `--sidebar-*` (eles erram a cor sobre esta superfície) — usam
            `accent`/`muted-foreground`, que são da página.
          */
          className={cn("w-64 p-1.5", SUPERFICIE_DA_BARRA)}
        >
          {/* Cabeçalho do painel: nome do módulo e uma linha dizendo o que ele
              resolve. O espaço já estava aberto — a legenda em caixa alta só
              repetia o nome que a pessoa acabou de apontar. */}
          <div className="border-sidebar-border border-b px-2 pb-2 pt-1">
            <p className="truncate text-sm font-semibold">{item.title}</p>
            {item.description && (
              <p className={cn("mt-0.5 text-xs leading-snug", APOIO_DA_BARRA)}>
                {item.description}
              </p>
            )}
          </div>
          <ul className="space-y-0.5 pt-1.5">
            {subItens.map((sub) => {
              const SubIcon = sub.icon
              const subAtivo = isNavItemActive(sub.url, pathname, sub.exact)
              return (
                <li key={sub.url}>
                  <Link
                    href={sub.url}
                    className={cn(
                      /* ⚠️ Tokens `--sidebar-*` (29/08/2026): o painel voltou
                         à cor da BARRA, e `accent`/`muted-foreground` são da
                         PÁGINA — erram a cor nos dois temas. */
                      "flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors",
                      ITEM_DA_BARRA,
                      subAtivo
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : APOIO_DA_BARRA
                    )}
                  >
                    {/* `mt-0.5` alinha o ícone com a PRIMEIRA linha do texto —
                        com a descrição embaixo, centralizar deixaria o ícone
                        flutuando no meio do bloco. */}
                    <SubIcon
                      className="mt-0.5 h-4 w-4 shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="min-w-0">
                      <span
                        className={
                          "block truncate text-sm " +
                          (subAtivo ? "font-medium" : "")
                        }
                      >
                        {sub.title}
                      </span>
                      {/* O que a tela faz, numa linha. Quem já conhece o menu
                          lê só o título; quem não conhece não precisa entrar
                          para descobrir. */}
                      {sub.description && (
                        <span className={cn("mt-0.5 block text-xs leading-snug", APOIO_DA_BARRA)}>
                          {sub.description}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  )
}

/** Sub-item inline — só o celular usa. */
function SubLink({
  sub,
  pathname,
}: {
  sub: NavLink
  pathname: string
}) {
  const SubIcon = sub.icon
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        isActive={isNavItemActive(sub.url, pathname, sub.exact)}
      >
        <Link href={sub.url}>
          <SubIcon className="h-4 w-4" strokeWidth={1.5} />
          <span>{sub.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}
