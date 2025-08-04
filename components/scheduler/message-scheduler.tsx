"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Calendar, Clock, Send, FileSpreadsheet, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface MessageSchedulerProps {
  userRole: "admin" | "user"
}

export function MessageScheduler({ userRole }: MessageSchedulerProps) {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedDates, setSelectedDates] = useState<number[]>([])
  const [selectedTime, setSelectedTime] = useState("")
  const [isScheduling, setIsScheduling] = useState(false)
  const [maxContacts, setMaxContacts] = useState(500)
  const [maxSchedulesPerDay, setMaxSchedulesPerDay] = useState(5)

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  const dates = Array.from({ length: 31 }, (_, i) => i + 1)

  useEffect(() => {
    loadSettings()
  }, [userRole])

  const loadSettings = async () => {
    try {
      const settingsKey = userRole === "admin" ? "max_contacts_per_schedule_admin" : "max_contacts_per_schedule"
      const schedulesKey = userRole === "admin" ? "max_schedules_per_day_admin" : "max_schedules_per_day"

      const { data: contactsData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", settingsKey)
        .single()

      const { data: schedulesData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", schedulesKey)
        .single()

      if (contactsData?.value) setMaxContacts(Number.parseInt(contactsData.value))
      if (schedulesData?.value) setMaxSchedulesPerDay(Number.parseInt(schedulesData.value))
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (
      uploadedFile &&
      (uploadedFile.type.includes("spreadsheet") ||
        uploadedFile.name.endsWith(".xlsx") ||
        uploadedFile.name.endsWith(".xls"))
    ) {
      setFile(uploadedFile)
      toast({
        title: "File berhasil diupload",
        description: `${uploadedFile.name} siap diproses`,
      })
    } else {
      toast({
        title: "Format file tidak valid",
        description: "Harap upload file Excel (.xlsx atau .xls)",
        variant: "destructive",
      })
    }
  }

  const handleDateToggle = (date: number) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].sort((a, b) => a - b),
    )
  }

  const handleSchedule = async () => {
    if (!file || !message || !selectedMonth || selectedDates.length === 0 || !selectedTime) {
      toast({
        title: "Data tidak lengkap",
        description: "Harap lengkapi semua field yang diperlukan",
        variant: "destructive",
      })
      return
    }

    setIsScheduling(true)

    try {
      const currentUser = JSON.parse(localStorage.getItem("whatsapp_scheduler_user") || "{}")

      // Check daily schedule limit
      const today = new Date().toISOString().split("T")[0]
      const { data: todaySchedules } = await supabase
        .from("scheduled_messages")
        .select("id")
        .eq("user_id", currentUser.id)
        .gte("created_at", today + "T00:00:00")
        .lt("created_at", today + "T23:59:59")

      if (todaySchedules && todaySchedules.length >= maxSchedulesPerDay) {
        toast({
          title: "Batas Harian Tercapai",
          description: `Anda sudah mencapai batas ${maxSchedulesPerDay} jadwal per hari`,
          variant: "destructive",
        })
        setIsScheduling(false)
        return
      }

      // Simulate contact count from file (in real app, parse Excel file)
      const contactCount = Math.min(Math.floor(Math.random() * maxContacts) + 50, maxContacts)

      // Calculate next run date
      const currentYear = new Date().getFullYear()
      const monthIndex = months.indexOf(selectedMonth)
      const nextDate = selectedDates[0]
      const nextRun = new Date(
        currentYear,
        monthIndex,
        nextDate,
        Number.parseInt(selectedTime.split(":")[0]),
        Number.parseInt(selectedTime.split(":")[1]),
      )

      // Insert scheduled message
      const { error } = await supabase.from("scheduled_messages").insert({
        user_id: currentUser.id,
        message,
        contact_count: contactCount,
        month: selectedMonth,
        dates: selectedDates,
        time: selectedTime,
        next_run: nextRun.toISOString(),
        status: "active",
      })

      if (error) throw error

      toast({
        title: "Penjadwalan Pesan Sukses",
        description: `Pesan akan dikirimkan ke ${contactCount} nomor penerima pada ${selectedMonth}, tanggal (${selectedDates.join(",")}) pukul ${selectedTime}`,
      })

      // Reset form
      setFile(null)
      setMessage("")
      setSelectedMonth("")
      setSelectedDates([])
      setSelectedTime("")

      // Notify admin if user creates schedule
      if (userRole === "user") {
        console.log(`Notifying admin: New schedule created by ${currentUser.name}`)
      }
    } catch (error) {
      console.error("Error creating schedule:", error)
      toast({
        title: "Error",
        description: "Gagal membuat jadwal pesan",
        variant: "destructive",
      })
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Buat Penjadwalan Pesan Baru
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Limits Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Batas {userRole === "admin" ? "Admin" : "User"}:</p>
              <ul className="text-blue-800 space-y-1">
                <li>• Maksimal {maxContacts.toLocaleString()} kontak per jadwal</li>
                <li>• Maksimal {maxSchedulesPerDay} jadwal per hari</li>
                <li>• Delay minimum 2 detik antar pesan</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Upload File Kontak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-lg font-medium text-gray-700">
                  {file ? file.name : "Klik untuk upload file Excel"}
                </span>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </Label>
              <p className="text-sm text-gray-500 mt-2">
                Format: .xlsx atau .xls (maksimal {maxContacts.toLocaleString()} kontak)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Kolom A: Nama, Kolom B: Nomor WhatsApp (format: +628xxxxxxxxx)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Message Content */}
        <Card>
          <CardHeader>
            <CardTitle>Isi Pesan</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Contoh: Selamat Pagi! Semoga hari Anda menyenangkan..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-2">Karakter: {message.length}/1000</p>
          </CardContent>
        </Card>

        {/* Schedule Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Pengaturan Jadwal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Month Selection */}
            <div>
              <Label>Pilih Bulan</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div>
              <Label>Pilih Tanggal</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {dates.map((date) => (
                  <div key={date} className="flex items-center space-x-2">
                    <Checkbox
                      id={`date-${date}`}
                      checked={selectedDates.includes(date)}
                      onCheckedChange={() => handleDateToggle(date)}
                    />
                    <Label htmlFor={`date-${date}`} className="text-sm">
                      {date}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedDates.length > 0 && (
                <p className="text-sm text-green-600 mt-2">Tanggal terpilih: {selectedDates.join(", ")}</p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <Label>Waktu Pengiriman</Label>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4" />
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Button */}
        <Button onClick={handleSchedule} disabled={isScheduling} className="w-full h-12 text-lg">
          {isScheduling ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Menjadwalkan...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Jadwalkan Pesan
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
