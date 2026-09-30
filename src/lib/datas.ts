/** Datas do MVP: sempre `YYYY-MM-DD` em string, montadas no fuso local. */

export function dataISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function hoje(): string {
  return dataISO(new Date())
}

export function somarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split("-").map(Number)
  return dataISO(new Date(a, m - 1, d + dias))
}

/** `YYYY-MM` do mês de uma data. */
export function mesDe(iso: string): string {
  return iso.slice(0, 7)
}

const MESES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]

export function rotuloMes(mes: string, longo = false): string {
  const [a, m] = mes.split("-").map(Number)
  return longo ? `${MESES[m - 1]} de ${a}` : `${MESES_CURTO[m - 1]}/${String(a).slice(2)}`
}

/** Os últimos `n` meses (`YYYY-MM`), do mais antigo ao atual, deslocados em `desloca`. */
export function ultimosMeses(n: number, desloca = 0): string[] {
  const agora = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth() - (n - 1 - i) + desloca, 1)
    return dataISO(d).slice(0, 7)
  })
}
