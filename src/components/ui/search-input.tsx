"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/*
 * ⚠️ Houve uma variante `destaque` (campo mais alto, borda forte, fundo
 * próprio) em 25/08/2026, para a busca das contas a receber. Foi REVERTIDA no
 * mesmo dia: vista na tela, ela não "chamava atenção", ela saía do conjunto —
 * mais alta que os `Select` ao lado, desalinhava a faixa inteira de filtros.
 * Se a busca precisar de destaque de novo, o caminho é a POSIÇÃO dela na faixa,
 * não um tamanho diferente do resto.
 */

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
}: SearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onChange("")
    inputRef.current?.focus()
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2 md:left-3 top-1/2 h-3.5 w-3.5 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-7 md:h-9 w-full rounded-lg border border-border bg-background pl-7 md:pl-9 pr-7 md:pr-9 text-xs md:text-sm",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
          "transition-all duration-200"
        )}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 md:p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
        </button>
      )}
    </div>
  )
}
