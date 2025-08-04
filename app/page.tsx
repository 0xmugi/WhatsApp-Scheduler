"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MessageSquare,
  Users,
  Shield,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Settings,
  Wifi,
  UserPlus,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase, type User } from "@/lib/supabase"
import { MessageScheduler } from "@/components/scheduler/message-scheduler"
import { ScheduledMessages } from "@/components/scheduler/scheduled-messages"
import { LogViewer } from "@/components/logs/log-viewer"
import { UserManagement } from "@/components/admin/user-management"
import { WhatsAppStatus } from "@/components/admin/whatsapp-status"
import { SystemSettings } from "@/components/admin/system-settings"

// Add this constant at the top of the component, after imports
const ADMIN_PHONE = process.env.NEXT_PUBLIC_ADMIN_PHONE || "+6281234567890"

export default function WhatsAppScheduler() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showRegistration, setShowRegistration] = useState(false)
  const [showFirstTimeSetup, setShowFirstTimeSetup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [activeTab, setActiveTab] = useState("dashboard")

  // First time setup states
  const [adminName, setAdminName] = useState("")
  const [adminPhone, setAdminPhone] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)

  useEffect(() => {
    checkDatabaseConnection()
    checkAuthStatus()
  }, [])

  const checkDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from("users").select("phone").limit(1)

      if (error) {
        console.error("Database connection error:", error)
        setConnectionStatus("error")
        toast({
          title: "Database Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        console.log("Database connected successfully")
        setConnectionStatus("connected")

        // Check if any admin exists
        const { data: adminData } = await supabase.from("users").select("id").eq("role", "admin").limit(1)

        if (!adminData || adminData.length === 0) {
          setShowFirstTimeSetup(true)
        }
      }
    } catch (error) {
      console.error("Database connection failed:", error)
      setConnectionStatus("error")
    }
  }

  const checkAuthStatus = async () => {
    try {
      const savedUser = localStorage.getItem("whatsapp_scheduler_user")
      if (savedUser) {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      localStorage.removeItem("whatsapp_scheduler_user")
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleCreateFirstAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adminName || !adminPhone || !adminPassword) {
      toast({
        title: "Data tidak lengkap",
        description: "Harap isi semua field",
        variant: "destructive",
      })
      return
    }

    setIsCreatingAdmin(true)

    try {
      const { error } = await supabase.from("users").insert({
        name: adminName,
        phone: adminPhone,
        role: "admin",
        status: "approved",
        password_hash: adminPassword,
        approved_at: new Date().toISOString(),
        is_active: true,
      })

      if (error) throw error

      toast({
        title: "Admin berhasil dibuat! 🎉",
        description: `Admin ${adminName} telah dibuat. Silakan login dengan credentials tersebut.`,
      })

      setShowFirstTimeSetup(false)
      setAdminName("")
      setAdminPhone("")
      setAdminPassword("")
    } catch (error) {
      console.error("Error creating admin:", error)
      toast({
        title: "Error",
        description: "Gagal membuat admin. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingAdmin(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Attempting login with:", { phone })

      const { data: users, error } = await supabase.from("users").select("*").eq("phone", phone)

      console.log("Database response:", { users, error })

      if (error) {
        console.error("Database error:", error)
        toast({
          title: "Login Gagal",
          description: `Database error: ${error.message}`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!users || users.length === 0) {
        toast({
          title: "Login Gagal",
          description: "Nomor WhatsApp tidak terdaftar. Silakan daftar terlebih dahulu.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const user = users[0]

      if (user.status === "pending") {
        toast({
          title: "Akun Belum Disetujui",
          description: "Akun Anda masih menunggu persetujuan admin. Silakan hubungi admin.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (user.status === "rejected") {
        toast({
          title: "Akun Ditolak",
          description: "Akun Anda telah ditolak oleh admin. Silakan hubungi admin untuk informasi lebih lanjut.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const isValidPassword = password === user.password_hash

      if (!isValidPassword) {
        toast({
          title: "Password Salah",
          description: "Password yang Anda masukkan salah.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      await supabase.from("users").update({ last_active: new Date().toISOString() }).eq("id", user.id)

      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${user.name}!`,
      })

      setCurrentUser(user)
      localStorage.setItem("whatsapp_scheduler_user", JSON.stringify(user))
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: `Terjadi kesalahan saat login: ${error}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem("whatsapp_scheduler_user")
    setPhone("")
    setPassword("")
    setActiveTab("dashboard")
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem",
    })
  }

  const handleSendRegistration = async () => {
    const message = encodeURIComponent(
      "🔔 PENDAFTARAN WHATSAPP SCHEDULER 🔔\n\n" +
        "Halo Admin, saya ingin mendaftar akun WhatsApp Scheduler.\n\n" +
        "📝 DATA PENDAFTAR:\n" +
        "• Nama: [Isi nama lengkap Anda]\n" +
        "• Nomor WhatsApp: [Nomor WhatsApp Anda]\n" +
        "• Keperluan: [Jelaskan untuk apa Anda butuh akses]\n" +
        "• Instansi/Perusahaan: [Opsional]\n\n" +
        "Mohon disetujui akses saya ke sistem. Terima kasih! 🙏",
    )
    window.open(`https://wa.me/${ADMIN_PHONE.replace("+", "")}?text=${message}`, "_blank")
  }

  const testDatabaseConnection = async () => {
    setConnectionStatus("checking")
    try {
      const { data, error } = await supabase.from("users").select("phone, name, role, status").limit(10)

      console.log("Database test result:", { data, error })

      if (error) {
        setConnectionStatus("error")
        toast({
          title: "Database Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setConnectionStatus("connected")
        toast({
          title: "Database Connected ✅",
          description: `Found ${data?.length || 0} users in database`,
        })
        console.log("Users in database:", data)
      }
    } catch (error) {
      console.error("Database test failed:", error)
      setConnectionStatus("error")
      toast({
        title: "Connection Failed",
        description: "Cannot connect to database",
        variant: "destructive",
      })
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // First time setup page
  if (showFirstTimeSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto p-6">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">WhatsApp Scheduler Pro</h1>
            <p className="text-lg text-gray-600">Setup Admin Pertama</p>
          </div>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                  Buat Admin Pertama
                </CardTitle>
                <CardDescription>Database kosong. Silakan buat akun admin pertama untuk memulai.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateFirstAdmin} className="space-y-4">
                  <div>
                    <Label htmlFor="admin-name">Nama Lengkap Admin</Label>
                    <Input
                      id="admin-name"
                      type="text"
                      placeholder="John Doe"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-phone">Nomor WhatsApp Admin</Label>
                    <Input
                      id="admin-phone"
                      type="tel"
                      placeholder="+6281234567890"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password">Password Admin</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Masukkan password yang kuat"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isCreatingAdmin}>
                    {isCreatingAdmin ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Membuat Admin...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Buat Admin Pertama
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Penting:</strong> Simpan credentials ini dengan aman. Admin pertama memiliki akses penuh
                    ke sistem.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard untuk user yang sudah login
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">WhatsApp Scheduler Pro</h1>
              <p className="text-lg text-gray-600">
                Selamat datang, {currentUser.name}
                <span className="ml-2 inline-flex items-center gap-1">
                  {currentUser.role === "admin" ? (
                    <>
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 font-medium">Admin</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">User</span>
                    </>
                  )}
                </span>
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === "dashboard" ? "default" : "outline"}
                onClick={() => setActiveTab("dashboard")}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "scheduler" ? "default" : "outline"}
                onClick={() => setActiveTab("scheduler")}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Penjadwalan
              </Button>
              <Button
                variant={activeTab === "scheduled" ? "default" : "outline"}
                onClick={() => setActiveTab("scheduled")}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Pesan Terjadwal
              </Button>
              <Button
                variant={activeTab === "logs" ? "default" : "outline"}
                onClick={() => setActiveTab("logs")}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Log & Laporan
              </Button>
              {currentUser.role === "admin" && (
                <>
                  <Button
                    variant={activeTab === "users" ? "default" : "outline"}
                    onClick={() => setActiveTab("users")}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Manajemen User
                  </Button>
                  <Button
                    variant={activeTab === "whatsapp" ? "default" : "outline"}
                    onClick={() => setActiveTab("whatsapp")}
                    className="flex items-center gap-2"
                  >
                    <Wifi className="w-4 h-4" />
                    WhatsApp Status
                  </Button>
                  <Button
                    variant={activeTab === "settings" ? "default" : "outline"}
                    onClick={() => setActiveTab("settings")}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Pengaturan
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Content berdasarkan tab aktif */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Success Message */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Sistem Siap Digunakan!</span>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    Database bersih dan siap untuk testing. Semua fitur sudah aktif dan berfungsi dengan baik.
                  </p>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Jadwal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <p className="text-xs text-gray-500">Siap untuk jadwal pertama</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Pesan Terkirim</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <p className="text-xs text-gray-500">Belum ada pengiriman</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Tingkat Berhasil</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">-</div>
                    <p className="text-xs text-gray-500">Belum ada data</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Status WhatsApp</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">Siap</div>
                    <p className="text-xs text-gray-500">Menunggu koneksi</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setActiveTab("scheduler")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      Buat Jadwal Pertama
                    </CardTitle>
                    <CardDescription>Mulai dengan membuat jadwal pesan WhatsApp pertama</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Mulai Penjadwalan</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("logs")}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Lihat Laporan
                    </CardTitle>
                    <CardDescription>Monitor dan download laporan pengiriman</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full bg-transparent">
                      Buka Laporan
                    </Button>
                  </CardContent>
                </Card>

                {currentUser.role === "admin" && (
                  <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveTab("users")}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Kelola User
                      </CardTitle>
                      <CardDescription>Approve user baru dan kelola akses sistem</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full bg-transparent">
                        Manajemen User
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "scheduler" && <MessageScheduler userRole={currentUser.role} />}
          {activeTab === "scheduled" && <ScheduledMessages userRole={currentUser.role} />}
          {activeTab === "logs" && <LogViewer userRole={currentUser.role} />}
          {currentUser.role === "admin" && activeTab === "users" && <UserManagement />}
          {currentUser.role === "admin" && activeTab === "whatsapp" && <WhatsAppStatus />}
          {currentUser.role === "admin" && activeTab === "settings" && <SystemSettings />}
        </div>
      </div>
    )
  }

  // Registration page
  if (showRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto p-6">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">WhatsApp Scheduler Pro</h1>
            <p className="text-lg text-gray-600">Cara Daftar Akun Baru</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" onClick={() => setShowRegistration(false)}>
                ← Kembali
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Proses Pendaftaran
                </CardTitle>
                <CardDescription>Ikuti langkah-langkah berikut untuk mendaftar akun baru</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Kirim Pesan ke Admin WhatsApp</h3>
                    <p className="text-gray-600 mb-3">
                      Klik tombol di bawah untuk mengirim pesan pendaftaran ke admin melalui WhatsApp.
                    </p>
                    <Button onClick={handleSendRegistration} className="bg-green-600 hover:bg-green-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Kirim Pesan Pendaftaran
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Tunggu Persetujuan Admin</h3>
                    <p className="text-gray-600">
                      Admin akan memverifikasi permintaan Anda dan mengirim notifikasi persetujuan melalui WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Akun Disetujui & Terima Password</h3>
                    <p className="text-gray-600">
                      Setelah disetujui, Anda akan menerima password login melalui WhatsApp.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kontak Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Admin WhatsApp Scheduler:</p>
                  <p className="font-mono text-lg font-semibold">{ADMIN_PHONE}</p>
                  <p className="text-sm text-gray-500 mt-2">Jam operasional: Senin - Jumat, 09:00 - 17:00 WIB</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Login page
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WhatsApp Scheduler Pro</h1>
          <p className="text-lg text-gray-600">Sistem Penjadwalan Pesan WhatsApp Otomatis</p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Database Connection Status */}
          <Card
            className={
              connectionStatus === "error"
                ? "border-red-200 bg-red-50"
                : connectionStatus === "connected"
                  ? "border-green-200 bg-green-50"
                  : "border-yellow-200 bg-yellow-50"
            }
          >
            <CardContent className="pt-6">
              <div
                className={`flex items-center gap-2 ${connectionStatus === "error" ? "text-red-700" : connectionStatus === "connected" ? "text-green-700" : "text-yellow-700"}`}
              >
                {connectionStatus === "error" ? (
                  <AlertCircle className="w-5 h-5" />
                ) : connectionStatus === "connected" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                )}
                <span className="font-medium">
                  {connectionStatus === "error"
                    ? "Database Connection Error"
                    : connectionStatus === "connected"
                      ? "Database Connected"
                      : "Checking Connection..."}
                </span>
              </div>
              <p
                className={`text-sm mt-2 ${connectionStatus === "error" ? "text-red-600" : connectionStatus === "connected" ? "text-green-600" : "text-yellow-600"}`}
              >
                {connectionStatus === "error"
                  ? "Cannot connect to database. Please run the SQL script first."
                  : connectionStatus === "connected"
                    ? "Database ready. Login dengan credentials admin yang telah dibuat."
                    : "Verifying database connection..."}
              </p>
              <Button
                onClick={testDatabaseConnection}
                variant="outline"
                size="sm"
                className="mt-3 bg-transparent"
                disabled={connectionStatus === "checking"}
              >
                {connectionStatus === "checking" ? "Testing..." : "Test Connection"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <MessageSquare className="w-6 h-6 text-green-600" />
                Login ke Sistem
              </CardTitle>
              <CardDescription>Masukkan nomor WhatsApp dan password Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="phone">Nomor WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+6281234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || connectionStatus !== "connected"}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Memverifikasi...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              {/* Clean Database Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">🧹 Database Bersih</p>
                <div className="text-xs text-blue-800 space-y-1">
                  <p>• Tidak ada data dummy</p>
                  <p>• Siap untuk testing dari awal</p>
                  <p>• Buat admin pertama jika belum ada</p>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  ⚠️ Jalankan SQL script clean-database-setup.sql terlebih dahulu!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Belum Punya Akun?
              </CardTitle>
              <CardDescription>Daftar melalui WhatsApp dan tunggu persetujuan admin</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowRegistration(true)} className="w-full" variant="outline">
                Cara Daftar Akun Baru
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
