"use client"

import { useParams } from "next/navigation"
import { VerbaForm } from "@/components/verbas/verba-form"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <VerbaForm id={id} />
}
