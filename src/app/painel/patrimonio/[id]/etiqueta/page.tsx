"use client"

import { useParams } from "next/navigation"
import { BemEtiqueta } from "@/components/patrimonio/bem-etiqueta"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <BemEtiqueta id={id} />
}
