"use client"

import { useParams } from "next/navigation"
import { BemDetalhe } from "@/components/patrimonio/bem-detalhe"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <BemDetalhe id={id} />
}
