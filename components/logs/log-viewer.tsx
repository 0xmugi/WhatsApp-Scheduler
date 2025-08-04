"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Search, FileText, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase, type MessageLog } from "@/lib/supabase"

interface LogViewerProps {
  userRole: "admin" | "user"
}

export function LogViewer({ userRole }: LogViewerProps) {
  const [logs, setLogs] = useState<(MessageLog & { user_name?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchLogs()
  }, [userRole])

  const fetchLogs = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("whatsapp_scheduler_user") || "{}")

      let query = supabase
        .from("message_logs")
        .select(`
          *,
          users!inner(name)
        `)
        .order("started_at", { ascending: false })

      // Filter by user if not admin
      if (userRole === "user") {
        query = query.eq("user_id", currentUser.id)
      }

      const { data, error } = await query

      if (error) throw error

      const logsWithUserName =
        data?.map((log) => ({
          ...log,
          user_name: log.users?.name,
        })) || []

      setLogs(logsWithUserName)
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast({
        title: "Error",
        description: "Gagal memuat log",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || log.status === statusFilter

    let matchesDate = true
    if (dateFrom && dateTo) {
      const logDate = new Date(log.started_at).toISOString().split("T")[0]
      matchesDate = logDate >= dateFrom && logDate <= dateTo
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500"
      case "partial":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Berhasil"
      case "partial":
        return "Sebagian"
      case "failed":
        return "Gagal"
      default:
        return "Unknown"
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleDownloadTxt = () => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.started_at).toLocaleString("id-ID")}] ${log.message} - ${log.success_count}/${log.contact_count} berhasil (${formatDuration(log.duration_seconds)}) - ${log.user_name || "Unknown"}`,
      )
      .join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `whatsapp-logs-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Log berhasil diunduh",
      description: "File log.txt telah disimpan",
    })
  }

  const handleDownloadXlsx = () => {
    // Create CSV content for Excel compatibility
    const csvContent = [
      [
        "Waktu",
        "Pesan",
        "Total Kontak",
        "Berhasil",
        "Gagal",
        "Status",
        "Durasi",
        userRole === "admin" ? "Dibuat Oleh" : "",
      ].filter(Boolean),
      ...filteredLogs.map((log) =>
        [
          new Date(log.started_at).toLocaleString("id-ID"),
          log.message,
          log.contact_count,
          log.success_count,
          log.failed_count,
          getStatusText(log.status),
          formatDuration(log.duration_seconds),
          userRole === "admin" ? log.user_name || "Unknown" : "",
        ].filter(Boolean),
      ),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `whatsapp-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Log berhasil diunduh",
      description: "File CSV telah disimpan (dapat dibuka di Excel)",
    })
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
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Log & Laporan Pengiriman
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Dari Tanggal</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <Label>Sampai Tanggal</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="success">Berhasil</SelectItem>
                    <SelectItem value="partial">Sebagian</SelectItem>
                    <SelectItem value="failed">Gagal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cari Pesan</Label>
                <Input
                  placeholder="Cari dalam pesan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Buttons */}
        <div className="flex gap-4">
          <Button onClick={handleDownloadTxt} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download TXT
          </Button>
          <Button onClick={handleDownloadXlsx} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Log Pengiriman ({filteredLogs.length} entries)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Pesan</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Berhasil</TableHead>
                  <TableHead>Gagal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Durasi</TableHead>
                  {userRole === "admin" && <TableHead>Dibuat Oleh</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(log.started_at).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                    <TableCell>{log.contact_count}</TableCell>
                    <TableCell className="text-green-600">{log.success_count}</TableCell>
                    <TableCell className="text-red-600">{log.failed_count}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>{getStatusText(log.status)}</Badge>
                    </TableCell>
                    <TableCell>{formatDuration(log.duration_seconds)}</TableCell>
                    {userRole === "admin" && <TableCell>{log.user_name || "Unknown"}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
