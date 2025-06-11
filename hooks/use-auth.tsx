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
    const savedUser = localStorage.getItem("udal_user")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)      
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
    setUser(userData)
    localStorage.setItem("udal_user", JSON.stringify(userData))
  }

  const logout = () => {
    
    setUser(null)
    localStorage.removeItem("udal_user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}