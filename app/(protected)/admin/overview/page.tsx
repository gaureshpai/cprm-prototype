"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import {
    Users,
    Monitor,
    Stethoscope,
    UserCog,
    Pill,
    Activity,
    Droplets,
    Wrench,
    Building2,
    Clock,
    UserCircle,
    Settings,
    Home,
    LayoutDashboard,
} from "lucide-react"

export default function AdminOverviewPage() {
    const pages = [
        {
            title: "Admin Dashboard",
            description: "Main admin dashboard with system analytics and emergency alerts",
            path: "/admin",
            icon: <LayoutDashboard className="h-6 w-6 text-blue-600" />,
            role: "Admin",
            badge: "Core",
        },
        {
            title: "Display Management",
            description: "Manage all hospital display screens",
            path: "/admin/displays",
            icon: <Monitor className="h-6 w-6 text-purple-600" />,
            role: "Admin",
            badge: "Core",
        },
        {
            title: "Department Management",
            description: "Manage hospital departments",
            path: "/admin/departments",
            icon: <Building2 className="h-6 w-6 text-green-600" />,
            role: "Admin",
            badge: "Core",
        },
        {
            title: "User Management",
            description: "Manage staff accounts and permissions",
            path: "/admin/users",
            icon: <UserCog className="h-6 w-6 text-orange-600" />,
            role: "Admin",
            badge: "Core",
        },
        {
            title: "Doctor Dashboard",
            description: "Doctor's main dashboard",
            path: "/doctor",
            icon: <Stethoscope className="h-6 w-6 text-blue-600" />,
            role: "Doctor",
            badge: "Staff",
        },
        {
            title: "Patient Management",
            description: "Manage patient records and appointments",
            path: "/doctor/patients",
            icon: <Users className="h-6 w-6 text-green-600" />,
            role: "Doctor",
            badge: "Staff",
        },
        {
            title: "OT Management",
            description: "Operating theater scheduling and management",
            path: "/doctor/ot",
            icon: <Activity className="h-6 w-6 text-red-600" />,
            role: "Doctor",
            badge: "Staff",
        },
        {
            title: "Nurse Dashboard",
            description: "Nurse's main dashboard",
            path: "/nurse",
            icon: <UserCircle className="h-6 w-6 text-blue-600" />,
            role: "Nurse",
            badge: "Staff",
        },
        {
            title: "Token Queue Management",
            description: "Manage patient queues and appointments",
            path: "/nurse/token-queue",
            icon: <Clock className="h-6 w-6 text-yellow-600" />,
            role: "Nurse",
            badge: "Staff",
        },
        {
            title: "Pharmacist Dashboard",
            description: "Pharmacist's main dashboard",
            path: "/pharmacist",
            icon: <Pill className="h-6 w-6 text-blue-600" />,
            role: "Pharmacist",
            badge: "Staff",
        },
        {
            title: "Drug Inventory",
            description: "Manage medication inventory",
            path: "/pharmacist/inventory",
            icon: <Pill className="h-6 w-6 text-green-600" />,
            role: "Pharmacist",
            badge: "Staff",
        },
        {
            title: "Prescription Orders",
            description: "Process prescription orders",
            path: "/pharmacist/orders",
            icon: <Pill className="h-6 w-6 text-orange-600" />,
            role: "Pharmacist",
            badge: "Staff",
        },
        {
            title: "Technician Dashboard",
            description: "Technician's main dashboard",
            path: "/technician",
            icon: <Wrench className="h-6 w-6 text-blue-600" />,
            role: "Technician",
            badge: "Staff",
        },
        {
            title: "Blood Bank Management",
            description: "Manage blood inventory",
            path: "/technician/blood-bank",
            icon: <Droplets className="h-6 w-6 text-red-600" />,
            role: "Technician",
            badge: "Staff",
        },
        {
            title: "Display Maintenance",
            description: "Maintain hospital displays",
            path: "/technician/displays",
            icon: <Monitor className="h-6 w-6 text-purple-600" />,
            role: "Technician",
            badge: "Staff",
        },
        {
            title: "Profile Settings",
            description: "Manage your account settings",
            path: "/profile-settings",
            icon: <Settings className="h-6 w-6 text-gray-600" />,
            role: "All",
            badge: "User",
        },
        {
            title: "Patient Portal",
            description: "Public patient portal",
            path: "/",
            icon: <Home className="h-6 w-6 text-blue-600" />,
            role: "Public",
            badge: "Public",
        },
    ]

    const getBadgeColor = (role: string) => {
        switch (role) {
            case "Admin":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "Doctor":
                return "bg-green-100 text-green-800 border-green-200"
            case "Nurse":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "Pharmacist":
                return "bg-purple-100 text-purple-800 border-purple-200"
            case "Technician":
                return "bg-orange-100 text-orange-800 border-orange-200"
            case "All":
                return "bg-gray-100 text-gray-800 border-gray-200"
            case "Public":
                return "bg-teal-100 text-teal-800 border-teal-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getBadgeTypeColor = (type: string) => {
        switch (type) {
            case "Core":
                return "bg-blue-600 text-white"
            case "Staff":
                return "bg-green-600 text-white"
            case "User":
                return "bg-gray-600 text-white"
            case "Public":
                return "bg-teal-600 text-white"
            default:
                return "bg-gray-600 text-white"
        }
    }

    return (
        <AuthGuard allowedRoles={["admin"]} className="container mx-auto p-6 space-y-6">
            <Navbar />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">System Overview</h1>
                    <p className="text-gray-600">Complete overview of all system pages and functionalities</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center">
                                    {page.icon}
                                    <span className="ml-2">{page.title}</span>
                                </CardTitle>
                                <Badge className={getBadgeTypeColor(page.badge)}>{page.badge}</Badge>
                            </div>
                            <CardDescription>{page.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Badge className={getBadgeColor(page.role)}>{page.role} Access</Badge>
                            <div className="flex justify-end">
                                <Link href={page.path}>
                                    <Button variant="outline">Visit Page</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AuthGuard>
    )
}