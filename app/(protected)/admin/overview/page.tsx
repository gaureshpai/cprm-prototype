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
    Shield,
    UserCheck,
    Heart,
    Syringe,
    Globe,
} from "lucide-react"
import { getBadgeTypeColor } from "@/lib/functions"

export default function AdminOverviewPage() {
    const pagesByRole = {
        Admin: {
            icon: <Shield className="h-5 w-5" />,
            color: "bg-blue-100 text-blue-800 border-blue-200",
            pages: [
                {
                    title: "Admin Dashboard",
                    description: "Main admin dashboard with system analytics and emergency alerts",
                    path: "/admin",
                    icon: <LayoutDashboard className="h-6 w-6 text-blue-600" />,
                    badge: "Core",
                },
                {
                    title: "Display Management",
                    description: "Manage all hospital display screens",
                    path: "/admin/displays",
                    icon: <Monitor className="h-6 w-6 text-purple-600" />,
                    badge: "Core",
                },
                {
                    title: "Department Management",
                    description: "Manage hospital departments",
                    path: "/admin/departments",
                    icon: <Building2 className="h-6 w-6 text-green-600" />,
                    badge: "Core",
                },
                {
                    title: "User Management",
                    description: "Manage staff accounts and permissions",
                    path: "/admin/Users",
                    icon: <UserCog className="h-6 w-6 text-orange-600" />,
                    badge: "Core",
                },
            ]
        },
        Doctor: {
            icon: <Stethoscope className="h-5 w-5" />,
            color: "bg-green-100 text-green-800 border-green-200",
            pages: [
                {
                    title: "Doctor Dashboard",
                    description: "Doctor's main dashboard",
                    path: "/doctor",
                    icon: <Stethoscope className="h-6 w-6 text-blue-600" />,
                    badge: "Doctor",
                },
                {
                    title: "Patient Management",
                    description: "Manage patient records and appointments",
                    path: "/doctor/patients",
                    icon: <Users className="h-6 w-6 text-green-600" />,
                    badge: "Doctor",
                },
                {
                    title: "OT Management",
                    description: "Operating theater scheduling and management",
                    path: "/doctor/ot",
                    icon: <Activity className="h-6 w-6 text-red-600" />,
                    badge: "Doctor",
                },
            ]
        },
        Nurse: {
            icon: <Heart className="h-5 w-5" />,
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            pages: [
                {
                    title: "Nurse Dashboard",
                    description: "Nurse's main dashboard",
                    path: "/nurse",
                    icon: <UserCircle className="h-6 w-6 text-blue-600" />,
                    badge: "Nurse",
                },
                {
                    title: "Token Queue Management",
                    description: "Manage patient queues and appointments",
                    path: "/nurse/token-queue",
                    icon: <Clock className="h-6 w-6 text-yellow-600" />,
                    badge: "Nurse",
                },
            ]
        },
        Pharmacist: {
            icon: <Pill className="h-5 w-5" />,
            color: "bg-purple-100 text-purple-800 border-purple-200",
            pages: [
                {
                    title: "Pharmacist Dashboard",
                    description: "Pharmacist's main dashboard",
                    path: "/pharmacist",
                    icon: <Pill className="h-6 w-6 text-blue-600" />,
                    badge: "Pharmacist",
                },
                {
                    title: "Drug Inventory",
                    description: "Manage medication inventory",
                    path: "/pharmacist/inventory",
                    icon: <Pill className="h-6 w-6 text-green-600" />,
                    badge: "Pharmacist",
                },
                {
                    title: "Prescription Orders",
                    description: "Process prescription orders",
                    path: "/pharmacist/orders",
                    icon: <Syringe className="h-6 w-6 text-orange-600" />,
                    badge: "Pharmacist",
                },
            ]
        },
        Technician: {
            icon: <Wrench className="h-5 w-5" />,
            color: "bg-orange-100 text-orange-800 border-orange-200",
            pages: [
                {
                    title: "Technician Dashboard",
                    description: "Technician's main dashboard",
                    path: "/technician",
                    icon: <Wrench className="h-6 w-6 text-blue-600" />,
                    badge: "Technician",
                },
                {
                    title: "Blood Bank Management",
                    description: "Manage blood inventory",
                    path: "/technician/blood-bank",
                    icon: <Droplets className="h-6 w-6 text-red-600" />,
                    badge: "Technician",
                },
                {
                    title: "Display Maintenance",
                    description: "Maintain hospital displays",
                    path: "/technician/displays",
                    icon: <Monitor className="h-6 w-6 text-purple-600" />,
                    badge: "Technician",
                },
            ]
        },
        General: {
            icon: <UserCheck className="h-5 w-5" />,
            color: "bg-gray-100 text-gray-800 border-gray-200",
            pages: [
                {
                    title: "Profile Settings",
                    description: "Manage your account settings",
                    path: "/profile-settings",
                    icon: <Settings className="h-6 w-6 text-gray-600" />,
                    badge: "User",
                },
            ]
        },
        Public: {
            icon: <Globe className="h-5 w-5" />,
            color: "bg-teal-100 text-teal-800 border-teal-200",
            pages: [
                {
                    title: "Patient Portal",
                    description: "Public patient portal",
                    path: "/",
                    icon: <Home className="h-6 w-6 text-blue-600" />,
                    badge: "Public",
                },
            ]
        },
    }

    return (
        <AuthGuard allowedRoles={["admin"]} className="container mx-auto p-6 space-y-8">
            <Navbar />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">System Overview</h1>
                    <p className="text-gray-600">Complete overview of all system pages organized by roles</p>
                </div>
            </div>

            {Object.entries(pagesByRole).map(([role, roleData], roleIndex) => (
                <div key={role} className="space-y-4">
                    <div className="flex justify-between space-x-3 border-b pb-3">
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${roleData.color}`}>
                            {roleData.icon}
                            <h2 className="text-xl font-semibold">{role} Access</h2>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            {roleData.pages.length} page{roleData.pages.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                        {roleData.pages.map((page, pageIndex) => (
                            <Card key={pageIndex} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-gray-300 hover:border-l-blue-500">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center">
                                            {page.icon}
                                            <span className="ml-2">{page.title}</span>
                                        </CardTitle>
                                        <Badge className={getBadgeTypeColor(page.badge)}>{page.badge}</Badge>
                                    </div>
                                    <CardDescription className="text-sm leading-relaxed">
                                        {page.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex justify-end">
                                        <Link href={page.path} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm" className="hover:bg-blue-50">
                                                Visit Page
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {roleIndex < Object.entries(pagesByRole).length - 1 && (
                        <div className="py-4"></div>
                    )}
                </div>
            ))}
        </AuthGuard>
    )
}