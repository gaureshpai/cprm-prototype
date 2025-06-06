"use server"

import prisma  from "./prisma"
import type { Role } from "@prisma/client"

// User CRUD Operations
export const userOperations = {
  async create(data: {
    username: string
    email?: string
    name: string
    role: Role
    department?: string
  }) {
    return await prisma.user.create({ data })
  },

  async findByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username },
    })
  },

  async findAll() {
    return await prisma.user.findMany()
  },

  async update(
    id: string,
    data: Partial<{
      name: string
      email: string
      department: string
    }>,
  ) {
    return await prisma.user.update({
      where: { id },
      data,
    })
  },

  async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    })
  },
}

// Drug Inventory CRUD Operations
export const drugInventoryOperations = {
  async create(data: {
    drug_name: string
    stock_qty: number
    reorder_level: number
    status: string
    category?: string
  }) {
    return await prisma.drugInventory.create({ data })
  },

  async findAll() {
    return await prisma.drugInventory.findMany({
      orderBy: { last_updated: "desc" },
    })
  },

  async findLowStock() {
    return await prisma.drugInventory.findMany({
      where: {
        stock_qty: {
          lte: prisma.drugInventory.fields.reorder_level,
        },
      },
    })
  },

  async update(
    id: string,
    data: Partial<{
      stock_qty: number
      reorder_level: number
      status: string
    }>,
  ) {
    return await prisma.drugInventory.update({
      where: { id },
      data: {
        ...data,
        last_updated: new Date(),
      },
    })
  },

  async delete(id: string) {
    return await prisma.drugInventory.delete({
      where: { id },
    })
  },
}

// Patient CRUD Operations
export const patientOperations = {
  async create(data: {
    name: string
    age: number
    gender: string
    phone?: string
    address?: string
    condition?: string
  }) {
    return await prisma.patient.create({ data })
  },

  async findAll() {
    return await prisma.patient.findMany({
      include: {
        appointments: true,
        prescriptions: true,
      },
      orderBy: { createdAt: "desc" },
    })
  },

  async findById(id: string) {
    return await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: { doctor: true },
        },
        prescriptions: {
          include: {
            doctor: true,
            items: {
              include: { drug: true },
            },
          },
        },
      },
    })
  },

  async update(
    id: string,
    data: Partial<{
      name: string
      age: number
      gender: string
      phone: string
      address: string
      condition: string
      status: string
    }>,
  ) {
    return await prisma.patient.update({
      where: { id },
      data,
    })
  },

  async delete(id: string) {
    return await prisma.patient.delete({
      where: { id },
    })
  },
}

// Prescription CRUD Operations
export const prescriptionOperations = {
  async create(data: {
    patientId: string
    doctorId: string
    notes?: string
    items: Array<{
      drugId: string
      dosage: string
      frequency: string
      duration: string
      instructions?: string
    }>
  }) {
    return await prisma.prescription.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        notes: data.notes,
        items: {
          create: data.items,
        },
      },
      include: {
        items: {
          include: { drug: true },
        },
        patient: true,
        doctor: true,
      },
    })
  },

  async findAll() {
    return await prisma.prescription.findMany({
      include: {
        patient: true,
        doctor: true,
        items: {
          include: { drug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  },

  async findPending() {
    return await prisma.prescription.findMany({
      where: { status: "Pending" },
      include: {
        patient: true,
        doctor: true,
        items: {
          include: { drug: true },
        },
      },
    })
  },

  async updateStatus(id: string, status: string) {
    return await prisma.prescription.update({
      where: { id },
      data: { status },
    })
  },
}

// Emergency Alert Operations
export const emergencyAlertOperations = {
  async create(data: {
    code_type: string
    department: string
    status: string
    severity?: string
  }) {
    return await prisma.emergencyAlert.create({ data })
  },

  async findActive() {
    return await prisma.emergencyAlert.findMany({
      where: { status: "Active" },
      orderBy: { timestamp: "desc" },
    })
  },

  async findAll() {
    return await prisma.emergencyAlert.findMany({
      orderBy: { timestamp: "desc" },
    })
  },

  async updateStatus(id: string, status: string) {
    return await prisma.emergencyAlert.update({
      where: { id },
      data: { status },
    })
  },
}

// Display Operations
export const displayOperations = {
  async create(data: {
    location: string
    content: string
    status?: string
  }) {
    return await prisma.display.create({ data })
  },

  async findAll() {
    return await prisma.display.findMany({
      orderBy: { location: "asc" },
    })
  },

  async updateStatus(id: string, status: string) {
    return await prisma.display.update({
      where: { id },
      data: {
        status,
        lastUpdate: new Date(),
      },
    })
  },

  async restart(id: string) {
    return await prisma.display.update({
      where: { id },
      data: {
        status: "Online",
        lastUpdate: new Date(),
        uptime: "100%",
      },
    })
  },
}

// Authentication
export const authOperations = {
  async authenticate(username: string, password: string) {
    // Demo credentials check
    const demoCredentials = {
      ADM001: { password: "admin123", role: "ADMIN" as Role },
      DOC001: { password: "doctor123", role: "DOCTOR" as Role },
      NUR001: { password: "nurse123", role: "NURSE" as Role },
      TEC001: { password: "tech123", role: "TECHNICIAN" as Role },
      PHR001: { password: "pharma123", role: "PHARMACIST" as Role },
    }

    const demo = demoCredentials[username as keyof typeof demoCredentials]
    if (demo && demo.password === password) {
      // Find or create user
      let user = await prisma.user.findUnique({
        where: { username },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            username,
            name: `${demo.role} User`,
            role: demo.role,
            permissions: [],
          },
        })
      }

      return user
    }

    return null
  },
}

export const appointmentOperations = {
  async create(data: {
    patientId: string
    doctorId: string
    date: Date
    time: string
    type: string
    notes?: string
  }) {
    return await prisma.appointment.create({ data })
  },

  async findAll() {
    return await prisma.appointment.findMany({
      include: { patient: true, doctor: true },
      orderBy: { date: 'desc' },
    })
  },

  async update(id: string, data: Partial<{ status: string; notes: string }>) {
    return await prisma.appointment.update({ where: { id }, data })
  },

  async delete(id: string) {
    return await prisma.appointment.delete({ where: { id } })
  }
}
