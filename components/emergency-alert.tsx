"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, MapPin, Clock } from "lucide-react"
import { EmergencyAlertProps1 } from "@/lib/helpers"
import { getAlertColor, getAlertDescription } from "@/lib/functions"

export function EmergencyAlert({ alerts, onDismiss }: EmergencyAlertProps1) {
  const [visibleAlerts, setVisibleAlerts] = useState(alerts)

  useEffect(() => {
    setVisibleAlerts(alerts)
  }, [alerts])

  if (visibleAlerts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {visibleAlerts.map((alert) => (
        <Alert key={alert.id} className="border-l-4 border-l-red-500 bg-red-50 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <AlertDescription className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className={`${getAlertColor(alert.type)} text-white`}>{alert.type}</Badge>
                  <span className="font-medium text-red-800">{getAlertDescription(alert.type)}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-red-700">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{alert.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{alert.time}</span>
                  </div>
                </div>
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(alert.id)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  )
}
