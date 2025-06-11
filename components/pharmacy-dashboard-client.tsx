import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Pill,
  AlertTriangle,
  Package,
  FileText,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react"
import { PharmacyDashboardClientProps } from "@/lib/helpers"

export default function PharmacyDashboardClient({
  statistics,
  topMedications,
  prescriptionTrends,
}: PharmacyDashboardClientProps) {
  
  const totalStock = statistics.totalDrugs || 1 
  const availablePercentage = Math.round((statistics.availableStock / totalStock) * 100)
  const lowPercentage = Math.round((statistics.lowStockCount / totalStock) * 100)
  const criticalPercentage = Math.round((statistics.criticalStockCount / totalStock) * 100)
  
  const formattedTrends = prescriptionTrends.map((trend) => ({
    ...trend,
    date: new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.criticalStockCount}</div>
            <p className="text-xs text-muted-foreground">{statistics.lowStockCount} items running low</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.pendingPrescriptions}</div>
            <p className="text-xs text-muted-foreground">{statistics.processingPrescriptions} in processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.completedPrescriptionsToday}</div>
            <p className="text-xs text-muted-foreground">Total medications dispensed today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="w-full cursor-none grid-cols-1 bg-white hidden">
          <TabsTrigger value="analytics" className="cursor-default">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Top Medications</span>
                </CardTitle>
                <CardDescription>Most frequently prescribed medications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topMedications.map((medication, index) => (
                    <div key={medication.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{medication.name}</div>
                          <div className="text-sm text-gray-500">{medication.count} prescriptions</div>
                        </div>
                      </div>
                      <div className="w-24">
                        <Progress
                          value={(medication.count / Math.max(...topMedications.map((m) => m.count))) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Prescription Trends</span>
                </CardTitle>
                <CardDescription>Last 7 days prescription activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formattedTrends.slice(-7).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((trend) => (
                    <div key={trend.date} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{trend.date}</span>
                        <span className="text-gray-500">
                          Total: {trend.pending + trend.processing + trend.completed}
                        </span>
                      </div>
                      <div className="flex space-x-1 h-2">
                        <div
                          className="bg-green-500 rounded-l"
                          style={{
                            width: `${(trend.completed / (trend.pending + trend.processing + trend.completed || 1)) * 100 || 0
                              }%`,
                          }}
                        />
                        <div
                          className="bg-blue-500"
                          style={{
                            width: `${(trend.processing / (trend.pending + trend.processing + trend.completed || 1)) * 100 || 0
                              }%`,
                          }}
                        />
                        <div
                          className="bg-yellow-500 rounded-r"
                          style={{
                            width: `${(trend.pending / (trend.pending + trend.processing + trend.completed || 1)) * 100 || 0
                              }%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Completed: {trend.completed}</span>
                        <span>Processing: {trend.processing}</span>
                        <span>Pending: {trend.pending}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  <span>Inventory Status</span>
                </CardTitle>
                <CardDescription>Current stock levels overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Available Stock</span>
                      <span className="font-medium text-green-600">{availablePercentage}%</span>
                    </div>
                    <Progress value={availablePercentage} className="h-2" />
                    <div className="text-xs text-gray-500">{statistics.availableStock} items available</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Low Stock</span>
                      <span className="font-medium text-yellow-600">{lowPercentage}%</span>
                    </div>
                    <Progress value={lowPercentage} className="h-2" />
                    <div className="text-xs text-gray-500">{statistics.lowStockCount} items need reordering</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Critical Stock</span>
                      <span className="font-medium text-red-600">{criticalPercentage}%</span>
                    </div>
                    <Progress value={criticalPercentage} className="h-2" />
                    <div className="text-xs text-gray-500">{statistics.criticalStockCount} items critically low</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Pharmacy Activity</span>
                </CardTitle>
                <CardDescription>Today's pharmacy operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Pending Prescriptions</div>
                        <div className="text-xs text-gray-500">Awaiting processing</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      {statistics.pendingPrescriptions}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Completed Today</div>
                        <div className="text-xs text-gray-500">Successfully dispensed</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {statistics.completedPrescriptionsToday}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Critical Stock Items</div>
                        <div className="text-xs text-gray-500">Need immediate attention</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      {statistics.criticalStockCount}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <Package className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Low Stock Items</div>
                        <div className="text-xs text-gray-500">Need reordering soon</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      {statistics.lowStockCount}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}