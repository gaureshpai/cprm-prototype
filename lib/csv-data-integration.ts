export const CSV_DATA_SOURCES = {
  drugInventory: '/data/drug_inventory.csv',
  tokenQueue: '/data/token_queue.csv',
  departments: '/data/departments.csv',
  bloodBank: '/data/blood_bank.csv',
  emergencyAlerts: '/data/emergency_alerts.csv',
  otStatus: '/data/ot_status.csv'
}
export async function fetchCSVData(url: string) {
  try {
    const response = await fetch(url)
    const csvText = await response.text()

    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    return lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        const values = line.split(",").map((v) => v.trim())
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ""
        })
        return obj
      })
  } catch (error) {
    console.error("Error fetching CSV data:", error)
    return []
  }
}

export function anonymizePatientData(data: any[]) {
  return data.map((item) => ({
    ...item,
    patient_name: item.patient_name
      ? `${item.patient_name.charAt(0)}. ${item.patient_name.split(" ").pop()}`
      : "Anonymous",
    
    display_name: item.patient_name
      ? item.patient_name
          .split(" ")
          .map((n: string) => n.charAt(0))
          .join(".")
      : "A.P.",
  }))
}
