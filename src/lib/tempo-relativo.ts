/**
 * "ha 18 dias", "em 3 dias" — o tempo em relacao a HOJE (28/08/2026).
 *
 * O balcao nao pensa em datas, pensa em distancia: "sumiu ha 18 dias" e um
 * alarme, "10/08/2026" e uma conta que quem atende tem que fazer de cabeca
 * enquanto o responsavel espera.
 *
 * AVISO: os campos `@db.Date` da API chegam como `...T00:00:00.000Z` e
 * `new Date` no fuso do Brasil os joga para o dia ANTERIOR (armadilha 3). Por
 * isso a conta e feita sobre a data FATIADA, em UTC dos dois lados — nunca
 * sobre o `Date` do valor cru.
 */
function emDiasUTC(iso: string): number {
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number)
  return Date.UTC(ano, mes - 1, dia) / 86_400_000
}

function hojeEmDiasUTC(): number {
  const agora = new Date()
  return (
    Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()) /
    86_400_000
  )
}

/** Dias entre hoje e a data. Negativo no passado, positivo no futuro. */
export function diasAte(iso: string): number {
  return emDiasUTC(iso) - hojeEmDiasUTC()
}

/** "hoje", "ontem", "ha 18 dias", "ha 3 meses". Sempre no passado. */
export function haQuantoTempo(iso: string): string {
  const dias = -diasAte(iso)
  if (dias <= 0) return "hoje"
  if (dias === 1) return "ontem"
  if (dias < 30) return `há ${dias} dias`
  const meses = Math.floor(dias / 30)
  if (meses < 24) return meses === 1 ? "há 1 mês" : `há ${meses} meses`
  return `há ${Math.floor(meses / 12)} anos`
}

/**
 * Quantos dias faltam para o PROXIMO aniversario, e a idade que a pessoa faz.
 *
 * AVISO: a conta e por dia do ano, nao por data — o aniversario de 12/03 de
 * 2015 nao "passou": ele volta todo ano. Comparar a data de nascimento com hoje
 * diria "ha 11 anos", que nao e a pergunta.
 */
export function proximoAniversario(
  nascimento: string,
): { dias: number; idade: number } | null {
  const [ano, mes, dia] = nascimento.slice(0, 10).split("-").map(Number)
  if (!ano || !mes || !dia) return null

  const agora = new Date()
  const anoAtual = agora.getFullYear()
  let alvo = Date.UTC(anoAtual, mes - 1, dia) / 86_400_000
  const hoje = hojeEmDiasUTC()
  /* Ja passou este ano: o proximo e o do ano que vem. */
  if (alvo < hoje) alvo = Date.UTC(anoAtual + 1, mes - 1, dia) / 86_400_000

  const dias = alvo - hoje
  const idade =
    new Date(alvo * 86_400_000).getUTCFullYear() - ano
  return { dias, idade }
}
