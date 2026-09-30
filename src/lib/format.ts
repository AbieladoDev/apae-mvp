/** Formatadores de exibição compartilhados por todas as telas. */

/** Formata centavos em moeda BRL (4500 -> "R$ 45,00"). */
export function formatPrice(priceCents: number): string {
  return (priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

/**
 * Data ISO em dd/MM/yyyy.
 *
 * Fatia a string em vez de instanciar `Date` para os campos `@db.Date` da API
 * (vencimento, dia da aula): eles chegam como "2026-08-10T00:00:00.000Z", e
 * `new Date(...).toLocaleDateString()` no fuso do Brasil exibiria 09/08 —
 * a mensalidade apareceria vencendo um dia antes do que está no banco.
 */
export function formatDate(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-")
  return `${dia}/${mes}/${ano}`
}

/**
 * Iniciais de um nome para avatares ("João Silva" -> "JS").
 * Ignora espaços extras — nome digitado com espaço duplo geraria "undefined".
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Data e hora de um campo `DateTime` (início/fim de evento) em dd/MM/yyyy HH:mm.
 *
 * Aqui `new Date` é o certo, ao contrário de `formatDate`: estes campos guardam
 * um instante de verdade, com hora, e devem ser exibidos no fuso de quem olha.
 * A regra de fatiar string vale só para os campos `@db.Date`, que não têm hora.
 */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
