"use client"

import { useParams } from "next/navigation"
import { CompraDetalhe } from "@/components/compras/compra-detalhe"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <CompraDetalhe id={id} />
}
