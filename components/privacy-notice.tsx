import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye } from "lucide-react"

interface PrivacyNoticeProps {
  level: "public" | "staff" | "admin"
  dataTypes: string[]
}

export function PrivacyNotice({ level, dataTypes }: PrivacyNoticeProps) {
  const getPrivacyMessage = () => {
    switch (level) {
      case "public":
        return "Patient names are anonymized for privacy. Only initials and token numbers are displayed."
      case "staff":
        return "Full patient information visible to authorized staff only. Access is logged for compliance."
      case "admin":
        return "Administrative access with full data visibility. All actions are audited and logged."
      default:
        return "Data access is monitored and logged for security compliance."
    }
  }

  const getIcon = () => {
    switch (level) {
      case "public":
        return <Eye className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      {getIcon()}
      <AlertDescription className="text-blue-800">
        <strong>Privacy Notice:</strong> {getPrivacyMessage()}
        <br />
        <span className="text-sm">
          Data types: {dataTypes.join(", ")} • Compliant with medical data protection standards
        </span>
      </AlertDescription>
    </Alert>
  )
}
