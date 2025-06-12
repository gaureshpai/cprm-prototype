"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut, User, Settings, Home, Heart, Building, AudioWaveformIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import type { JSX } from "react"
import { NotificationsPanel } from "@/components/notifications-panel"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getNavLinks = () => {
    const commonLinks = [
      { name: "Dashboard", href: `/${user?.role.toLowerCase()}`, icon: <Home className="h-4 w-4 mr-2" /> },
    ]

    const roleSpecificLinks: Record<string, { name: string; href: string; icon: JSX.Element }[]> = {
      admin: [
        { name: "Displays", href: "/admin/displays", icon: <Settings className="h-4 w-4 mr-2" /> },
        { name: "Users", href: "/admin/Users", icon: <User className="h-4 w-4 mr-2" /> },
        { name:"Departments", href: "/admin/departments", icon: <Building className="h-4 w-4 mr-2" /> },
        { name: "Overview", href: "/admin/overview", icon: <AudioWaveformIcon className="h-4 w-4 mr-2" /> },
      ],
      doctor: [
        { name: "Patients", href: "/doctor/patients", icon: <User className="h-4 w-4 mr-2" /> },
        { name: "OT Status", href: "/doctor/ot", icon: <Heart className="h-4 w-4 mr-2" /> },
      ],
      pharmacist: [
        { name: "Inventory", href: "/pharmacist/inventory", icon: <Settings className="h-4 w-4 mr-2" /> },
        { name: "Orders", href: "/pharmacist/orders", icon: <Heart className="h-4 w-4 mr-2" /> },
      ],
      technician: [
        { name: "Displays", href: "/technician/displays", icon: <Settings className="h-4 w-4 mr-2" /> },
        { name: "Blood Bank", href: "/technician/blood-bank", icon: <Heart className="h-4 w-4 mr-2" /> },
      ],
      nurse: [
        { name: "Token Queues", href: "/nurse/token-queues", icon: <Heart className="h-4 w-4 mr-2" /> },
      ]
    }

    if (user?.role && roleSpecificLinks[user.role.toLowerCase()]) {
      return [...commonLinks, ...roleSpecificLinks[user.role.toLowerCase()]]
    }

    return commonLinks
  }

  const navLinks = getNavLinks()

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href={`/${user?.role.toLowerCase()}`} className="flex items-center space-x-2">
              <div className="bg-black p-1.5 rounded-md">
                <Image
                  src="/logo.png"
                  alt="inunity Logo"
                  width={24}
                  height={24}
                  className="invert"
                />
              </div>
              <div className="flex items-center">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">UDAL</h1>
                  <p className="text-xs text-gray-500">Wenlock Hospital</p>
                </div>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${pathname === link.href ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <NotificationsPanel />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile-settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile & Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${pathname === link.href ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <Link
              href="/profile-settings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Profile & Settings
            </Link>
            <button
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 flex items-center"
              onClick={() => {
                logout()
                setMobileMenuOpen(false)
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  )
}