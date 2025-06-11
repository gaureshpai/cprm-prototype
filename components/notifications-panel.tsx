"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, AlertTriangle, Info, CheckCircle, Clock, X, Loader2, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getAllAnnouncementsAction, type Announcement } from "@/lib/content-actions"
import { getNotificationColor } from "@/lib/functions"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  time: string
  read: boolean
  priority?: string
}

export function NotificationsPanel() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unreadCount = notifications.filter((n) => !n.read).length
  const totalCount = notifications.length
  
  useEffect(() => {
    fetchAnnouncements()
  }, [])
  
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      fetchAnnouncements()
    }
  }, [isOpen])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getAllAnnouncementsAction()

      if (result.success && result.data) {
        const notificationsFromAnnouncements = mapAnnouncementsToNotifications(result.data)
        setNotifications(notificationsFromAnnouncements)
      } else {
        setError(result.error || "Failed to fetch announcements")
      }
    } catch (error) {
      console.error("Error fetching announcements:", error)
      setError("Failed to fetch announcements")
    } finally {
      setLoading(false)
    }
  }

  const mapAnnouncementsToNotifications = (announcements: Announcement[]): Notification[] => {
    return announcements.map((announcement) => {
      const date = new Date(announcement.createdAt)
      const formattedDate = date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })

      return {
        id: announcement.id,
        title: "Announcement",
        message: announcement.text,
        type: "info",
        time: formattedDate,
        read: false,
        priority: announcement.active ? "normal" : "low",
      }
    })
  }

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
                <CardTitle className="text-lg">Announcements</CardTitle>
                <CardDescription>
                  {totalCount === 0
                    ? "No announcements"
                    : unreadCount > 0
                      ? `${unreadCount} unread of ${totalCount} announcements`
                      : `All ${totalCount} announcements read`
                  }
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {!loading && (
                  <Button variant="outline" size="sm" onClick={fetchAnnouncements}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading Announcements...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                  <p>{error}</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={fetchAnnouncements}>
                    Try Again
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No Announcements</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 ${getNotificationColor(notification.type, notification.read)}`}
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