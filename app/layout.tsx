import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/providers"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BIG DISTRIBUTION & Marketing Inc.",
  description: "Dashboard for BIG DISTRIBUTION & Marketing Inc.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <Providers attribute="class" defaultTheme="system" enableSystem>
            <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">{children}</div>
            <Toaster />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'