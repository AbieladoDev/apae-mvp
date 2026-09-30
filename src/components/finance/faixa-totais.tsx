"use client"

import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Os totais do filtro atual, numa LINHA.
 *
 * Substituiu os dois cartões grandes de "Recebido / A receber" (e os de "Pago /
 * A pagar") em 25/08/2026, a pedido do Arthur: eles custavam ~90px de altura no
 * topo de uma tela que existe para mostrar uma LISTA, e empurravam as primeiras
 * cobranças para fora da primeira dobra. A mesma informação cabe em ~24px.
 *
 * O número continua grande o suficiente para ser lido de longe — o que saiu foi
 * a moldura, não o dado. É a mesma decisão do módulo Financeiro: faixas
 * horizontais, nunca grade de cartões, porque caixa por número divide a atenção
 * em partes iguais e some com a hierarquia.
 *
 * ⚠️ Os valores são **do filtro aplicado**, não do mês inteiro — vêm do
 * `totals` da resposta, que a API calcula sobre o mesmo `where` da listagem.
 * Trocar por uma soma feita aqui quebraria isso em silêncio, porque a tela só
 * tem a página carregada.
 */
export function FaixaTotais({
  contagem,
  substantivo,
  itens,
  className,
}: {
  contagem: number
  /** Ex.: `{ um: "cobrança", muitos: "cobranças" }`. */
  substantivo: { um: string; muitos: string }
  itens: { rotulo: string; valorCents: number; destaque?: boolean }[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5",
        className
      )}
    >
      <p className="text-xs text-muted-foreground">
        <span className="tabular-nums font-medium text-foreground">
          {contagem}
        </span>{" "}
        {contagem === 1 ? substantivo.um : substantivo.muitos}
      </p>

      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
        {itens.map((i) => (
          <p key={i.rotulo} className="text-xs text-muted-foreground">
            {i.rotulo}{" "}
            <span
              className={cn(
                "ml-0.5 text-sm tabular-nums text-foreground",
                i.destaque ? "font-semibold" : "font-medium"
              )}
            >
              {formatPrice(i.valorCents)}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}
