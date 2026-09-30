"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/**
 * O MOLDE DE VISUALIZAÇÃO (o mesmo da TodosDan): coluna de identidade com 25%
 * à esquerda, abas com 75% à direita, primeira aba um mini-painel do registro.
 * Toda ficha `[id]` do MVP usa isto — é o que faz um bem, uma verba e um
 * prestador "lerem" do mesmo jeito.
 */
export function Ficha({
  identidade,
  abas,
  abaInicial,
}: {
  identidade: React.ReactNode
  abas: { valor: string; rotulo: string; conteudo: React.ReactNode; contagem?: number }[]
  abaInicial?: string
}) {
  const [aba, setAba] = React.useState(abaInicial ?? abas[0]?.valor)
  return (
    <div className="-mx-4 -mt-4 flex min-h-full flex-col md:-mx-6 lg:flex-row">
      <aside className="shrink-0 border-b bg-card px-4 py-5 md:px-6 lg:w-1/4 lg:min-w-[270px] lg:border-r lg:border-b-0">
        {identidade}
      </aside>
      <div className="min-w-0 flex-1 px-4 py-5 md:px-6">
        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="mb-5 h-auto flex-wrap">
            {abas.map((a) => (
              <TabsTrigger key={a.valor} value={a.valor}>
                {a.rotulo}
                {a.contagem !== undefined && (
                  <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">{a.contagem}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {abas.map((a) => (
            <TabsContent key={a.valor} value={a.valor} className="space-y-6">
              {a.conteudo}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

/** Cabeçalho da coluna de identidade: selo, nome, subtítulo e um número grande. */
export function Identidade({
  selo,
  titulo,
  subtitulo,
  destaque,
  destaqueRotulo,
  badges,
  acoes,
  children,
}: {
  selo: React.ReactNode
  titulo: string
  subtitulo?: React.ReactNode
  destaque?: string
  destaqueRotulo?: string
  badges?: React.ReactNode
  acoes?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 lg:flex-col">
        {selo}
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold leading-tight">{titulo}</h2>
          {subtitulo && <div className="mt-0.5 text-sm text-muted-foreground">{subtitulo}</div>}
        </div>
      </div>
      {badges && <div className="flex flex-wrap gap-1.5">{badges}</div>}
      {destaque && (
        <div>
          {destaqueRotulo && <p className="text-xs font-semibold text-muted-foreground">{destaqueRotulo}</p>}
          <p className="text-2xl font-extrabold tabular-nums">{destaque}</p>
        </div>
      )}
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
      {children}
    </div>
  )
}

export function SeloGrande({ icone: Icone, classe }: { icone: React.ElementType; classe: string }) {
  return (
    <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl", classe)}>
      <Icone className="size-6" strokeWidth={1.75} />
    </span>
  )
}

/** Linha "rótulo : valor" compacta da coluna de identidade. */
export function LinhaInfo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t py-2 text-sm first:border-t-0">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="min-w-0 text-right font-semibold">{children}</span>
    </div>
  )
}
