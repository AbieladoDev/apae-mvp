"use client"

import { useParams } from "next/navigation"
import { PrestadorDetalhe } from "@/components/prestadores/prestador-detalhe"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <PrestadorDetalhe id={id} />
}
