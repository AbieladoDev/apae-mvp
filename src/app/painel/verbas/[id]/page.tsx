"use client"

import { useParams } from "next/navigation"
import { VerbaDetalhe } from "@/components/verbas/verba-detalhe"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <VerbaDetalhe id={id} />
}
