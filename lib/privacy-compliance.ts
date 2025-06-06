export interface PrivacySettings {
  showFullNames: boolean
  showPatientDetails: boolean
  allowPublicDisplay: boolean
  requireApproval: boolean
  logAccess: boolean
}

export const PRIVACY_LEVELS = {
  PUBLIC_DISPLAY: {
    showFullNames: false,
    showPatientDetails: false,
    allowPublicDisplay: true,
    requireApproval: false,
    logAccess: true,
  },
  STAFF_INTERNAL: {
    showFullNames: true,
    showPatientDetails: true,
    allowPublicDisplay: false,
    requireApproval: true,
    logAccess: true,
  },
  EMERGENCY_OVERRIDE: {
    showFullNames: true,
    showPatientDetails: true,
    allowPublicDisplay: true,
    requireApproval: false,
    logAccess: true,
  },
} as const

export function applyPrivacyFilter(data: any[], level: keyof typeof PRIVACY_LEVELS) {
  const settings = PRIVACY_LEVELS[level]

  return data.map((item) => {
    const filtered = { ...item }

    if (!settings.showFullNames && item.patient_name) {
      // Show only initials for privacy
      const names = item.patient_name.split(" ")
      filtered.patient_name =
        names.length > 1 ? `${names[0].charAt(0)}. ${names[names.length - 1]}` : `${names[0].charAt(0)}.`
    }

    if (!settings.showPatientDetails) {
      // Remove sensitive details
      delete filtered.phone
      delete filtered.address
      delete filtered.medical_history
    }

    return filtered
  })
}

export function logDataAccess(userId: string, dataType: string, action: string) {
  // Log all data access for compliance
  console.log(`[PRIVACY LOG] User: ${userId}, Data: ${dataType}, Action: ${action}, Time: ${new Date().toISOString()}`)

  // In production, this would write to a secure audit log
  return {
    userId,
    dataType,
    action,
    timestamp: new Date().toISOString(),
    compliance: "LOGGED",
  }
}
