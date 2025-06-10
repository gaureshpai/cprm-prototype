import { ReactNode } from "react"

export interface DrugInventory {
    drug_id: string
    drug_name: string
    stock_qty: string
    reorder_level: string
    status: string
    last_updated: string
}

export interface TokenQueue {
    token_id: string
    dept_id: string
    patient_name: string
    status: string
    timestamp: string
    estimated_wait: number
}

export interface Department {
    dept_id: string
    department_name: string
    location: string
    current_tokens: number
    avg_wait_time: number
}

export interface BloodBank {
    blood_id: string
    blood_type: string
    units_available: string
    critical_level: string
    status: string
    expiry_date: string
}

export interface EmergencyAlert {
    alert_id: string
    code_type: string
    department: string
    timestamp: string
    status: string
    severity?: string
}

export interface OTStatus {
    ot_id: string
    patient_name: string
    procedure: string
    status: string
    progress: number
    start_time: string
    estimated_end: string
    surgeon: string
}

export interface HospitalData {
    drugInventory: DrugInventory[]
    tokenQueue: TokenQueue[]
    departments: Department[]
    bloodBank: BloodBank[]
    emergencyAlerts: EmergencyAlert[]
    otStatus: OTStatus[]
}


export interface Medication {
    id: string
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
}

export interface Patient {
    id: string
    name: string
    age: number
    gender: string
    condition: string
}

export interface Notification {
    id: string
    type: "emergency" | "info" | "warning" | "success"
    title: string
    message: string
    time: string
    read: boolean
    priority: "high" | "medium" | "low"
}

export interface PatientFlowStep {
    id: string
    name: string
    icon: React.ReactNode
    status: "completed" | "current" | "pending"
    estimatedTime?: string
    actualTime?: string
}

export interface PatientFlowProps {
    patientName: string
    tokenId: string
    currentStep: number
    steps: PatientFlowStep[]
}

export interface StaffMember {
    id: string
    name: string
    designation: string
    department: string
    specialization?: string
    availability: "available" | "busy" | "off-duty"
    location: string
    contact?: string
    image?: string
}

export interface User {
    id: string
    name: string
    email?: string
    password?: string
    role: "admin" | "doctor" | "nurse" | "technician" | "pharmacist" | "patient"
    username?: string
    permissions: string[]
    department?: string
    specialization?: string
}

export interface AuthContextType {
    user: User | null
    login: (userData: User) => void
    logout: () => void
    hasPermission?: (permission: string) => boolean
    isAuthenticated?: boolean
    isLoading: boolean
}

export interface Props {
    children: ReactNode
    fallback?: ReactNode
}

export interface State {
    hasError: boolean
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