"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CurrencyInputProps {
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "R$ 0,00",
  disabled,
  className,
  error,
}: CurrencyInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Format number to Brazilian currency display
  const formatToCurrency = (val: string | number): string => {
    if (!val && val !== 0) return ""

    const numValue = typeof val === "string" ? parseFloat(val) || 0 : val

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue)
  }

  // Parse currency string to number
  const parseCurrency = (val: string): string => {
    // Remove everything except numbers
    const numbers = val.replace(/\D/g, "")
    if (!numbers) return ""

    // Convert to decimal (last 2 digits are cents)
    const numValue = parseInt(numbers, 10) / 100
    return numValue.toString()
  }

  const [displayValue, setDisplayValue] = React.useState(() =>
    value ? formatToCurrency(value) : ""
  )

  // Update display when value prop changes externally
  React.useEffect(() => {
    if (value) {
      setDisplayValue(formatToCurrency(value))
    } else {
      setDisplayValue("")
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = parseCurrency(inputValue)

    if (numericValue) {
      setDisplayValue(formatToCurrency(numericValue))
      onChange(numericValue)
    } else {
      setDisplayValue("")
      onChange("")
    }
  }

  const handleFocus = () => {
    // Select all on focus for easy replacement
    setTimeout(() => {
      inputRef.current?.select()
    }, 0)
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
    />
  )
}

interface NumberInputProps {
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
  min?: number
  max?: number
  step?: number
  suffix?: string
}

export function NumberInput({
  value,
  onChange,
  placeholder = "0",
  disabled,
  className,
  error,
  min,
  max,
  suffix,
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d.,]/g, "")

    // Replace comma with dot for decimal
    val = val.replace(",", ".")

    // Only allow one decimal point
    const parts = val.split(".")
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("")
    }

    // Check min/max
    const numVal = parseFloat(val)
    if (!isNaN(numVal)) {
      if (min !== undefined && numVal < min) return
      if (max !== undefined && numVal > max) return
    }

    onChange(val)
  }

  const displayValue = React.useMemo(() => {
    if (!value && value !== 0) return ""
    const strVal = value.toString()
    if (suffix) return strVal
    return strVal
  }, [value, suffix])

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          error && "border-destructive focus-visible:ring-destructive",
          suffix && "pr-12",
          className
        )}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  )
}
