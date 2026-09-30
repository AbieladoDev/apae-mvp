"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FORMA_LABEL } from "@/data/catalogo"
import type { FormaPagamento } from "@/data/tipos"
import { dataISO, hoje } from "@/lib/datas"
import { formatPrice } from "@/lib/format"
import { TIPO, type ContaView, type TipoConta } from "./tipo-conta"

/** "Marcar como paga" / "Registrar recebimento": data e forma, nada mais. */
export function DialogoQuitar({
  tipo,
  conta,
  onOpenChange,
  onConfirmar,
}: {
  tipo: TipoConta
  conta: ContaView | null
  onOpenChange: (v: boolean) => void
  onConfirmar: (data: string, forma: FormaPagamento) => void
}) {
  const t = TIPO[tipo]
  const [data, setData] = React.useState(hoje())
  const [forma, setForma] = React.useState<FormaPagamento>("pix")

  React.useEffect(() => {
    if (conta) {
      setData(hoje())
      setForma(conta.forma ?? "pix")
    }
  }, [conta])

  return (
    <Dialog open={!!conta} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.quitar}</DialogTitle>
          <DialogDescription>
            {conta?.descricao} — <span className="font-bold text-foreground">{conta && formatPrice(conta.valorCents)}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t.quitadoEm}</Label>
            <DatePicker value={data} onChange={(d) => d && setData(dataISO(d))} />
          </div>
          <div className="space-y-1.5">
            <Label>Forma</Label>
            <Select value={forma} onValueChange={(v) => setForma(v as FormaPagamento)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FORMA_LABEL).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirmar(data, forma)
              toast.success(tipo === "pagar" ? "Conta marcada como paga" : "Recebimento registrado")
              onOpenChange(false)
            }}
          >
            {t.quitar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
