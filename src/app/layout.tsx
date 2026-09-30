import type { Metadata, Viewport } from "next"
import { Nunito } from "next/font/google"
import { Toaster } from "sonner"

import "./globals.css"

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "APAE Esteio | Gestão",
    template: "APAE Esteio | %s",
  },
  description: "Painel de gestão da APAE de Esteio — financeiro, verbas, compras, estoque, patrimônio e prestadores.",
  icons: { icon: "/logo.jpeg" },
}

export const viewport: Viewport = {
  themeColor: "#103f86",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
        <Toaster position="bottom-right" richColors toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  )
}
