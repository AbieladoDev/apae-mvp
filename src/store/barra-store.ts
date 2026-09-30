import { create } from "zustand"
import { persist } from "zustand/middleware"

/** Preferências da barra lateral: módulos fixados no topo e seções recolhidas. */
interface BarraState {
  fixados: string[]
  recolhidos: string[]
  alternarFixado: (url: string) => void
  alternarRecolhido: (bloco: string) => void
}

const alterna = (lista: string[], v: string) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v])

export const useBarraStore = create<BarraState>()(
  persist(
    (set) => ({
      fixados: [],
      recolhidos: [],
      alternarFixado: (url) => set((s) => ({ fixados: alterna(s.fixados, url) })),
      alternarRecolhido: (bloco) => set((s) => ({ recolhidos: alterna(s.recolhidos, bloco) })),
    }),
    { name: "apae-barra" }
  )
)
