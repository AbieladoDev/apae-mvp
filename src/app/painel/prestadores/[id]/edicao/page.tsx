"use client"

import { useParams } from "next/navigation"
import { PrestadorForm } from "@/components/prestadores/prestador-form"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <PrestadorForm id={id} />
}
