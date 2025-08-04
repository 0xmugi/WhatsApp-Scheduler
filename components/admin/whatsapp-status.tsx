"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Smartphone, QrCode, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function WhatsAppStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [deviceInfo, setDeviceInfo] = useState({
    phone: "+6281234567890",
    name: "WhatsApp Scheduler Bot",
    battery: 85,
    lastSeen: "2 menit yang lalu",
  })

  const handleConnect = async () => {
    setIsConnecting(true)

    // Simulate QR code generation
    setTimeout(() => {
      setQrCode("qr-code-placeholder")
      toast({
        title: "QR Code Generated",
        description: "Scan QR code dengan WhatsApp Anda untuk menghubungkan",
      })
    }, 1000)

    // Simulate connection after 5 seconds
    setTimeout(() => {
      setIsConnected(true)
      setIsConnecting(false)
      setQrCode("")
      toast({
        title: "WhatsApp Terhubung",
        description: "Bot WhatsApp berhasil terhubung dan siap digunakan",
      })
    }, 5000)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    toast({
      title: "WhatsApp Terputus",
      description: "Koneksi WhatsApp telah diputus",
    })
  }

  const handleRefresh = () => {
    toast({
      title: "Status Diperbarui",
      description: "Status koneksi WhatsApp telah diperbarui",
    })
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red-600" />}
            Status Koneksi WhatsApp
          </CardTitle>
          <CardDescription>Status koneksi bot WhatsApp dengan WhatsApp Web</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge className={isConnected ? "bg-green-500" : "bg-red-500"}>
                {isConnected ? "Terhubung" : "Terputus"}
              </Badge>
              {isConnecting && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Menghubungkan...
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              {isConnected ? (
                <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                  <WifiOff className="w-4 h-4 mr-1" />
                  Putus Koneksi
                </Button>
              ) : (
                <Button size="sm" onClick={handleConnect} disabled={isConnecting}>
                  <Wifi className="w-4 h-4 mr-1" />
                  Hubungkan
                </Button>
              )}
            </div>
          </div>

          {/* Device Info */}
          {isConnected && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Informasi Perangkat</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nomor:</span>
                  <p className="font-medium">{deviceInfo.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Nama:</span>
                  <p className="font-medium">{deviceInfo.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Baterai:</span>
                  <p className="font-medium">{deviceInfo.battery}%</p>
                </div>
                <div>
                  <span className="text-gray-600">Terakhir Online:</span>
                  <p className="font-medium">{deviceInfo.lastSeen}</p>
                </div>
              </div>
            </div>
          )}

          {/* QR Code */}
          {qrCode && !isConnected && (
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <QrCode className="w-8 h-8 mx-auto text-blue-600 mb-4" />
              <h3 className="font-semibold text-blue-900 mb-2">Scan QR Code</h3>
              <p className="text-sm text-blue-700 mb-4">
                Buka WhatsApp di ponsel Anda, pilih "Perangkat Tertaut" dan scan QR code di bawah
              </p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">QR Code akan expired dalam 20 detik</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Pengiriman Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1,234</div>
              <div className="text-sm text-blue-700">Total Terkirim</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">1,189</div>
              <div className="text-sm text-green-700">Berhasil</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">45</div>
              <div className="text-sm text-red-700">Gagal</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">12</div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Pesan broadcast berhasil dikirim</p>
                <p className="text-sm text-gray-600">150 kontak • 2 menit yang lalu</p>
              </div>
              <Badge className="bg-green-500">Berhasil</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">User baru mendaftar</p>
                <p className="text-sm text-gray-600">John Doe • 15 menit yang lalu</p>
              </div>
              <Badge className="bg-yellow-500">Pending</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Jadwal pesan dibuat</p>
                <p className="text-sm text-gray-600">Admin Demo • 1 jam yang lalu</p>
              </div>
              <Badge className="bg-blue-500">Aktif</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
