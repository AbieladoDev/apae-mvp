import type { Metadata } from "next"

import { PainelShell } from "@/components/layout/painel-shell"

export const metadata: Metadata = {
  title: "Painel",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PainelShell>{children}</PainelShell>
}
