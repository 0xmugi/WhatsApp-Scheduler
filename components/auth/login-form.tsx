"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

interface User {
  id: string
  phone: string
  name: string
  role: "admin" | "user"
  status: "approved" | "pending" | "rejected"
}

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get user from database
      const { data: user, error } = await supabase.from("users").select("*").eq("phone", phone).single()

      if (error || !user) {
        toast({
          title: "Login Gagal",
          description: "Nomor WhatsApp tidak terdaftar. Silakan daftar terlebih dahulu.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

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

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        toast({
          title: "Password Salah",
          description: "Password yang Anda masukkan salah.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Update last active
      await supabase.from("users").update({ last_active: new Date().toISOString() }).eq("id", user.id)

      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${user.name}!`,
      })

      onLogin({
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        status: user.status,
      })
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
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

          <Button type="submit" className="w-full" disabled={isLoading}>
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
      </CardContent>
    </Card>
  )
}
