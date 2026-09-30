"use client"

import { useParams } from "next/navigation"
import { ContaForm } from "@/components/contas/conta-form"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <ContaForm tipo="receber" id={id} />
}
