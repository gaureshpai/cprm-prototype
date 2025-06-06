import type { DrugInventory, TokenQueue, BloodBank, EmergencyAlert } from "./interfaces"

export class SyncSimulation {
  private subscribers: Map<string, Function[]> = new Map()
  private drugInventory: DrugInventory[] = []
  private tokenQueue: TokenQueue[] = []
  private bloodBank: BloodBank[] = []
  private emergencyAlerts: EmergencyAlert[] = []
  private simulationInterval: NodeJS.Timeout | null = null

  constructor() {
    this.subscribers.set("drugInventory", [])
    this.subscribers.set("tokenQueue", [])
    this.subscribers.set("bloodBank", [])
    this.subscribers.set("emergencyAlerts", [])
  }

  public setData(
    drugInventory: DrugInventory[],
    tokenQueue: TokenQueue[],
    bloodBank: BloodBank[],
    emergencyAlerts: EmergencyAlert[],
  ) {
    this.drugInventory = [...drugInventory]
    this.tokenQueue = [...tokenQueue]
    this.bloodBank = [...bloodBank]
    this.emergencyAlerts = [...emergencyAlerts]
  }

  public subscribe(dataType: string, callback: Function) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, [])
    }
    this.subscribers.get(dataType)?.push(callback)

    return () => {
      const callbacks = this.subscribers.get(dataType) || []
      const index = callbacks.indexOf(callback)
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private notify(dataType: string, data: any) {
    const callbacks = this.subscribers.get(dataType) || []
    callbacks.forEach((callback) => callback(data))
  }

  public startSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
    }

    this.simulationInterval = setInterval(() => {
      this.simulateChanges()
    }, 5000)
  }

  public stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }
  }

  private simulateChanges() {
    if (Math.random() < 0.2 && this.tokenQueue.length > 0) {
      this.simulateTokenQueueChange()
    }

    if (Math.random() < 0.1 && this.drugInventory.length > 0) {
      this.simulateDrugInventoryChange()
    }

    if (Math.random() < 0.05 && this.bloodBank.length > 0) {
      this.simulateBloodBankChange()
    }

    if (Math.random() < 0.02) {
      this.simulateEmergencyAlert()
    }
  }

  private simulateTokenQueueChange() {
    const updatedQueue = [...this.tokenQueue]

    const waitingIndex = updatedQueue.findIndex((t) => t.status.toLowerCase() === "waiting")
    if (waitingIndex !== -1) {
      updatedQueue[waitingIndex] = {
        ...updatedQueue[waitingIndex],
        status: "In Progress",
      }
    }

    const inProgressIndex = updatedQueue.findIndex((t) => t.status.toLowerCase() === "in progress")
    if (inProgressIndex !== -1) {
      updatedQueue[inProgressIndex] = {
        ...updatedQueue[inProgressIndex],
        status: "Completed",
      }
    }

    this.tokenQueue = updatedQueue
    this.notify("tokenQueue", updatedQueue)
  }

  private simulateDrugInventoryChange() {
    const updatedInventory = [...this.drugInventory]

    const index = Math.floor(Math.random() * updatedInventory.length)
    const drug = updatedInventory[index]

    const decrease = Math.floor(Math.random() * 10) + 1
    const newStock = Math.max(0, Number.parseInt(drug.stock_qty) - decrease)

    let newStatus = drug.status
    if (newStock <= Number.parseInt(drug.reorder_level) * 0.5) {
      newStatus = "Critical"
    } else if (newStock <= Number.parseInt(drug.reorder_level)) {
      newStatus = "Low"
    } else {
      newStatus = "Available"
    }

    updatedInventory[index] = {
      ...drug,
      stock_qty: newStock.toString(),
      status: newStatus,
    }

    this.drugInventory = updatedInventory
    this.notify("drugInventory", updatedInventory)
  }

  private simulateBloodBankChange() {
    const updatedBloodBank = [...this.bloodBank]
    const index = Math.floor(Math.random() * updatedBloodBank.length)
    const blood = updatedBloodBank[index]
    const newUnits = Math.max(0, Number.parseInt(blood.units_available) - 1)

    let newStatus = blood.status
    if (newUnits <= Number.parseInt(blood.critical_level) * 0.5) {
      newStatus = "Critical"
    } else if (newUnits <= Number.parseInt(blood.critical_level)) {
      newStatus = "Low"
    } else {
      newStatus = "Available"
    }

    updatedBloodBank[index] = {
      ...blood,
      units_available: newUnits.toString(),
      status: newStatus,
    }

    this.bloodBank = updatedBloodBank
    this.notify("bloodBank", updatedBloodBank)
  }

  private simulateEmergencyAlert() {
    const codeTypes = ["Code Blue", "Code Red", "Code Pink", "Code Yellow"]
    const departments = ["Emergency", "ICU", "OT1", "OT2", "Pharmacy", "Cardiology"]

    const newAlert: EmergencyAlert = {
      alert_id: `E${Date.now()}`,
      code_type: codeTypes[Math.floor(Math.random() * codeTypes.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      timestamp: new Date().toISOString(),
      status: "Active",
    }

    const updatedAlerts = [...this.emergencyAlerts, newAlert]
    this.emergencyAlerts = updatedAlerts
    this.notify("emergencyAlerts", updatedAlerts)

    setTimeout(() => {
      const clearedAlerts = this.emergencyAlerts.map((alert) =>
        alert.alert_id === newAlert.alert_id ? { ...alert, status: "Cleared" } : alert,
      )
      this.emergencyAlerts = clearedAlerts
      this.notify("emergencyAlerts", clearedAlerts)
    }, 120000)
  }

  public triggerEmergencyAlert(codeType: string, department: string) {
    const newAlert: EmergencyAlert = {
      alert_id: `E${Date.now()}`,
      code_type: codeType,
      department: department,
      timestamp: new Date().toISOString(),
      status: "Active",
    }

    const updatedAlerts = [...this.emergencyAlerts, newAlert]
    this.emergencyAlerts = updatedAlerts
    this.notify("emergencyAlerts", updatedAlerts)
  }

  public clearEmergencyAlert(alertId: string) {
    const updatedAlerts = this.emergencyAlerts.map((alert) =>
      alert.alert_id === alertId ? { ...alert, status: "Cleared" } : alert,
    )
    this.emergencyAlerts = updatedAlerts
    this.notify("emergencyAlerts", updatedAlerts)
  }

  public getCurrentData() {
    return {
      drugInventory: this.drugInventory,
      tokenQueue: this.tokenQueue,
      bloodBank: this.bloodBank,
      emergencyAlerts: this.emergencyAlerts,
    }
  }
}

export const syncSimulation = new SyncSimulation()