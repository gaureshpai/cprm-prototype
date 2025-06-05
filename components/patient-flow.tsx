"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, UserCheck, Stethoscope, TestTube, Pill, FileText, Clock } from "lucide-react"

interface PatientFlowStep {
  id: string
  name: string
  icon: React.ReactNode
  status: "completed" | "current" | "pending"
  estimatedTime?: string
  actualTime?: string
}

interface PatientFlowProps {
  patientName: string
  tokenId: string
  currentStep: number
  steps: PatientFlowStep[]
}

export function PatientFlow({ patientName, tokenId, currentStep, steps }: PatientFlowProps) {
  const getStepIcon = (stepName: string) => {
    switch (stepName.toLowerCase()) {
      case "registration":
        return <UserCheck className="h-4 w-4" />
      case "consultation":
        return <Stethoscope className="h-4 w-4" />
      case "lab tests":
        return <TestTube className="h-4 w-4" />
      case "pharmacy":
        return <Pill className="h-4 w-4" />
      case "discharge":
        return <FileText className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStepColor = (status: string) => {
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

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Patient Journey - {patientName}</span>
          <Badge variant="outline">Token: {tokenId}</Badge>
        </CardTitle>
        <CardDescription>Track patient progress through hospital departments</CardDescription>
        <Progress value={progressPercentage} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-4 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-2 min-w-0 flex-shrink-0">
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`
                  flex items-center justify-center w-12 h-12 rounded-full
                  ${getStepColor(step.status)}
                `}
                >
                  {getStepIcon(step.name)}
                </div>
                <div className="text-center min-w-0">
                  <p className="text-sm font-medium truncate">{step.name}</p>
                  {step.status === "current" && step.estimatedTime && (
                    <p className="text-xs text-blue-600">~{step.estimatedTime}</p>
                  )}
                  {step.status === "completed" && step.actualTime && (
                    <p className="text-xs text-green-600">{step.actualTime}</p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
