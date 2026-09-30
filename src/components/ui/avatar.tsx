"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

/**
 * OS CINCO DESENHOS de quem não tem foto (21/09/2026, pedido do Arthur): formas
 * geométricas em vez das iniciais. Cada desenho tem a SUA cor.
 *
 * ⚠️ NÃO é sorteado a cada tela: o desenho sai de um HASH do texto que o
 * avatar recebe (as iniciais/nome), então a mesma pessoa tem sempre o mesmo
 * desenho, em qualquer tela e em qualquer aparelho — "fica salvo" sem coluna
 * no banco, e ninguém consegue trocar. Quando a pessoa põe foto, a foto vence.
 *
 * ⚠️ ESPELHADO no `todosDan-app` (`src/components/ui/avatar.tsx`): mudar um
 * desenho aqui sem mudar lá faz o mesmo aluno ter duas caras.
 */
const DESENHOS: { fundo: string; forma: string; render: (c: string) => React.ReactNode }[] = [
  {
    /* Círculos concêntricos */
    fundo: "#dbeafe",
    forma: "#2563eb",
    render: (c) => (
      <>
        <circle cx="20" cy="20" r="15" fill="none" stroke={c} strokeWidth="3" opacity=".35" />
        <circle cx="20" cy="20" r="9" fill="none" stroke={c} strokeWidth="3" opacity=".6" />
        <circle cx="20" cy="20" r="3.5" fill={c} />
      </>
    ),
  },
  {
    /* Listras diagonais */
    fundo: "#dcfce7",
    forma: "#16a34a",
    render: (c) => (
      <g stroke={c} strokeWidth="4" opacity=".75">
        <line x1="-5" y1="15" x2="15" y2="-5" />
        <line x1="-5" y1="30" x2="30" y2="-5" />
        <line x1="5" y1="40" x2="40" y2="5" />
        <line x1="20" y1="45" x2="45" y2="20" />
      </g>
    ),
  },
  {
    /* Montanhas */
    fundo: "#ffedd5",
    forma: "#ea580c",
    render: (c) => (
      <>
        <circle cx="29" cy="11" r="4" fill={c} opacity=".55" />
        <path d="M-2 40 L13 17 L22 29 L28 21 L42 40 Z" fill={c} opacity=".8" />
      </>
    ),
  },
  {
    /* Pontilhado */
    fundo: "#f3e8ff",
    forma: "#9333ea",
    render: (c) => (
      <g fill={c}>
        {[8, 20, 32].flatMap((y) =>
          [8, 20, 32].map((x) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={x === 20 && y === 20 ? 4 : 2.6} opacity={x === 20 && y === 20 ? 1 : 0.55} />
          ))
        )}
      </g>
    ),
  },
  {
    /* Ondas */
    fundo: "#fce7f3",
    forma: "#db2777",
    render: (c) => (
      <g fill="none" stroke={c} strokeWidth="3" strokeLinecap="round">
        <path d="M2 14 Q 11 8 20 14 T 38 14" opacity=".45" />
        <path d="M2 22 Q 11 16 20 22 T 38 22" opacity=".7" />
        <path d="M2 30 Q 11 24 20 30 T 38 30" />
      </g>
    ),
  },
]

/** Texto do filho (as iniciais que as telas passam) — é a semente do desenho. */
function textoDe(no: React.ReactNode): string {
  if (typeof no === "string" || typeof no === "number") return String(no)
  if (Array.isArray(no)) return no.map(textoDe).join("")
  return ""
}

/** Hash estável (FNV-1a): o mesmo texto dá sempre o mesmo número. */
function hash(texto: string): number {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function AvatarFallback({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  const semente = textoDe(children).trim()
  const d = DESENHOS[hash(semente || "?") % DESENHOS.length]
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center overflow-hidden rounded-full",
        className
      )}
      /* O fundo vem do desenho, e fica POR CIMA de qualquer `bg-*` que a tela
         tenha passado para as iniciais antigas. */
      style={{ background: d.fundo }}
      {...props}
    >
      <svg viewBox="0 0 40 40" className="size-full" aria-hidden>
        {d.render(d.forma)}
      </svg>
      {/* As iniciais continuam para o leitor de tela. */}
      {semente && <span className="sr-only">{semente}</span>}
    </AvatarPrimitive.Fallback>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
