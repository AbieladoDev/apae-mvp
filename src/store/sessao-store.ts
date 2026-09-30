import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Perfil } from "@/data/tipos"
import { USUARIOS } from "@/data/catalogo"
import { temPermissao, type Permissao } from "@/lib/permissoes"

interface SessaoState {
  perfil: Perfil | null
  entrar: (perfil: Perfil) => void
  sair: () => void
}

/** O "login" da demo: só guarda qual perfil está usando o painel. */
export const useSessao = create<SessaoState>()(
  persist(
    (set) => ({
      perfil: null,
      entrar: (perfil) => set({ perfil }),
      sair: () => set({ perfil: null }),
    }),
    { name: "apae-sessao" }
  )
)

export function useUsuario() {
  const perfil = useSessao((s) => s.perfil)
  return perfil ? USUARIOS[perfil] : null
}

export function usePode(p: Permissao): boolean {
  const perfil = useSessao((s) => s.perfil)
  return temPermissao(perfil, p)
}

export function usuarioAtual() {
  const perfil = useSessao.getState().perfil ?? "admin"
  return USUARIOS[perfil]
}
