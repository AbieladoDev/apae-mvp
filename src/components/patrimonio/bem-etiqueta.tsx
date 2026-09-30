"use client"

import Image from "next/image"
import { Printer } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Guard, NaoEncontrado } from "@/components/apae/comum"
import { ESTADO_BEM_LABEL, ORIGEM_BEM_LABEL } from "@/data/catalogo"
import { formatDate, formatPrice } from "@/lib/format"
import { hoje } from "@/lib/datas"
import { useDemo } from "@/store/demo-store"

export function BemEtiqueta({ id }: { id: string }) {
  return (
    <Guard permissao="patrimonio.ler" titulo="Etiqueta">
      <Conteudo id={id} />
    </Guard>
  )
}

/**
 * A folha que vai para a impressora: a ETIQUETA (para colar no bem, com QR
 * que abre a ficha dele no painel) e o TERMO DE RESPONSABILIDADE (assinado por
 * quem fica com o bem). Só a `.area-impressao` sai no papel.
 */
function Conteudo({ id }: { id: string }) {
  const d = useDemo()
  const b = d.bens.find((x) => x.id === id)
  if (!b) return <NaoEncontrado titulo="Etiqueta" voltar="/painel/patrimonio" />
  const url = typeof window !== "undefined" ? `${window.location.origin}/painel/patrimonio/${b.id}` : b.plaqueta

  return (
    <DashboardLayout
      title="Etiqueta e termo"
      description={`${b.plaqueta} · ${b.nome}`}
      degrauExtra={{ title: b.plaqueta, url: `/painel/patrimonio/${b.id}` }}
      actions={
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-1.5 h-4 w-4" />
          Imprimir
        </Button>
      }
    >
      <div className="area-impressao mx-auto max-w-3xl space-y-8">
        {/* Etiqueta — tamanho de uma etiqueta adesiva 9 × 4,5 cm */}
        <div>
          <p className="no-print mb-2 text-sm font-bold text-muted-foreground">Etiqueta para colar no bem</p>
          <div className="flex h-[4.5cm] w-[9cm] items-center gap-3 rounded-lg border-2 border-slate-800 bg-white p-2.5 text-slate-900">
            <QRCodeSVG value={url} size={120} className="h-full w-auto shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
              <div className="flex items-center gap-1.5">
                <Image src="/logo.jpeg" alt="" width={22} height={22} className="rounded" />
                <span className="text-[10px] font-extrabold leading-tight">APAE ESTEIO — PATRIMÔNIO</span>
              </div>
              <p className="text-xl font-black tracking-tight">{b.plaqueta}</p>
              <p className="line-clamp-2 text-[10px] leading-tight">{b.nome}</p>
              <p className="text-[9px] text-slate-600">
                {b.setor} · desde {formatDate(b.aquisicao)}
              </p>
            </div>
          </div>
        </div>

        {/* Termo */}
        <div className="rounded-2xl border bg-white p-8 text-slate-900 print:border-0 print:p-0">
          <div className="flex items-center gap-3 border-b pb-4">
            <Image src="/logo.jpeg" alt="APAE Esteio" width={52} height={52} className="rounded" />
            <div>
              <p className="text-lg font-extrabold">Termo de responsabilidade de bem patrimonial</p>
              <p className="text-sm text-slate-600">APAE de Esteio — Associação de Pais e Amigos dos Excepcionais</p>
            </div>
          </div>
          <table className="mt-5 w-full text-sm">
            <tbody className="[&_td]:border-b [&_td]:py-2 [&_td:first-child]:w-44 [&_td:first-child]:text-slate-600">
              <tr><td>Plaqueta</td><td className="font-bold">{b.plaqueta}</td></tr>
              <tr><td>Bem</td><td>{b.nome}</td></tr>
              <tr><td>Descrição</td><td>{b.descricao || "—"}</td></tr>
              <tr><td>Categoria</td><td>{b.categoria}</td></tr>
              <tr><td>Estado de conservação</td><td>{ESTADO_BEM_LABEL[b.estado]}</td></tr>
              <tr><td>Valor</td><td>{formatPrice(b.valorCents)}</td></tr>
              <tr><td>Origem</td><td>{ORIGEM_BEM_LABEL[b.origem]}{b.notaFiscal ? ` — ${b.notaFiscal}` : ""}</td></tr>
              <tr><td>Setor</td><td>{b.setor}</td></tr>
              <tr><td>Responsável</td><td className="font-bold">{b.responsavel}</td></tr>
            </tbody>
          </table>
          <p className="mt-6 text-sm leading-relaxed">
            Declaro ter recebido o bem descrito acima, em {ESTADO_BEM_LABEL[b.estado].toLowerCase()} estado de conservação, e me comprometo a zelar
            pelo seu uso adequado, comunicar à direção qualquer dano, perda ou necessidade de reparo, e não transferi-lo de setor sem o devido
            registro no sistema de patrimônio da APAE.
          </p>
          <p className="mt-8 text-sm">Esteio, {formatDate(hoje())}.</p>
          <div className="mt-14 grid grid-cols-2 gap-10 text-center text-sm">
            <div className="border-t border-slate-800 pt-2">
              {b.responsavel}
              <br />
              <span className="text-slate-600">Responsável pelo bem</span>
            </div>
            <div className="border-t border-slate-800 pt-2">
              Direção
              <br />
              <span className="text-slate-600">APAE de Esteio</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
