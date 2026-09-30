"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/**
 * Seletor de MÊS, no mesmo desenho do `DatePicker`.
 *
 * Substituiu o `<Input type="month">` nativo em 25/08/2026, a pedido do Arthur.
 * O nativo desenha o calendário do sistema operacional: outra tipografia, outro
 * tamanho, outro comportamento em cada navegador — e no Chrome ele coloca um
 * ícone próprio dentro do campo, que não combina com nada do painel.
 *
 * ⚠️ **Não dá para usar o `Calendar` (react-day-picker) para isto.** Ele
 * seleciona DIA; um mês escolhido como "dia 1" obriga a esconder o resto da
 * grade e a torcer para ninguém clicar em outro número. Uma grade de 12 botões
 * é menos código e responde exatamente à pergunta que a tela faz.
 *
 * ## O contrato é a string "YYYY-MM"
 *
 * Entra e sai `"2026-08"`, que é o que a API chama de competência. É de
 * propósito, e é a mesma razão do `formatDate` do painel: `new Date("2026-08")`
 * é lido como UTC, e no fuso do Brasil volta **julho**. Aqui nenhum `Date` é
 * criado a partir do valor — os números são fatiados da string.
 */

const MESES_CURTO = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
]

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

/** `"2026-08"` -> `{ ano: 2026, mes: 8 }`. Sem `new Date`. */
function partes(value: string): { ano: number; mes: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(value)
  if (!m) return null
  const mes = Number(m[2])
  if (mes < 1 || mes > 12) return null
  return { ano: Number(m[1]), mes }
}

function rotulo(value: string, compact: boolean): string | null {
  const p = partes(value)
  if (!p) return null
  return compact
    ? `${MESES_CURTO[p.mes - 1]}/${p.ano}`
    : `${MESES[p.mes - 1]} de ${p.ano}`
}

export function MonthPicker({
  value,
  onChange,
  placeholder = "Selecionar mês",
  disabled,
  className,
  compact = false,
  "aria-label": ariaLabel,
}: {
  /** `"YYYY-MM"`, ou string vazia. */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** `ago/2026` em vez de `agosto de 2026` — para barra de filtros apertada. */
  compact?: boolean
  "aria-label"?: string
}) {
  const [open, setOpen] = React.useState(false)

  const atual = partes(value)

  /*
   * O ano que a grade mostra.
   *
   * ⚠️ Inicializador de `useState`, e NÃO um `useEffect` sincronizando com
   * `value`: o React Compiler recusa `setState` em efeito (armadilha 9 do
   * app, e a 27 daqui). O ano só precisa acompanhar `value` enquanto o popover
   * está FECHADO — e é exatamente isso que o `key` no `PopoverContent` faz,
   * remontando a grade a cada abertura.
   */
  const texto = rotulo(value, compact)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-start text-left font-normal",
            !texto && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate first-letter:uppercase">
            {texto ?? placeholder}
          </span>
        </Button>
      </PopoverTrigger>

      {/* `key`: remonta a grade a cada abertura, para ela começar no ano do
          valor atual sem precisar de efeito sincronizando estado. */}
      <PopoverContent key={value} className="w-auto p-3" align="start">
        <Grade
          anoInicial={atual?.ano ?? new Date().getFullYear()}
          selecionado={atual}
          onSelect={(ano, mes) => {
            onChange(`${ano}-${String(mes).padStart(2, "0")}`)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

function Grade({
  anoInicial,
  selecionado,
  onSelect,
}: {
  anoInicial: number
  selecionado: { ano: number; mes: number } | null
  onSelect: (ano: number, mes: number) => void
}) {
  const [ano, setAno] = React.useState(anoInicial)

  return (
    <div className="w-56 space-y-3">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Ano anterior"
          onClick={() => setAno((a) => a - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium tabular-nums">{ano}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Próximo ano"
          onClick={() => setAno((a) => a + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {MESES_CURTO.map((nome, i) => {
          const mes = i + 1
          const ativo = selecionado?.ano === ano && selecionado?.mes === mes
          return (
            <Button
              key={nome}
              type="button"
              variant={ativo ? "default" : "ghost"}
              size="sm"
              className="h-8 font-normal capitalize"
              onClick={() => onSelect(ano, mes)}
            >
              {nome}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
