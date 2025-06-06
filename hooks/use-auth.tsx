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
    console.log("AuthProvider: Checking for existing session")
    const savedUser = localStorage.getItem("udal_user")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log("AuthProvider: Found saved user:", parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("AuthProvider: Error parsing saved user:", error)
        localStorage.removeItem("udal_user")
      }
    } else {
      console.log("AuthProvider: No saved user found")
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    console.log("AuthContext: Login called with:", userData)
    setUser(userData)
    localStorage.setItem("udal_user", JSON.stringify(userData))
    console.log("AuthContext: User set and localStorage updated")
  }

  const logout = () => {
    console.log("AuthContext: Logout called")
    setUser(null)
    localStorage.removeItem("udal_user")
    router.push("/login")
  }

  useEffect(() => {
    console.log("AuthContext: User state changed:", user)
  }, [user])

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}