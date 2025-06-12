"use client"

import type React from "react"
import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit2, Trash2, Users, Search, Loader2, UserCheck, UserX, RefreshCw, User } from "lucide-react"
import {
  getAllUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  toggleUserStatusAction,
  getUserStatsAction,
  type UserWithStats,
} from "@/lib/user-actions"
import type { Role } from "@prisma/client"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import { roles, type UserFormData } from "@/lib/helpers"
import { getDepartmentOptions } from "@/lib/department-actions"

const UserCRUDPage = () => {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    name: "",
    email: "",
    role: "",
    password: "",
    department: "",
  })
  const [isPending, startTransition] = useTransition()
  const [stats, setStats] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
    loadStats()
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      const result = await getDepartmentOptions()
      setDepartments(result)
    } catch (error) {
      console.error("Error loading departments:", error)
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      startTransition(async () => {
        const result = await getAllUsersAction()
        if (result.success && result.data) {
          setUsers(result.data)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load users",
            variant: "destructive",
          })
        }
      })
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await getUserStatsAction()
      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const filteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

  const resetForm = () => {
    setFormData({
      username: "",
      name: "",
      email: "",
      role: "",
      department: "",
      password: "",
    })
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive",
      })
      return false
    }

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive",
      })
      return false
    }

    if (!formData.role) {
      toast({
        title: "Validation Error",
        description: "Role is required",
        variant: "destructive",
      })
      return false
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    if (formData.password && formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      startTransition(async () => {
        const formDataObj = new FormData()
        formDataObj.append("username", formData.username)
        formDataObj.append("name", formData.name)
        formDataObj.append("email", formData.email)
        formDataObj.append("role", formData.role as string)
        formDataObj.append("department", formData.department)
        if (formData.password) {
          formDataObj.append("password", formData.password)
        }

        const result = await createUserAction(formDataObj)

        if (result.success) {
          await loadUsers()
          await loadStats()
          setIsCreateDialogOpen(false)
          resetForm()

          toast({
            title: "Success",
            description: "User created successfully",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create user",
            variant: "destructive",
          })
        }
      })
    } catch (error: any) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: UserWithStats) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email || "",
      role: user.role,
      department: user.department || "",
      password: "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive",
      })
      return
    }

    try {
      startTransition(async () => {
        const formDataObj = new FormData()
        formDataObj.append("name", formData.name)
        formDataObj.append("email", formData.email)
        formDataObj.append("role", formData.role as string)
        formDataObj.append("department", formData.department)
        if (formData.password) {
          formDataObj.append("password", formData.password)
        }

        const result = await updateUserAction(editingUser.id, formDataObj)

        if (result.success) {
          await loadUsers()
          await loadStats()
          setIsEditDialogOpen(false)
          setEditingUser(null)
          resetForm()

          toast({
            title: "Success",
            description: "User updated successfully",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update user",
            variant: "destructive",
          })
        }
      })
    } catch (error: any) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      startTransition(async () => {
        const result = await deleteUserAction(userId)

        if (result.success) {
          await loadUsers()
          await loadStats()

          toast({
            title: "Success",
            description: `User ${userName} has been removed`,
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete user",
            variant: "destructive",
          })
        }
      })
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      startTransition(async () => {
        const result = await toggleUserStatusAction(userId)

        if (result.success) {
          await loadUsers()
          await loadStats()

          toast({
            title: "Success",
            description: `User ${currentStatus === "ACTIVE" ? "deactivated" : "activated"} successfully`,
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update user status",
            variant: "destructive",
          })
        }
      })
    } catch (error: any) {
      console.error("Error toggling user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: keyof UserFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field: keyof UserFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getRoleBadgeColor = (role: Role) => {
    const colors: Record<Role, string> = {
      ADMIN: "bg-red-100 text-red-800",
      DOCTOR: "bg-blue-100 text-blue-800",
      NURSE: "bg-green-100 text-green-800",
      TECHNICIAN: "bg-yellow-100 text-yellow-800",
      PHARMACIST: "bg-purple-100 text-purple-800",
    }
    return colors[role] || "bg-gray-100 text-gray-800"
  }

  const getStatusBadgeColor = (status: string) => {
    return status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const UserForm = ({ isEdit = false, onSubmit }: { isEdit?: boolean; onSubmit: (e: React.FormEvent) => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={handleInputChange("username")}
            placeholder="Enter username"
            disabled={isEdit || isPending}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleInputChange("name")}
            placeholder="Enter full name"
            disabled={isPending}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            placeholder="Enter email address"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password {!isEdit && "*"}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
            disabled={isPending}
            required={!isEdit}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select value={formData.role} onValueChange={handleSelectChange("role")} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select value={formData.department} onValueChange={handleSelectChange("department")} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setIsEditDialogOpen(false)
            } else {
              setIsCreateDialogOpen(false)
            }
          }}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Update User"
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </form>
  )

  return (
    <AuthGuard allowedRoles={["admin"]} className="container mx-auto p-6 space-y-6">
      <Navbar />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadUsers} disabled={isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new user to the hospital management system.</DialogDescription>
              </DialogHeader>
              <UserForm onSubmit={handleCreateUser} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || users.length}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byRole?.DOCTOR || users.filter((u) => u.role === "DOCTOR").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nurses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byRole?.NURSE || users.filter((u) => u.role === "NURSE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byRole?.ADMIN || users.filter((u) => u.role === "ADMIN").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage hospital staff and user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name, username, email, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.department || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)} disabled={isPending}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            disabled={isPending}
                          >
                            {user.status === "ACTIVE" ? (
                              <UserX className="h-4 w-4 text-orange-600" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={isPending}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.name}? This action cannot be undone. If the user
                                  has associated data, they will be deactivated instead.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id, user.name)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>Loading users...</p>
              <p className="text-gray-600">Please wait while we fetch the user data.</p>
            </div>
          ) : (
            filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No users found matching your search." : "No users found."}
              </div>
            )
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions.</DialogDescription>
          </DialogHeader>
          <UserForm isEdit={true} onSubmit={handleUpdateUser} />
        </DialogContent>
      </Dialog>
    </AuthGuard>
  )
}

export default UserCRUDPage