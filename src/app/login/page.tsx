"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Briefcase, Calculator, Loader2, ShoppingCart, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { USUARIOS } from "@/data/catalogo"
import type { Perfil } from "@/data/tipos"
import { useSessao } from "@/store/sessao-store"
import { cn } from "@/lib/utils"

const PERFIS: { perfil: Perfil; icone: typeof UserRound; faz: string; cor: string }[] = [
  { perfil: "admin", icone: Briefcase, faz: "Vê tudo e aprova as solicitações de compra", cor: "bg-blue-100 text-blue-700" },
  { perfil: "financeiro", icone: Calculator, faz: "Contas, verbas, apoiadores e prestação de contas", cor: "bg-emerald-100 text-emerald-700" },
  { perfil: "compras", icone: ShoppingCart, faz: "Compra o que foi aprovado e cuida do estoque", cor: "bg-orange-100 text-orange-700" },
  { perfil: "funcionario", icone: UserRound, faz: "Pede compras e retira itens do estoque", cor: "bg-violet-100 text-violet-700" },
]

export default function LoginPage() {
  const router = useRouter()
  const entrar = useSessao((s) => s.entrar)
  const [escolhido, setEscolhido] = React.useState<Perfil>("admin")
  const [carregando, setCarregando] = React.useState(false)

  function onEntrar(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    entrar(escolhido)
    setTimeout(() => router.push("/painel"), 400)
  }

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <aside className="relative flex shrink-0 flex-col justify-between overflow-hidden bg-sidebar px-8 py-10 text-sidebar-foreground lg:w-[44%] lg:px-14 lg:py-14">
        <Girassol />
        <div className="relative flex items-center gap-3">
          <span className="rounded-2xl bg-white p-1.5 shadow-lg shadow-black/10">
            <Image src="/logo.jpeg" alt="APAE Esteio" width={56} height={56} className="h-14 w-14 rounded-xl object-contain" priority />
          </span>
          <div>
            <p className="text-lg font-extrabold leading-none">APAE Esteio</p>
            <p className="mt-1 text-sm text-sidebar-foreground/70">Gestão da associação</p>
          </div>
        </div>

        <div className="relative mt-12 max-w-md lg:mt-0">
          <h1 className="text-3xl font-extrabold leading-tight lg:text-[2.5rem]">
            Cada real bem cuidado vira atendimento.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-sidebar-foreground/75">
            Contas, verbas de convênio, compras, estoque e patrimônio no mesmo lugar — e a
            prestação de contas de cada apoiador pronta quando pedirem.
          </p>
          <ul className="mt-9 flex flex-wrap gap-2">
            {["Verbas e apoiadores", "Compras com aprovação", "Estoque por setor", "Patrimônio com etiqueta"].map((t) => (
              <li key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sidebar-foreground/90">
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-12 text-xs text-sidebar-foreground/50 lg:mt-0">
          Demonstração — os dados são fictícios e ficam só neste navegador.
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <form onSubmit={onEntrar} className="anim-sobe w-full max-w-[420px]">
          <h2 className="text-2xl font-extrabold">Entrar</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Escolha quem você quer ser na demonstração. Cada perfil vê um menu diferente.
          </p>

          <div className="mt-6 space-y-2" role="radiogroup" aria-label="Perfil">
            {PERFIS.map(({ perfil, icone: Icone, faz, cor }) => {
              const u = USUARIOS[perfil]
              const ativo = perfil === escolhido
              return (
                <button
                  key={perfil}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  onClick={() => setEscolhido(perfil)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border bg-card px-3.5 py-3 text-left transition-all",
                    ativo ? "border-primary ring-4 ring-primary/10" : "hover:border-primary/40"
                  )}
                >
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", cor)}>
                    <Icone className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">
                      {u.nome} <span className="font-medium text-muted-foreground">· {u.cargo}</span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{faz}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0 rounded-full border-2 transition-colors",
                      ativo ? "border-primary bg-primary shadow-[inset_0_0_0_3px_white]" : "border-muted-foreground/30"
                    )}
                  />
                </button>
              )
            })}
          </div>

          <Button type="submit" size="lg" className="mt-6 h-11 w-full rounded-xl text-base font-bold" disabled={carregando}>
            {carregando && <Loader2 className="mr-2 size-4 animate-spin" />}
            Entrar como {USUARIOS[escolhido].nome.split(" ")[0]}
          </Button>
        </form>
      </main>
    </div>
  )
}

/** As pétalas da logo, grandes e quase transparentes no canto do painel azul. */
function Girassol() {
  const petalas = Array.from({ length: 14 }, (_, i) => i * (360 / 14))
  return (
    <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -right-24 -bottom-24 h-[26rem] w-[26rem] opacity-[0.16]">
      {petalas.map((a) => (
        <ellipse key={a} cx="100" cy="42" rx="15" ry="36" fill="#f5b700" transform={`rotate(${a} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="30" fill="#f5b700" />
    </svg>
  )
}
