"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * Uma acao SECUNDARIA do cabecalho de uma ficha: so o icone, com o rotulo no
 * tooltip (28/08/2026).
 *
 * ## Por que ela existe
 *
 * A ficha do aluno tinha SETE acoes com texto ("Matricular em modalidade",
 * "Editar mensalidade", "Tambem e funcionario"...). Em 1920 cabem numa linha;
 * em **1440 com a barra expandida, e em qualquer coisa abaixo de 1400**, elas
 * quebram em duas linhas e comem ~44px de altura util em TODA a ficha.
 *
 * Conferido no navegador em 28/08/2026, a pedido do Arthur: a 1366 com a barra
 * expandida a fila quebrava e o nome do aluno ia para tres linhas; a 1280, duas
 * abas ficavam fora da vista.
 *
 * ⚠️ **A saida NAO foi diminuir a fonte.** Reduzir a base do painel de 14 para
 * 13px devolveria ~7% de largura — faltavam ~15% — e deixaria o sistema inteiro
 * mais dificil de ler para consertar uma linha.
 *
 * ⚠️ **Editar e Remover continuam COM TEXTO.** Sao as duas que se procuram sem
 * saber o nome; as outras cinco sao especificas, e quem as usa ja sabe onde
 * ficam. Um cabecalho so de icones vira adivinhacao.
 *
 * ⚠️ **O tooltip nao e enfeite**: e o unico lugar onde o rotulo existe. Acao
 * nova aqui sem `rotulo` e um botao que ninguem sabe o que faz.
 */
export function AcaoIcone({
  icone: Icone,
  rotulo,
  onClick,
  destrutivo = false,
  className,
}: {
  icone: React.ComponentType<{ className?: string }>
  rotulo: string
  onClick: () => void
  destrutivo?: boolean
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "size-8",
            destrutivo &&
              "text-destructive hover:bg-destructive/10 hover:text-destructive",
            className,
          )}
          aria-label={rotulo}
          onClick={onClick}
        >
          <Icone className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  )
}
