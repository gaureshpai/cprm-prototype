import { BloodBank, Department, DrugInventory, EmergencyAlert, HospitalData, OTStatus, TokenQueue } from "./interfaces"
import { CSV_URLS } from "./mock-data"
import Papa from 'papaparse'

function parseCSV(text: string) {
  const lines = text.split("\n")
  const headers = lines[0].split(",").map((header) => header.trim())

  return lines
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const values = line.split(",").map((value) => value.trim())
      const record: Record<string, string> = {}

      headers.forEach((header, index) => {
        record[header] = values[index] || ""
      })

      return record
    })
}

export async function fetchCSVData<T>(url: string): Promise<T[]> {
  try {
    const response = await fetch(url)
    const text = await response.text()
    const result = Papa.parse<T>(text, {
      header: true,
      skipEmptyLines: true
    })
    return result.data
  } catch (error) {
    console.error(`Error fetching CSV from ${url}:`, error)
    return []
  }
}

export async function fetchAllData(): Promise<HospitalData> {
  const [
    drugInventory,
    tokenQueue,
    departments,
    bloodBank,
    emergencyAlerts,
    otStatus
  ] = await Promise.all([
    fetchCSVData<DrugInventory>(CSV_URLS.drugInventory),
    fetchCSVData<TokenQueue>(CSV_URLS.tokenQueue),
    fetchCSVData<Department>(CSV_URLS.departments),
    fetchCSVData<BloodBank>(CSV_URLS.bloodBank),
    fetchCSVData<EmergencyAlert>(CSV_URLS.emergencyAlerts),
    fetchCSVData<OTStatus>(CSV_URLS.otStatus)
  ])

  tokenQueue.forEach(t => t.estimated_wait = Number(t.estimated_wait) || 0)
  departments.forEach(d => {
    d.current_tokens = Number(d.current_tokens) || 0
    d.avg_wait_time = Number(d.avg_wait_time) || 0
  })
  otStatus.forEach(ot => ot.progress = Number(ot.progress) || 0)

  return {
    drugInventory,
    tokenQueue,
    departments,
    bloodBank,
    emergencyAlerts,
    otStatus
  }
}

export function getInventoryStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "critical":
      return "text-red-600 bg-red-50 border-red-200"
    case "low":
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case "available":
      return "text-green-600 bg-green-50 border-green-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

export function getBloodStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "critical":
      return "text-red-600 bg-red-50 border-red-200"
    case "low":
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case "available":
      return "text-green-600 bg-green-50 border-green-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

export function getTokenStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "in progress":
      return "bg-blue-500"
    case "waiting":
      return "bg-yellow-500"
    case "completed":
      return "bg-green-500"
    case "cancelled":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export function getAlertStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-red-500"
    case "in progress":
      return "bg-orange-500"
    case "cleared":
      return "bg-green-500"
    default:
      return "bg-gray-500"
  }
}

export function getCodeTypeColor(codeType: string) {
  switch (codeType.toLowerCase()) {
    case "code blue":
      return "bg-blue-500"
    case "code red":
      return "bg-red-500"
    case "code pink":
      return "bg-pink-500"
    case "code yellow":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

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

export const getOrderStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "ordered":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "shipped":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
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

export const getStepColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500 text-white"
    case "current":
      return "bg-blue-500 text-white animate-pulse"
    case "pending":
      return "bg-gray-200 text-gray-600"
    default:
      return "bg-gray-200 text-gray-600"
  }
}

export const getAvailabilityColor = (availability: string) => {
  switch (availability) {
    case "available":
      return "bg-green-500"
    case "busy":
      return "bg-yellow-500"
    case "off-duty":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}