"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AuthContextType, User } from "@/lib/interfaces"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("udal_user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem("udal_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem("udal_user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("udal_user")
    router.push("/login")
  }

  const hasPermission = (permission: string) => {
    if (!user || !user.permissions) return false
    if (user.permissions.includes("all")) return true
    return user.permissions.includes(permission)
  }

  const value = {
    user,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}