import * as React from "react"

/**
 * Media query como estado do React.
 *
 * Existe ao lado de `useIsMobile` (fixo em 768px) porque o hub de Turmas
 * precisa de outro ponto de corte: `xl`, que é onde a coluna da direita cabe
 * junto da sidebar.
 *
 * Começa `false` no servidor e no primeiro render de propósito — ler
 * `window` durante o render daria erro de hidratação, e o CSS já desenha o
 * estado certo antes deste hook responder.
 */
export function useMediaQuery(query: string): boolean {
  const [bate, setBate] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const aoMudar = () => setBate(mql.matches)
    aoMudar()
    mql.addEventListener("change", aoMudar)
    return () => mql.removeEventListener("change", aoMudar)
  }, [query])

  return bate
}
