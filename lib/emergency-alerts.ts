export interface EmergencyAlert {
  id: string
  codeType: "Code Blue" | "Code Red" | "Code Pink" | "Code Yellow" | "Code Green"
  department: string
  location: string
  severity: "critical" | "high" | "medium" | "low"
  message: string
  timestamp: string
  status: "active" | "acknowledged" | "resolved"
  broadcastTo: string[]
}

export const EMERGENCY_CODES = {
  "Code Blue": {
    color: "bg-blue-600",
    description: "Medical Emergency - Cardiac/Respiratory Arrest",
    priority: "critical",
    autoDisplay: true,
  },
  "Code Red": {
    color: "bg-red-600",
    description: "Fire Emergency",
    priority: "critical",
    autoDisplay: true,
  },
  "Code Pink": {
    color: "bg-pink-600",
    description: "Pediatric Emergency",
    priority: "high",
    autoDisplay: true,
  },
  "Code Yellow": {
    color: "bg-yellow-600",
    description: "Security Alert",
    priority: "medium",
    autoDisplay: false,
  },
  "Code Green": {
    color: "bg-green-600",
    description: "Emergency Activation",
    priority: "high",
    autoDisplay: true,
  },
} as const

export class EmergencyBroadcastSystem {
  private static instance: EmergencyBroadcastSystem
  private alerts: EmergencyAlert[] = []
  private subscribers: ((alert: EmergencyAlert) => void)[] = []

  static getInstance() {
    if (!EmergencyBroadcastSystem.instance) {
      EmergencyBroadcastSystem.instance = new EmergencyBroadcastSystem()
    }
    return EmergencyBroadcastSystem.instance
  }

  subscribe(callback: (alert: EmergencyAlert) => void) {
    this.subscribers.push(callback)
  }

  unsubscribe(callback: (alert: EmergencyAlert) => void) {
    this.subscribers = this.subscribers.filter((sub) => sub !== callback)
  }

  broadcastAlert(alert: Omit<EmergencyAlert, "id" | "timestamp">) {
    const fullAlert: EmergencyAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    this.alerts.push(fullAlert)
    
    this.subscribers.forEach((callback) => callback(fullAlert))
    
    if (fullAlert.severity !== "critical") {
      setTimeout(
        () => {
          this.acknowledgeAlert(fullAlert.id)
        },
        5 * 60 * 1000,
      )
    }

    return fullAlert
  }

  acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.status = "acknowledged"
      this.subscribers.forEach((callback) => callback(alert))
    }
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.status = "resolved"
      this.subscribers.forEach((callback) => callback(alert))
    }
  }

  getActiveAlerts() {
    return this.alerts.filter((alert) => alert.status === "active")
  }
}
