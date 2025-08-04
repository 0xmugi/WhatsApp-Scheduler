"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Settings } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export function SystemSettings() {
  const [loading, setLoading] = useState(true)
  const [systemSettings, setSystemSettings] = useState({
    maxContactsPerSchedule: 500,
    maxContactsPerScheduleAdmin: 1000,
    maxSchedulesPerDay: 5,
    maxSchedulesPerDayAdmin: 20,
    messageDelay: 2000,
    enableNotifications: true,
    enableAutoApproval: false,
    welcomeMessage: "Selamat datang di WhatsApp Scheduler! Akun Anda telah disetujui.",
    rejectionMessage: "Maaf, permintaan akun Anda tidak dapat disetujui saat ini.",
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from("system_settings").select("*")

      if (error) throw error

      const settingsMap =
        data?.reduce(
          (acc, setting) => {
            acc[setting.key] = setting.value
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      setSystemSettings({
        maxContactsPerSchedule: Number.parseInt(settingsMap.max_contacts_per_schedule || "500"),
        maxContactsPerScheduleAdmin: Number.parseInt(settingsMap.max_contacts_per_schedule_admin || "1000"),
        maxSchedulesPerDay: Number.parseInt(settingsMap.max_schedules_per_day || "5"),
        maxSchedulesPerDayAdmin: Number.parseInt(settingsMap.max_schedules_per_day_admin || "20"),
        messageDelay: Number.parseInt(settingsMap.message_delay_ms || "2000"),
        enableNotifications: settingsMap.enable_notifications === "true",
        enableAutoApproval: settingsMap.enable_auto_approval === "true",
        welcomeMessage:
          settingsMap.welcome_message || "Selamat datang di WhatsApp Scheduler! Akun Anda telah disetujui.",
        rejectionMessage: settingsMap.rejection_message || "Maaf, permintaan akun Anda tidak dapat disetujui saat ini.",
      })
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan sistem",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("whatsapp_scheduler_user") || "{}")

      const settingsToUpdate = [
        { key: "max_contacts_per_schedule", value: systemSettings.maxContactsPerSchedule.toString() },
        { key: "max_contacts_per_schedule_admin", value: systemSettings.maxContactsPerScheduleAdmin.toString() },
        { key: "max_schedules_per_day", value: systemSettings.maxSchedulesPerDay.toString() },
        { key: "max_schedules_per_day_admin", value: systemSettings.maxSchedulesPerDayAdmin.toString() },
        { key: "message_delay_ms", value: systemSettings.messageDelay.toString() },
        { key: "enable_notifications", value: systemSettings.enableNotifications.toString() },
        { key: "enable_auto_approval", value: systemSettings.enableAutoApproval.toString() },
        { key: "welcome_message", value: systemSettings.welcomeMessage },
        { key: "rejection_message", value: systemSettings.rejectionMessage },
      ]

      for (const setting of settingsToUpdate) {
        const { error } = await supabase.from("system_settings").upsert({
          key: setting.key,
          value: setting.value,
          updated_at: new Date().toISOString(),
          updated_by: currentUser.id,
        })

        if (error) throw error
      }

      toast({
        title: "Pengaturan disimpan",
        description: "Semua pengaturan sistem berhasil diperbarui",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
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
    <div className="space-y-6">
      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Pengaturan Sistem
          </CardTitle>
          <CardDescription>Konfigurasi umum sistem WhatsApp Scheduler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Maksimal Kontak per Jadwal (User)</Label>
              <Input
                type="number"
                value={systemSettings.maxContactsPerSchedule}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    maxContactsPerSchedule: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label>Maksimal Kontak per Jadwal (Admin)</Label>
              <Input
                type="number"
                value={systemSettings.maxContactsPerScheduleAdmin}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    maxContactsPerScheduleAdmin: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label>Maksimal Jadwal per Hari (User)</Label>
              <Input
                type="number"
                value={systemSettings.maxSchedulesPerDay}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    maxSchedulesPerDay: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label>Maksimal Jadwal per Hari (Admin)</Label>
              <Input
                type="number"
                value={systemSettings.maxSchedulesPerDayAdmin}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    maxSchedulesPerDayAdmin: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label>Delay Antar Pesan (ms)</Label>
              <Input
                type="number"
                value={systemSettings.messageDelay}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    messageDelay: Number.parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="col-span-2">
              <Label>Nomor Admin Utama (dari Environment)</Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-600">{process.env.NEXT_PUBLIC_ADMIN_PHONE || "+6281234567890"}</span>
                <span className="ml-2 text-xs text-gray-500">(tidak dapat diubah)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Nomor admin diatur melalui environment variable untuk keamanan
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Aktifkan Notifikasi</Label>
              <Switch
                checked={systemSettings.enableNotifications}
                onCheckedChange={(checked) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    enableNotifications: checked,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto Approval User Baru</Label>
              <Switch
                checked={systemSettings.enableAutoApproval}
                onCheckedChange={(checked) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    enableAutoApproval: checked,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <Label>Pesan Selamat Datang</Label>
            <Textarea
              value={systemSettings.welcomeMessage}
              onChange={(e) =>
                setSystemSettings((prev) => ({
                  ...prev,
                  welcomeMessage: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          <div>
            <Label>Pesan Penolakan</Label>
            <Textarea
              value={systemSettings.rejectionMessage}
              onChange={(e) =>
                setSystemSettings((prev) => ({
                  ...prev,
                  rejectionMessage: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          <Button onClick={handleSaveSettings}>Simpan Semua Pengaturan</Button>
        </CardContent>
      </Card>
    </div>
  )
}
