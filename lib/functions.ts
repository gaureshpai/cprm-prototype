export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "occupied":
      return "bg-red-100 text-red-800 border-red-200"
    case "available":
      return "bg-green-100 text-green-800 border-green-200"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "critical":
      return "bg-red-100 text-red-800 border-red-200"
    case "stable":
      return "bg-green-100 text-green-800 border-green-200"
    case "recovering":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "normal":
      return "bg-green-100 text-green-800 border-green-200"
    case "controlled":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "low":
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case "online":
      return "text-green-600 bg-green-50 border-green-200"
    case "offline":
      return "text-red-600 bg-red-50 border-red-200"
    case "warning":
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case "occupied":
    case "in progress":
      return "bg-red-600 text-white"
    case "available":
      return "bg-green-600 text-white"
    case "booked":
    case "scheduled":
      return "bg-blue-600 text-white"
    case "cleaning":
      return "bg-purple-600 text-white"
    case "critical":
      return "bg-red-100 text-red-800 border-red-200"
    case "low":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export const getStatusText = (status: string) => {
  switch (status) {
    case "online":
      return "Online"
    case "offline":
      return "Offline"
    case "warning":
      return "Warning"
    default:
      return "Unknown"
  }
}

export const getNotificationBgColor = (type: string, priority: string) => {
  if (priority === "high") {
    return "bg-red-50 border-red-200"
  }
  switch (type) {
    case "emergency":
      return "bg-red-50 border-red-200"
    case "warning":
      return "bg-yellow-50 border-yellow-200"
    case "appointment":
      return "bg-blue-50 border-blue-200"
    case "prescription":
      return "bg-green-50 border-green-200"
    default:
      return "bg-gray-50 border-gray-200"
  }
}

export const getAlertSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "high":
      return "text-red-600 bg-red-50 border-red-200"
    case "medium":
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case "low":
      return "text-blue-600 bg-blue-50 border-blue-200"
    case "info":
      return "text-green-600 bg-green-50 border-green-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

export const getAlertColor = (type: string) => {
  switch (type) {
    case "Code Blue":
      return "bg-blue-500"
    case "Code Red":
      return "bg-red-500"
    case "Code Black":
      return "bg-gray-800"
    case "Code Orange":
      return "bg-orange-500"
    case "Code Silver":
      return "bg-gray-500"
    case "Code Yellow":
      return "bg-yellow-500"
    case "Code Pink":
      return "bg-pink-500"
    default:
      return "bg-gray-500"
  }
}

export const getAlertDescription = (type: string) => {
  switch (type) {
    case "Code Blue":
      return "Cardiac Emergency"
    case "Code Red":
      return "Fire Emergency"
    case "Code Pink":
      return "Infant/Child Abduction"
    case "Code Yellow":
      return "Bomb Threat"
    default:
      return "Emergency Alert"
  }
}

export const getPriorityLabel = (priority: number) => {
  switch (priority) {
    case 5:
      return "Critical"
    case 4:
      return "High"
    case 3:
      return "Medium"
    case 2:
      return "Low"
    case 1:
      return "Info"
    default:
      return "Medium"
  }
}

export const getNotificationColor = (type: string, read: boolean) => {
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

export const getConditionColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case "critical":
      return "text-red-600 bg-red-50 border-red-200"
    case "improving":
      return "text-green-600 bg-green-50 border-green-200"
    case "stable":
      return "text-blue-600 bg-blue-50 border-blue-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

export const getSurgeryStatusColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800"
    case "in-progress":
      return "bg-yellow-100 text-yellow-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getPrescriptionStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-500"
    case "processing":
      return "bg-blue-500"
    case "completed":
      return "bg-green-500"
    default:
      return "bg-gray-500"
  }
}

export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200"
    case "urgent":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "routine":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export const getScheduleStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "in-progress":
      return "bg-blue-500"
    case "scheduled":
      return "bg-green-500"
    case "completed":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}