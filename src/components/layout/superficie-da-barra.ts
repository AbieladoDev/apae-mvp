import { cn } from "@/lib/utils"

/**
 * A SUPERFÍCIE DOS PAINÉIS QUE SAEM DA BARRA (29/08/2026, pedido do Arthur).
 *
 * Os quatro — sub-itens do módulo, criar da seção, notificações e o menu do
 * usuário — usam a cor da BARRA, não a da página, nos dois temas.
 *
 * ⚠️ **Isto reverte a correção de 28/08/2026, e o motivo dela continua real:**
 * o painel abre POR CIMA da barra, e com a mesma cor dela ele sumia. O que
 * torna a volta possível é o que veio junto — `border`, `shadow-xl` e o anel
 * escuro: a separação passou a ser a SOMBRA e a linha, não o contraste de
 * fundo. Mexer nessas três classes reintroduz o bug de sumiço.
 *
 * ⚠️ Componente que entrar aqui dentro **não pode** usar `text-muted-foreground`,
 * `bg-accent` nem `bg-popover`: são tokens da PÁGINA e erram a cor sobre a
 * barra, nos dois temas. Os pares certos são `--sidebar-*`.
 */
export const SUPERFICIE_DA_BARRA = cn(
  "bg-sidebar text-sidebar-foreground border-sidebar-border",
  "shadow-xl ring-1 ring-black/5 dark:ring-white/10"
)

/** O item clicável dentro desses painéis. */
export const ITEM_DA_BARRA =
  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"

/** O texto de apoio (descrição, contagem) dentro deles. */
export const APOIO_DA_BARRA = "text-sidebar-foreground/60"
