export async function fetchCSVData(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
    }

    const text = await response.text()
    return parseCSV(text)
  } catch (error) {
    console.error("Error fetching CSV data:", error)
    return []
  }
}

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

export function toDrugInventory(data: Record<string, string>[]): DrugInventory[] {
  return data.map(item => ({
    drug_id: item.drug_id || '',
    drug_name: item.drug_name || '',
    stock_qty: item.stock_qty || '0',
    reorder_level: item.reorder_level || '0',
    status: item.status || ''
  }))
}

export function toTokenQueue(data: Record<string, string>[]): TokenQueue[] {
  return data.map(item => ({
    token_id: item.token_id || '',
    dept_id: item.dept_id || '',
    patient_name: item.patient_name || '',
    status: item.status || ''
  }))
}

export function toDepartment(data: Record<string, string>[]): Department[] {
  return data.map(item => ({
    dept_id: item.dept_id || '',
    department_name: item.department_name || '',
    location: item.location || ''
  }))
}

export function toBloodBank(data: Record<string, string>[]): BloodBank[] {
  return data.map(item => ({
    blood_id: item.blood_id || '',
    blood_type: item.blood_type || '',
    units_available: item.units_available || '0',
    critical_level: item.critical_level || '0',
    status: item.status || ''
  }))
}

export function toEmergencyAlert(data: Record<string, string>[]): EmergencyAlert[] {
  return data.map(item => ({
    alert_id: item.alert_id || '',
    code_type: item.code_type || '',
    department: item.department || '',
    timestamp: item.timestamp || '',
    status: item.status || ''
  }))
}

export const CSV_URLS = {
  drugInventory: "./drug_inventory.csv",
  tokenQueue: "./token_queue.csv",
  departments: "./departments.csv",
  bloodBank: "./blood_bank.csv",
  emergencyAlerts: "./emergency_alerts.csv",
}

export interface DrugInventory {
  drug_id: string
  drug_name: string
  stock_qty: string
  reorder_level: string
  status: string
}

export interface TokenQueue {
  token_id: string
  dept_id: string
  patient_name: string
  status: string
}

export interface Department {
  dept_id: string
  department_name: string
  location: string
}

export interface BloodBank {
  blood_id: string
  blood_type: string
  units_available: string
  critical_level: string
  status: string
}

export interface EmergencyAlert {
  alert_id: string
  code_type: string
  department: string
  timestamp: string
  status: string
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