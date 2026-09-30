"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { APOIO_DA_BARRA, ITEM_DA_BARRA, SUPERFICIE_DA_BARRA } from "@/components/layout/superficie-da-barra"
import { useRouter } from "next/navigation"
import { ChevronDown, MoreHorizontal } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { NavSection } from "./nav-config"
import type { QuickCreateAction } from "./quick-create"

/**
 * O cabeçalho de um bloco da barra lateral: a PALAVRA do bloco e o `+` que
 * cria o que mora nele (28/08/2026).
 *
 * Os blocos eram separados só por uma linha desde 22/08/2026, quando os
 * rótulos saíram por custarem uma linha de altura cada sem dizer nada de novo.
 * Voltaram porque agora a linha do rótulo faz TRABALHO: é onde fica o `+` de
 * criação dos módulos daquele bloco — "novo aluno" a um clique de Alunos, em
 * vez de a dois cliques no `+` global do cabeçalho, que lista os treze.
 *
 * ⚠️ Some inteiro com a barra RECOLHIDA (o padrão): num trilho de 3.5rem não
 * cabe palavra nem botão. Lá a divisória continua sendo o que separa os
 * blocos — por isso ela não foi apagada, só passou a valer só no modo ícone.
 */
export function NavSectionHeader({
  label,
  acoes,
  recolhido,
  onAlternar,
}: {
  label: string
  acoes: QuickCreateAction[]
  /** Com os dois, aparece o botão de MINIMIZAR o bloco (21/09/2026). */
  recolhido?: boolean
  onAlternar?: () => void
}) {
  const router = useRouter()
  const [aberto, setAberto] = React.useState(false)

  return (
    /* 21/09/2026 (pedido do Arthur): a linha usa a largura inteira da barra —
       rótulo um pouco maior, ações encostadas na borda direita. Ícone ao lado
       do rótulo foi tentado e saiu no mesmo dia: poluía a barra. */
    <div className="flex h-8 items-center justify-between gap-2 pl-2 pr-1 group-data-[collapsible=icon]:hidden">
      <span className="flex min-w-0 items-center gap-2 text-xs font-bold text-sidebar-foreground/60">
        <span className="truncate">{label}</span>
      </span>

      <div className="flex shrink-0 items-center gap-0.5">
      {/* Sem nada para criar (permissão), o botão não aparece — um `+` que
          abre uma lista vazia é pior do que não ter botão. */}
      {acoes.length > 0 && (
        <Popover open={aberto} onOpenChange={setAberto}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Criar em ${label}`}
              /* ⚠️ SEM FUNDO (28/08/2026, pedido do Arthur): o `+` fica na
                 linha do rótulo da seção, que é o texto mais fraco da barra,
                 e um quadrado preenchido ao lado dele pesava mais que o
                 próprio nome do bloco. O realce agora é só a cor do ícone,
                 que acende no hover e enquanto o painel está aberto. */
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground data-[state=open]:text-sidebar-foreground"
            >
              {/* ⚠️ TRÊS PONTINHOS, não o `+` (30/08/2026, pedido do
                  Arthur): o `+` prometia criar com UM clique e o que ele abre
                  é um menu de atalhos — é o mesmo gesto do menu de linha das
                  tabelas, e agora o mesmo ícone. */}
              <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
            </button>
          </PopoverTrigger>

          {/* Abre AO LADO da barra, não por baixo: a barra é estreita e um
              painel para baixo cobriria os próprios módulos do bloco. */}
          <PopoverContent
            side="right"
            align="start"
            className={cn("w-64 p-1", SUPERFICIE_DA_BARRA)}
          >
            {/* Cada item LEVA para a página de criação; nada é criado a partir
                daqui. É a mesma regra do `+` do cabeçalho — formulário atrás de
                atalho é uma segunda porta para a mesma coisa. */}
            {acoes.map(({ label: titulo, description, href, icon: Icon }) => (
              <button
                key={href}
                type="button"
                onClick={() => {
                  setAberto(false)
                  router.push(href)
                }}
                /* ⚠️ Tokens da BARRA: o painel é `SUPERFICIE_DA_BARRA`, e
                   `hover:bg-accent`/`text-muted-foreground` são da página —
                   erram a cor aqui nos dois temas. */
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                  ITEM_DA_BARRA
                )}
              >
                <Icon
                  className={cn("mt-0.5 h-4 w-4 shrink-0", APOIO_DA_BARRA)}
                  strokeWidth={1.5}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{titulo}</span>
                  <span className={cn("block truncate text-xs", APOIO_DA_BARRA)}>
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      )}
      {/* MINIMIZAR o bloco (21/09/2026, pedido do Arthur), ao lado dos três
          pontinhos. A seta aponta para baixo aberto e gira fechado. */}
      {onAlternar && (
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={!recolhido}
          aria-label={recolhido ? `Mostrar ${label}` : `Minimizar ${label}`}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              recolhido && "-rotate-90"
            )}
            strokeWidth={2}
          />
        </button>
      )}
      </div>
    </div>
  )
}

/**
 * Os atalhos de criação que pertencem a um bloco.
 *
 * Casa pela ROTA (o atalho "Novo aluno" mora em `/painel/alunos/cadastro`,
 * dentro do módulo `/painel/alunos`), e não por uma lista paralela: um mapa
 * escrito à mão divergiria no primeiro módulo novo, e o sintoma seria um `+`
 * que não oferece o que está logo abaixo dele.
 *
 * ⚠️ Função PURA, recebendo os atalhos já filtrados por permissão. Um hook
 * aqui seria chamado dentro do `.map` das seções — e a lista de seções muda de
 * tamanho conforme a permissão, o que quebra as regras de hooks.
 *
 * ⚠️ `/painel` (o Dashboard) é ignorado: como prefixo de todas as rotas, ele
 * puxaria os treze atalhos para o primeiro bloco.
 */
export function acoesDaSecao(
  section: NavSection,
  acoes: QuickCreateAction[]
): QuickCreateAction[] {
  const rotas: string[] = []
  for (const item of section.items) {
    for (const url of [item.url, ...(item.activeOn ?? [])]) {
      if (url !== "/painel") rotas.push(url)
    }
    for (const filho of item.items ?? []) {
      if (filho.url !== "/painel") rotas.push(filho.url)
    }
  }
  return acoes.filter((a) =>
    rotas.some((url) => { const h = a.href.split("?")[0]; return h === url || h.startsWith(url + "/") })
  )
}
