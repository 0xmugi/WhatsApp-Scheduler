"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageScheduler } from "@/components/scheduler/message-scheduler"
import { ScheduledMessages } from "@/components/scheduler/scheduled-messages"
import { LogViewer } from "@/components/logs/log-viewer"
import { MessageSquare, Calendar, FileText } from "lucide-react"

interface User {
  id: string
  phone: string
  name: string
  role: "admin" | "user"
  status: "approved" | "pending" | "rejected"
}

interface UserDashboardProps {
  user: User
}

export function UserDashboard({ user }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState("scheduler")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="scheduler" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Penjadwalan Pesan
        </TabsTrigger>
        <TabsTrigger value="scheduled" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Pesan Saya
        </TabsTrigger>
        <TabsTrigger value="logs" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Log Pengiriman
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scheduler">
        <MessageScheduler userRole="user" />
      </TabsContent>

      <TabsContent value="scheduled">
        <ScheduledMessages userRole="user" />
      </TabsContent>

      <TabsContent value="logs">
        <LogViewer userRole="user" />
      </TabsContent>
    </Tabs>
  )
}
