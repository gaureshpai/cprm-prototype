"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AuthGuardProps } from "@/lib/helpers"

export function AuthGuard({ children, allowedRoles, className }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push("/unauthorized")
        return
      }
    }
  }, [user, isLoading, allowedRoles, router])

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}
