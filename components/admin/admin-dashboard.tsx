"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageScheduler } from "@/components/scheduler/message-scheduler"
import { ScheduledMessages } from "@/components/scheduler/scheduled-messages"
import { LogViewer } from "@/components/logs/log-viewer"
import { UserManagement } from "@/components/admin/user-management"
import { WhatsAppStatus } from "@/components/admin/whatsapp-status"
import { SystemSettings } from "@/components/admin/system-settings"
import { MessageSquare, Calendar, Users, FileText, Settings, Wifi } from "lucide-react"

interface User {
  id: string
  phone: string
  name: string
  role: "admin" | "user"
  status: "approved" | "pending" | "rejected"
}

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("scheduler")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-6">
        <TabsTrigger value="scheduler" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Penjadwalan
        </TabsTrigger>
        <TabsTrigger value="scheduled" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Pesan Terjadwal
        </TabsTrigger>
        <TabsTrigger value="logs" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Log & Laporan
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Manajemen User
        </TabsTrigger>
        <TabsTrigger value="whatsapp" className="flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          WhatsApp Status
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Pengaturan
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scheduler">
        <MessageScheduler userRole="admin" />
      </TabsContent>

      <TabsContent value="scheduled">
        <ScheduledMessages userRole="admin" />
      </TabsContent>

      <TabsContent value="logs">
        <LogViewer userRole="admin" />
      </TabsContent>

      <TabsContent value="users">
        <UserManagement />
      </TabsContent>

      <TabsContent value="whatsapp">
        <WhatsAppStatus />
      </TabsContent>

      <TabsContent value="settings">
        <SystemSettings />
      </TabsContent>
    </Tabs>
  )
}
