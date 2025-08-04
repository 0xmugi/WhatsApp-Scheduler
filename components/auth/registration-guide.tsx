"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MessageSquare, CheckCircle, Clock, UserCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface RegistrationGuideProps {
  onBack: () => void
}

export function RegistrationGuide({ onBack }: RegistrationGuideProps) {
  const [adminPhone, setAdminPhone] = useState("+6283815514533") // Default

  useEffect(() => {
    getAdminPhone()
  }, [])

  const getAdminPhone = async () => {
    try {
      const { data } = await supabase.from("system_settings").select("value").eq("key", "admin_phone").single()

      if (data?.value) {
        setAdminPhone(data.value)
      }
    } catch (error) {
      console.error("Error getting admin phone:", error)
    }
  }

  const handleSendRegistration = () => {
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

    window.open(`https://wa.me/${adminPhone.replace("+", "")}?text=${message}`, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <h2 className="text-2xl font-bold">Cara Daftar Akun Baru</h2>
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
          {/* Step 1 */}
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

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tunggu Persetujuan Admin</h3>
              <p className="text-gray-600">
                Admin akan memverifikasi permintaan Anda dan mengirim notifikasi persetujuan melalui WhatsApp. Proses
                ini biasanya memakan waktu 1-24 jam kerja.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Akun Disetujui & Terima Password</h3>
              <p className="text-gray-600">
                Setelah disetujui, Anda akan menerima password login melalui WhatsApp dan dapat mengakses sistem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            Kontak Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Admin WhatsApp Scheduler:</p>
            <p className="font-mono text-lg font-semibold">{adminPhone}</p>
            <p className="text-sm text-gray-500 mt-2">Jam operasional: Senin - Jumat, 09:00 - 17:00 WIB</p>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600">Catatan Penting</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Pastikan nomor WhatsApp yang Anda daftarkan aktif dan dapat menerima pesan</li>
            <li>• Jelaskan dengan jelas keperluan Anda menggunakan sistem ini</li>
            <li>• Sertakan informasi instansi/perusahaan jika diperlukan</li>
            <li>• Akun yang tidak digunakan dalam 30 hari akan dinonaktifkan</li>
            <li>• Penyalahgunaan sistem akan mengakibatkan pemblokiran akun</li>
            <li>• Password akan dikirim melalui WhatsApp setelah akun disetujui</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
