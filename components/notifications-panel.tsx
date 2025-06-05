"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, AlertTriangle, Info, CheckCircle, Clock, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Notification {
  id: string
  type: "emergency" | "info" | "warning" | "success"
  title: string
  message: string
  time: string
  read: boolean
  priority: "high" | "medium" | "low"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "emergency",
    title: "Emergency Alert",
    message: "Code Blue - ICU Ward 3, Bed 12. Immediate assistance required.",
    time: "2 min ago",
    read: false,
    priority: "high",
  },
  {
    id: "2",
    type: "warning",
    title: "Medication Alert",
    message: "Low stock alert: Insulin injection - Only 45 units remaining",
    time: "15 min ago",
    read: false,
    priority: "medium",
  },
  {
    id: "3",
    type: "info",
    title: "Schedule Update",
    message: "Your 2:00 PM appointment with Priya Sharma has been confirmed",
    time: "30 min ago",
    read: true,
    priority: "low",
  },
  {
    id: "4",
    type: "success",
    title: "Lab Results",
    message: "Lab results for Rajesh Kumar are now available for review",
    time: "1 hour ago",
    read: false,
    priority: "medium",
  },
  {
    id: "5",
    type: "info",
    title: "System Maintenance",
    message: "Scheduled maintenance tonight from 11 PM to 2 AM",
    time: "2 hours ago",
    read: true,
    priority: "low",
  },
  {
    id: "6",
    type: "warning",
    title: "Display Offline",
    message: "Display #3 in Cardiology Wing is offline - Technical team notified",
    time: "3 hours ago",
    read: true,
    priority: "medium",
  },
]

export function NotificationsPanel() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getNotificationColor = (type: string, read: boolean) => {
    const baseClasses = read ? "bg-gray-50" : "bg-white border-l-4"

    switch (type) {
      case "emergency":
        return `${baseClasses} ${!read ? "border-l-red-500" : ""}`
      case "warning":
        return `${baseClasses} ${!read ? "border-l-yellow-500" : ""}`
      case "success":
        return `${baseClasses} ${!read ? "border-l-green-500" : ""}`
      default:
        return `${baseClasses} ${!read ? "border-l-blue-500" : ""}`
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
                </CardDescription>
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${getNotificationColor(notification.type, notification.read)}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-600"}`}
                            >
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              {notification.priority === "high" && (
                                <Badge variant="destructive" className="text-xs">
                                  High
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className={`text-sm mt-1 ${!notification.read ? "text-gray-700" : "text-gray-500"}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {notification.time}
                            </div>
                            {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full"></div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
