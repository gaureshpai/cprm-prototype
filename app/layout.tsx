import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CPRM - Centralized Patient & Resource Management System",
  description: "Hospital management system for Wenlock Hospital - UDAL Fellowship Project",
  keywords: [
    "CPRM",
    "Hospital Management",
    "Patient Management",
    "Wenlock Hospital",
    "UDAL Fellowship",
    "Medical Records",
    "Healthcare Software",
    "Centralized Resource System",
    "Electronic Health Records",
    "EHR System",
    "Medical Inventory",
    "Hospital Appointments",
    "Doctor Scheduling",
    "Pharmacy Management",
    "Healthcare Analytics",
    "Hospital Administration",
    "Patient Tracking System",
    "HealthTech",
    "Digital Health Solutions",
    "Healthcare Infrastructure",
    "Clinical Resource Management",
    "Real-time Patient Monitoring",
    "Medical Dashboard",
    "OPD Management",
    "Emergency Room System",
    "Health Information System",
    "Government Hospital Software",
    "Hospital Workflow Automation",
    "Telemedicine Integration",
    "Secure Medical Data"
  ],  
  authors: [{ name: "Gauresh G Pai" }],
  creator: "Gauresh G Pai",
  generator: "Next.js",
  applicationName: "CPRM",
  metadataBase: new URL("https://cprm-prototype.vercel.app"),
  openGraph: {
    type: "website",
    url: "https://cprm-prototype.vercel.app",
    title: "CPRM - Centralized Patient & Resource Management System",
    description:
      "Comprehensive hospital management system developed for Wenlock Hospital as part of the UDAL Fellowship project.",
    siteName: "CPRM",
    images: [
      {
        url: "https://cprm-prototype.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "CPRM System Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPRM - Centralized Patient & Resource Management System",
    description:
      "Hospital management system for Wenlock Hospital - UDAL Fellowship Project",
    images: ["https://cprm-prototype.vercel.app/logo.png"],
    creator: "@hseruag",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}