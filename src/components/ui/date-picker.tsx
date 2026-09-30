"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Matcher } from "react-day-picker"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { dataISO } from "@/lib/datas"

interface DatePickerProps {
  value?: Date | string
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
  /** Dias não selecionáveis no calendário (matcher do react-day-picker). */
  disabledDays?: Matcher | Matcher[]
  /**
   * Data curta ("20/08/2026") em vez de por extenso.
   *
   * Em formulário a data por extenso é boa — o campo tem a largura de uma
   * coluna inteira e "20 de agosto de 2026" não deixa dúvida. Numa barra de
   * filtros, onde dois calendários dividem espaço com selects, ela estoura a
   * caixa e o texto sai cortado pela metade.
   */
  compact?: boolean
  /**
   * Mês e ano em listas de escolha no topo do calendário, em vez de só as
   * setas. Para data longe de hoje (nascimento, entrada de aluno antigo):
   * chegar em 2012 pelas setas são mais de cem cliques.
   */
  comAno?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecionar data",
  disabled,
  className,
  error,
  disabledDays,
  compact = false,
  comAno = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Convert string to Date if needed
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    // Handle ISO string format (YYYY-MM-DD)
    const parsed = new Date(value + "T00:00:00")
    return isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    onChange(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateValue && "text-muted-foreground",
            error && "border-destructive",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? (
            format(
              dateValue,
              compact ? "dd/MM/yyyy" : "dd 'de' MMMM 'de' yyyy",
              { locale: ptBR }
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          disabled={disabledDays}
          locale={ptBR}
          initialFocus
          {...(comAno && {
            captionLayout: "dropdown" as const,
            defaultMonth: dateValue,
            startMonth: new Date(new Date().getFullYear() - 100, 0),
            endMonth: new Date(new Date().getFullYear() + 1, 11),
          })}
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  startDate?: Date | string
  endDate?: Date | string
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  startPlaceholder?: string
  endPlaceholder?: string
  disabled?: boolean
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startPlaceholder = "Data inicial",
  endPlaceholder = "Data final",
  disabled,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        placeholder={startPlaceholder}
        disabled={disabled}
      />
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        placeholder={endPlaceholder}
        disabled={disabled}
      />
    </div>
  )
}

interface DateTimePickerProps {
  /** `"2026-09-10T14:00"` — o mesmo valor que um `<input type="datetime-local">`. */
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

/**
 * Data + hora: o calendário do shadcn para o dia, um campo de hora ao lado.
 *
 * O `<input type="datetime-local">` resolvia os dois numa caixa só, mas com
 * aparência de navegador — no meio de um formulário em que todo o resto é
 * shadcn, ele destoava. Aqui o dia usa o mesmo popover dos outros campos e só
 * a hora continua nativa, que é onde o input do navegador é bom (teclado
 * numérico no celular, setas no desktop) e onde o `Calendar` não ajuda.
 *
 * **A hora só habilita depois do dia**: hora sem data não é instante nenhum,
 * e assumir "hoje" inventaria um dado que a pessoa não escolheu. Limpar o dia
 * limpa o campo inteiro — é assim que se apaga um horário opcional.
 */
export function DateTimePicker({
  value,
  onChange,
  disabled,
  className,
}: DateTimePickerProps) {
  const [dia = "", hora = ""] = value ? value.split("T") : []

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DatePicker
        compact
        value={dia}
        onChange={(d) => onChange(d ? `${dataISO(d)}T${hora || "00:00"}` : "")}
        placeholder="Escolher dia"
        disabled={disabled}
        className="w-40"
      />
      <Input
        type="time"
        aria-label="Hora"
        value={hora}
        onChange={(e) => onChange(dia ? `${dia}T${e.target.value}` : "")}
        disabled={disabled || !dia}
        className="w-28"
      />
    </div>
  )
}
