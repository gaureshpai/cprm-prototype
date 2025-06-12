import type React from "react"
import type { Role } from "@prisma/client"
import type { PatientData } from "./doctor-service"
import type { OTData } from "./ot-service"

export const roles: Role[] = ["ADMIN", "DOCTOR", "NURSE", "TECHNICIAN", "PHARMACIST"]

export const fallbackDepartments = [
  "Administration",
  "Cardiology",
  "Emergency",
  "Pharmacy",
  "Laboratory",
  "Radiology",
  "ICU",
  "Surgery",
]

export async function getDepartmentOptions(): Promise<string[]> {
  try {
    const { getAllDepartmentsAction } = await import("./department-actions")
    const result = await getAllDepartmentsAction()
    if (result.success && result.data && result.data.length > 0) {
      return result.data.map((dept) => dept.name)
    }
    return fallbackDepartments
  } catch (error) {
    console.error("Error fetching departments:", error)
    return fallbackDepartments
  }
}

export interface UserFormData {
  username: string
  name: string
  password?: string
  email: string
  role: Role | ""
  department: string
}

export interface OTTheater {
  id: string
  name: string
  status: "occupied" | "available" | "maintenance" | "cleaning" | "booked"
  currentSurgery?: {
    patient: string
    procedure: string
    surgeon: string
    startTime: string
    estimatedDuration: string
    elapsed: string
    progress: number
  }
  nextSurgery?: {
    patient: string
    procedure: string
    scheduledTime: string
  }
  lastCleaned?: string
  maintenanceType?: string
  estimatedCompletion?: string
}

export interface EmergencyAlert {
  id: string
  codeType: string
  message: string
  location: string
  priority: number
  active: boolean
  createdAt: string
}

export interface Medication {
  id: string
  drugName: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  isCustom: boolean
}

export interface DrugOption {
  id: string
  drugName: string
  currentStock: number
  minStock: number
  status: string
  category?: string | null
  expiryDate?: Date | null
  location: string
  isAvailable: boolean
}

export interface DisplayPageProps {
  params: Promise<{ id: string }>
}

export interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  className?: string
}

export interface EmergencyAlert1 {
  id: number
  type: "Code Blue" | "Code Red" | "Code Pink" | "Code Yellow"
  location: string
  time: string
  severity: "critical" | "high" | "medium"
  description?: string
}

export interface EmergencyAlertProps1 {
  alerts: EmergencyAlert1[]
  onDismiss: (id: number) => void
}

export interface DrugInventoryItem {
  id: string
  drugName: string
  currentStock: number
  minStock: number
  status: string
  category: string
  updatedAt: string
  location?: string
  batchNumber?: string
  expiryDate?: string
}

export interface InventoryClientProps {
  inventory: DrugInventoryItem[]
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  time: string
  read: boolean
  priority?: string
}

export interface PatientFormProps {
  patient?: PatientData
  onSuccess?: () => void
  onCancel?: () => void
}

export interface PharmacyStatistics {
  totalDrugs: number
  lowStockCount: number
  criticalStockCount: number
  pendingPrescriptions: number
  processingPrescriptions: number
  completedPrescriptionsToday: number
  availableStock: number
}

export interface TopMedication {
  name: string
  count: number
}

export interface PrescriptionTrend {
  date: string
  pending: number
  processing: number
  completed: number
}

export interface PharmacyDashboardClientProps {
  statistics: PharmacyStatistics
  topMedications: TopMedication[]
  prescriptionTrends: PrescriptionTrend[]
}

export interface PublicDisplayProps {
  displayId: string
  displayData?: {
    id: string
    location: string
    status: string
    content: string
    lastUpdate: string
    isActive: boolean
    config?: any
  }
}

export interface DisplayData {
  tokenQueue: Array<{
    token_id: string
    patient_name: string
    display_name?: string | null
    status: string
    department: string
    priority: number
    estimated_time?: string | null
  }>
  departments: Array<{
    dept_id: string
    department_name: string
    location: string
    current_tokens: number
  }>
  emergencyAlerts: Array<{
    id: string
    codeType: string
    location: string
    message: string
    priority: number
  }>
  drugInventory: Array<{
    drug_id: string
    drug_name: string
    current_stock: number
    min_stock: number
    status: string
  }>
  bloodBank: Array<{
    blood_id: string
    blood_type: string
    units_available: number
    critical_level: number
    status: string
    expiry_date: string
  }>
  otStatus?: OTData
  contentType?: string
}

export interface Patient {
  id: string
  name: string
  age?: number
  condition: string
  priority: "low" | "medium" | "high" | "critical"
}

export interface Doctor {
  id: string
  name: string
  department?: string
  email?: string
}

export interface Theater {
  id: string
  name: string
  status: string
  lastCleaned?: string
}

export interface SurgerySchedulerProps {
  onSuccess: () => void
  onCancel: () => void
  availableTheaters: Theater[]
}

export interface TheaterManagementModalProps {
  theaters: OTTheater[]
  onRefresh: () => void
}

export interface User {
  id: string
  name: string
  email?: string
  password?: string
  role: "admin" | "doctor" | "nurse" | "technician" | "pharmacist" | "patient"
  username?: string
  department?: string
  specialization?: string
}

export interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  isAuthenticated?: boolean
  isLoading: boolean
}

export function generateDisplayName(patientName: string, tokenNumber: string): string {
  const nameParts = patientName.trim().split(" ")
  if (nameParts.length === 1) {
    return `${nameParts[0].charAt(0)}***`
  } else if (nameParts.length >= 2) {
    return `${nameParts[0].charAt(0)}*** ${nameParts[nameParts.length - 1].charAt(0)}***`
  }
  return `T${tokenNumber}`
}