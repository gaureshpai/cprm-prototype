"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Stethoscope, Heart, Brain, Bone, Eye, Baby, Phone, MapPin } from "lucide-react"
import { StaffDirectoryProps } from "@/lib/interfaces"
import { getAvailabilityColor } from "@/lib/functions"

export function StaffDirectory({ staff, department }: StaffDirectoryProps) {
  const getDepartmentIcon = (dept: string) => {
    switch (dept.toLowerCase()) {
      case "cardiology":
        return <Heart className="h-4 w-4 text-red-500" />
      case "neurology":
        return <Brain className="h-4 w-4 text-purple-500" />
      case "orthopedics":
        return <Bone className="h-4 w-4 text-blue-500" />
      case "ophthalmology":
        return <Eye className="h-4 w-4 text-green-500" />
      case "pediatrics":
        return <Baby className="h-4 w-4 text-pink-500" />
      default:
        return <Stethoscope className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredStaff = department
    ? staff.filter((member) => member.department.toLowerCase() === department.toLowerCase())
    : staff

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Stethoscope className="h-5 w-5 text-blue-400" />
          <span>Staff Directory</span>
          {department && <Badge variant="outline">{department}</Badge>}
        </CardTitle>
        <CardDescription>Current staff availability and contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => (
            <Card key={member.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={member.image || "/logo.png"} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`
                      absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
                      ${getAvailabilityColor(member.availability)}
                    `}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{member.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{member.designation}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getDepartmentIcon(member.department)}
                  <span className="text-sm">{member.department}</span>
                </div>
                {member.specialization && <p className="text-sm text-gray-600">{member.specialization}</p>}
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{member.location}</span>
                </div>
                {member.contact && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{member.contact}</span>
                  </div>
                )}
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    member.availability === "available"
                      ? "border-green-500 text-green-700"
                      : member.availability === "busy"
                        ? "border-yellow-500 text-yellow-700"
                        : "border-gray-500 text-gray-700"
                  }`}
                >
                  {member.availability}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}