"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/*
  ⚠️ MORA EM `common/` desde 28/08/2026, e não no cadastro de turma onde
  nasceu: o cadastro de VISITANTE faz as mesmas duas perguntas (modalidade e
  turma), e duas cópias do mesmo gesto divergiriam no primeiro ajuste — o
  sintoma seria a mesma escolha com duas caras conforme a tela.
*/
/**
 * Uma LISTA DE ESCOLHA ÚNICA em cartão: as opções empilhadas, cada uma com o
 * seu selo, o nome e um círculo que vira ✓ na escolhida (28/08/2026, pedido do
 * Arthur).
 *
 * ⚠️ Substitui dois `Select` no cadastro de turma. Modalidade e instrutor são
 * as duas perguntas que decidem a turma, e ambas viviam fechadas: para saber
 * quais existem era preciso abrir, e o selo colorido da modalidade — que é o
 * que faz distinguir judô de jiu-jitsu sem ler — só aparecia depois do clique.
 *
 * ⚠️ **Escolha ÚNICA, sempre.** Clicar numa opção substitui a anterior; não há
 * como marcar duas. É o contrato do componente, e é o que o instrutor exige —
 * a turma tem UM titular.
 *
 * ⚠️ A opção "nenhum" é uma LINHA da lista, com borda tracejada, e não a
 * ausência de escolha: as duas perguntas aceitam vazio (turma de
 * condicionamento não tem modalidade; turma sem titular existe), e deixar isso
 * implícito faria "não escolhi ainda" e "escolhi que não tem" serem o mesmo
 * estado na tela.
 */
export function ListaDeEscolha<T>({
  itens,
  valor,
  onEscolher,
  chave,
  nome,
  selo,
  rotuloVazio,
  seloVazio,
  valorVazio,
  vazio,
  disabled,
}: {
  itens: T[]
  valor: string
  onEscolher: (valor: string) => void
  chave: (item: T) => string
  nome: (item: T) => string
  selo: (item: T) => React.ReactNode
  /** Texto da linha "nenhum". */
  rotuloVazio: string
  seloVazio: React.ReactNode
  valorVazio: string
  /** O que mostrar quando NÃO há nenhuma opção — a lista vazia tem causa. */
  vazio?: React.ReactNode
  disabled?: boolean
}) {
  return (
    /* ⚠️ QUATRO linhas à vista, depois rola (28/08/2026, medida do Arthur).
       A conta: 4 linhas de 2.375rem + 3 vãos de 0.375rem + 0.75rem de padding.
       Sem teto, vinte instrutores empurrariam o resto do formulário para fora
       da tela; com um teto maior, a lista dominaria a coluna. */
    <div className="barra-fantasma max-h-[11.5rem] space-y-1.5 overflow-y-auto rounded-lg border p-1.5">
      {/* ⚠️ "Nenhum" é a PRIMEIRA linha, não a última (28/08/2026): é o
          estado em que a lista abre, e no fim ele ficava atrás da rolagem
          justamente para quem não quer escolher nada. */}
      <Linha
        escolhido={valor === valorVazio}
        tracejada
        disabled={disabled}
        onClick={() => onEscolher(valorVazio)}
      >
        {seloVazio}
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {rotuloVazio}
        </span>
      </Linha>

      {itens.map((item) => (
        <Linha
          key={chave(item)}
          escolhido={valor === chave(item)}
          disabled={disabled}
          onClick={() => onEscolher(chave(item))}
        >
          {selo(item)}
          <span className="min-w-0 flex-1 truncate text-sm">{nome(item)}</span>
        </Linha>
      ))}

      {itens.length === 0 && vazio}
    </div>
  )
}

/**
 * Uma linha da `ListaDeEscolha`.
 *
 * ⚠️ Vive FORA do componente de propósito. Declarada dentro, ela é uma função
 * nova a cada render — o React desmonta e remonta a subárvore, e o lint recusa
 * com "Cannot create components during render". O sintoma seria o foco do
 * teclado pulando fora a cada clique na lista.
 */
function Linha({
  escolhido,
  tracejada,
  disabled,
  children,
  onClick,
}: {
  escolhido: boolean
  tracejada?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={escolhido}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors",
        "hover:border-primary/60 disabled:pointer-events-none disabled:opacity-60",
        tracejada && !escolhido && "border-dashed",
        escolhido && "border-primary bg-accent/40"
      )}
    >
      {children}
      {/* ⚠️ Círculo VAZIO na não escolhida, e não nada: sem ele a lista não
          diz que é escolhível, e a linha lê como informação. */}
      <span
        aria-hidden
        className={cn(
          "ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          escolhido
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40"
        )}
      >
        {escolhido && <Check className="h-3 w-3" />}
      </span>
    </button>
  )
}
