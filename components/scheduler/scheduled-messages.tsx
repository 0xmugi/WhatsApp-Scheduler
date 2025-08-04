"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Play, Pause, Eye, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase, type ScheduledMessage } from "@/lib/supabase"

interface ScheduledMessagesProps {
  userRole: "admin" | "user"
}

export function ScheduledMessages({ userRole }: ScheduledMessagesProps) {
  const [messages, setMessages] = useState<(ScheduledMessage & { user_name?: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [userRole])

  const fetchMessages = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("whatsapp_scheduler_user") || "{}")

      let query = supabase
        .from("scheduled_messages")
        .select(`
          *,
          users!inner(name)
        `)
        .order("created_at", { ascending: false })

      // Filter by user if not admin
      if (userRole === "user") {
        query = query.eq("user_id", currentUser.id)
      }

      const { data, error } = await query

      if (error) throw error

      const messagesWithUserName =
        data?.map((msg) => ({
          ...msg,
          user_name: msg.users?.name,
        })) || []

      setMessages(messagesWithUserName)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Gagal memuat pesan terjadwal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "paused":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif"
      case "paused":
        return "Dijeda"
      case "completed":
        return "Selesai"
      case "failed":
        return "Gagal"
      default:
        return "Unknown"
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active"

      const { error } = await supabase
        .from("scheduled_messages")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Status berhasil diubah",
        description: `Jadwal pesan telah ${newStatus === "active" ? "diaktifkan" : "dijeda"}`,
      })

      fetchMessages()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Gagal mengubah status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("scheduled_messages").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Pesan terjadwal dihapus",
        description: "Jadwal pesan telah dihapus dari sistem",
      })

      fetchMessages()
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus pesan",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {userRole === "admin" ? "Semua Pesan Terjadwal" : "Pesan Terjadwal Saya"} ({messages.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchMessages}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada pesan terjadwal</p>
            </div>
          ) : (
            messages.map((msg) => (
              <Card key={msg.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{msg.message}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{msg.contact_count} kontak</span>
                        <span>
                          {msg.month}, tanggal {msg.dates.join(", ")}
                        </span>
                        <span>Pukul {msg.time}</span>
                        {userRole === "admin" && msg.user_name && <span>oleh {msg.user_name}</span>}
                      </div>
                    </div>
                    <Badge className={getStatusColor(msg.status)}>{getStatusText(msg.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <p>Dibuat: {new Date(msg.created_at).toLocaleDateString("id-ID")}</p>
                      <p>
                        Pengiriman berikutnya: {msg.next_run ? new Date(msg.next_run).toLocaleString("id-ID") : "-"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {(msg.status === "active" || msg.status === "paused") && (
                        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(msg.id, msg.status)}>
                          {msg.status === "active" ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              Jeda
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Aktifkan
                            </>
                          )}
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(msg.id)}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
