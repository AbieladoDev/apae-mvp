"use client"

import { useParams } from "next/navigation"
import { BemForm } from "@/components/patrimonio/bem-form"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <BemForm id={id} />
}
