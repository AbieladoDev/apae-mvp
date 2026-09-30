"use client"

import { useParams } from "next/navigation"
import { ContaDetalhe } from "@/components/contas/conta-detalhe"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <ContaDetalhe tipo="receber" id={id} />
}
