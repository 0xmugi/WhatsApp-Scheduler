"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, UserCheck, UserX, Shield, User, MessageSquare, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase, type User as UserType } from "@/lib/supabase"

export function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [newUserPhone, setNewUserPhone] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Disetujui"
      case "pending":
        return "Menunggu"
      case "rejected":
        return "Ditolak"
      default:
        return "Unknown"
    }
  }

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8)
  }

  const handleApprove = async (userId: string) => {
    try {
      const password = generatePassword()

      const { error } = await supabase
        .from("users")
        .update({
          status: "approved",
          password_hash: password,
          approved_at: new Date().toISOString(),
          approved_by: JSON.parse(localStorage.getItem("whatsapp_scheduler_user") || "{}").id,
        })
        .eq("id", userId)

      if (error) throw error

      const user = users.find((u) => u.id === userId)
      if (user) {
        // In real app, send WhatsApp message with password
        console.log(`Sending WhatsApp to ${user.phone}: 
🎉 AKUN DISETUJUI! 🎉

Halo ${user.name},

Selamat! Akun WhatsApp Scheduler Anda telah disetujui.

📱 Login Details:
• Nomor: ${user.phone}
• Password: ${password}

🔗 Link: ${window.location.origin}

Silakan login dan mulai gunakan sistem. Jaga kerahasiaan password Anda.

Terima kasih! 🙏`)

        toast({
          title: "User Disetujui",
          description: `${user.name} telah disetujui. Password: ${password}`,
        })
      }

      fetchUsers()
    } catch (error) {
      console.error("Error approving user:", error)
      toast({
        title: "Error",
        description: "Gagal menyetujui user",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const { error } = await supabase.from("users").update({ status: "rejected" }).eq("id", userId)

      if (error) throw error

      const user = users.find((u) => u.id === userId)
      if (user) {
        // In real app, send WhatsApp rejection message
        console.log(`Sending WhatsApp to ${user.phone}: 
❌ PENDAFTARAN DITOLAK

Halo ${user.name},

Maaf, permintaan akun WhatsApp Scheduler Anda tidak dapat disetujui saat ini.

Jika Anda merasa ini adalah kesalahan, silakan hubungi admin untuk informasi lebih lanjut.

Terima kasih atas pengertiannya.`)

        toast({
          title: "User Ditolak",
          description: `Permintaan ${user.name} telah ditolak.`,
        })
      }

      fetchUsers()
    } catch (error) {
      console.error("Error rejecting user:", error)
      toast({
        title: "Error",
        description: "Gagal menolak user",
        variant: "destructive",
      })
    }
  }

  const handleAddUser = async () => {
    if (!newUserPhone || !newUserName) {
      toast({
        title: "Data tidak lengkap",
        description: "Harap isi nama dan nomor telepon",
        variant: "destructive",
      })
      return
    }

    try {
      const password = generatePassword()

      const { error } = await supabase.from("users").insert({
        name: newUserName,
        phone: newUserPhone,
        role: newUserRole,
        status: "approved",
        password_hash: password,
        approved_at: new Date().toISOString(),
        approved_by: JSON.parse(localStorage.getItem("whatsapp_scheduler_user") || "{}").id,
      })

      if (error) throw error

      // In real app, send WhatsApp welcome message
      console.log(`Sending WhatsApp to ${newUserPhone}: 
🎉 AKUN DIBUAT! 🎉

Halo ${newUserName},

Akun WhatsApp Scheduler Anda telah dibuat oleh admin.

📱 Login Details:
• Nomor: ${newUserPhone}
• Password: ${password}
• Role: ${newUserRole}

🔗 Link: ${window.location.origin}

Silakan login dan mulai gunakan sistem.

Selamat datang! 🙏`)

      toast({
        title: "User berhasil ditambahkan",
        description: `${newUserName} telah ditambahkan sebagai ${newUserRole}. Password: ${password}`,
      })

      setNewUserPhone("")
      setNewUserName("")
      fetchUsers()
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Error",
        description: "Gagal menambahkan user",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = (phone: string, name: string) => {
    const message = encodeURIComponent(`Halo ${name}, ini pesan dari Admin WhatsApp Scheduler.`)
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || "+6281234567890"
    window.open(`https://wa.me/${phone.replace("+", "")}?text=${message}`, "_blank")
  }

  const pendingUsers = users.filter((user) => user.status === "pending")

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add New User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Tambah User Baru (Manual)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Nama Lengkap</Label>
              <Input placeholder="John Doe" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
            </div>
            <div>
              <Label>Nomor WhatsApp</Label>
              <Input
                placeholder="+628123456789"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as "admin" | "user")}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button onClick={handleAddUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-yellow-600" />
                Menunggu Persetujuan ({pendingUsers.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchUsers}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Nomor WhatsApp</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tanggal Request</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            User
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(user.id)}>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Setujui
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(user.id)}>
                          <UserX className="w-4 h-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Semua User ({users.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchUsers}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Nomor WhatsApp</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terakhir Aktif</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 mr-1" />
                          User
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>{getStatusText(user.status)}</Badge>
                  </TableCell>
                  <TableCell>{user.last_active ? new Date(user.last_active).toLocaleString("id-ID") : "-"}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleSendMessage(user.phone, user.name)}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Kirim Pesan
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
