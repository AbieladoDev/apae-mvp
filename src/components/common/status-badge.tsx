import { cn } from "@/lib/utils"

/**
 * O SELO DE ESTADO das listagens — com cor, e a cor significa a mesma coisa em
 * todo módulo (28/08/2026, referência trazida pelo Arthur).
 *
 * ⚠️ **Isto abre uma exceção à decisão de 21/08/2026** ("o painel é preto e
 * branco"). A razão é a mesma que fez o dashboard ser colorido: numa lista de
 * quarenta linhas, o estado é o que se procura, e `variant="secondary"` versus
 * `variant="outline"` são dois cinzas que ninguém distingue de relance. Fora os
 * estados, a lista continua sem cor.
 *
 * O vocabulário é de TOM, não de módulo: "isto está resolvido" é verde no
 * financeiro, na matrícula e no evento. Quem usa escolhe o tom pelo que o
 * estado SIGNIFICA, não pelo nome dele — e é isso que faz o verde querer dizer
 * a mesma coisa em toda tela.
 *
 * ⚠️ **Classes LITERAIS, uma por tom.** O Tailwind varre nomes literais no
 * código; `bg-${cor}-500/10` não existe no CSS final e o selo sai transparente.
 * Mesma armadilha do catálogo de pendências do dashboard.
 */
export type TomDeEstado =
  /** Resolvido, pago, ativo, concluído. */
  | "ok"
  /** Esperando algo acontecer: pendente, agendado, rascunho. */
  | "espera"
  /** Precisa de ação hoje: vencido, expirado, suspenso. */
  | "alerta"
  /** Sem energia: cancelado, inativo, encerrado — aconteceu e acabou. */
  | "neutro"
  /** Informação de trilho: enviado, em andamento. */
  | "andamento"

const TOM: Record<TomDeEstado, string> = {
  ok: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  espera: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  alerta: "bg-red-500/10 text-red-700 dark:text-red-400",
  neutro: "bg-muted text-muted-foreground",
  andamento: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
}

export function StatusBadge({
  tom,
  children,
  className,
}: {
  tom: TomDeEstado
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium",
        TOM[tom],
        className
      )}
    >
      {children}
    </span>
  )
}
