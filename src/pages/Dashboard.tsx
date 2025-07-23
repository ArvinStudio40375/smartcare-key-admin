import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Menu Components
import VerifikasiMitra from "@/components/dashboard/VerifikasiMitra";
import KonfirmasiTopUp from "@/components/dashboard/KonfirmasiTopUp";
import KirimSaldoManual from "@/components/dashboard/KirimSaldoManual";
import LiveChat from "@/components/dashboard/LiveChat";
import KelolaTagihan from "@/components/dashboard/KelolaTagihan";
import KelolaLayanan from "@/components/dashboard/KelolaLayanan";
import RiwayatTransaksi from "@/components/dashboard/RiwayatTransaksi";
import KelolaPengguna from "@/components/dashboard/KelolaPengguna";
import LaporanStatistik from "@/components/dashboard/LaporanStatistik";
import KelolaNotifikasi from "@/components/dashboard/KelolaNotifikasi";
import PengaturanAplikasi from "@/components/dashboard/PengaturanAplikasi";

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("smartcare_admin_logged_in");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("smartcare_admin_logged_in");
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem",
    });
    navigate("/login");
  };

  const menuItems = [
    {
      id: "verifikasi-mitra",
      title: "Verifikasi Mitra Baru",
      icon: "👥",
      description: "Verifikasi data mitra baru"
    },
    {
      id: "konfirmasi-topup",
      title: "Konfirmasi Top Up",
      icon: "💰",
      description: "Setujui permintaan top up"
    },
    {
      id: "kirim-saldo",
      title: "Kirim Saldo Manual",
      icon: "📤",
      description: "Transfer saldo manual"
    },
    {
      id: "live-chat",
      title: "Live Chat",
      icon: "💬",
      description: "Chat dengan pengguna"
    },
    {
      id: "kelola-tagihan",
      title: "Kelola Tagihan",
      icon: "🧾",
      description: "Atur tagihan layanan"
    },
    {
      id: "kelola-layanan",
      title: "Kelola Layanan",
      icon: "⚙️",
      description: "Atur layanan SmartCare"
    },
    {
      id: "riwayat-transaksi",
      title: "Riwayat Transaksi",
      icon: "📊",
      description: "Log transaksi keuangan"
    },
    {
      id: "kelola-pengguna",
      title: "Kelola Pengguna",
      icon: "👤",
      description: "Atur data pengguna"
    },
    {
      id: "laporan-statistik",
      title: "Laporan & Statistik",
      icon: "📈",
      description: "Data dan analitik"
    },
    {
      id: "kelola-notifikasi",
      title: "Kelola Notifikasi",
      icon: "🔔",
      description: "Kirim pengumuman"
    },
    {
      id: "pengaturan",
      title: "Pengaturan Aplikasi",
      icon: "⚙️",
      description: "Konfigurasi sistem"
    },
    {
      id: "logout",
      title: "Logout",
      icon: "🚪",
      description: "Keluar dari sistem"
    }
  ];

  const renderActiveComponent = () => {
    switch (activeMenu) {
      case "verifikasi-mitra":
        return <VerifikasiMitra />;
      case "konfirmasi-topup":
        return <KonfirmasiTopUp />;
      case "kirim-saldo":
        return <KirimSaldoManual />;
      case "live-chat":
        return <LiveChat />;
      case "kelola-tagihan":
        return <KelolaTagihan />;
      case "kelola-layanan":
        return <KelolaLayanan />;
      case "riwayat-transaksi":
        return <RiwayatTransaksi />;
      case "kelola-pengguna":
        return <KelolaPengguna />;
      case "laporan-statistik":
        return <LaporanStatistik />;
      case "kelola-notifikasi":
        return <KelolaNotifikasi />;
      case "pengaturan":
        return <PengaturanAplikasi />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Selamat Datang di SmartCare Admin
            </h2>
            <p className="text-muted-foreground">
              Pilih menu di bawah untuk mulai mengelola sistem
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-card border-b border-border p-4 shadow-card">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">SmartCare Admin</h1>
          </div>
          <Button
            onClick={() => setActiveMenu("dashboard")}
            variant="outline"
            className="border-border hover:bg-secondary"
          >
            Dashboard
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {activeMenu === "dashboard" ? (
          <>
            {/* Welcome Section */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Dashboard Admin
              </h2>
              <p className="text-muted-foreground">
                Kelola semua aspek sistem SmartCare dari satu tempat
              </p>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {menuItems.map((item) => (
                <Card
                  key={item.id}
                  className="bg-gradient-card border border-border hover:shadow-glow transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    if (item.id === "logout") {
                      handleLogout();
                    } else {
                      setActiveMenu(item.id);
                    }
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div>
            {/* Back Button */}
            <Button
              onClick={() => setActiveMenu("dashboard")}
              variant="outline"
              className="mb-6 border-border hover:bg-secondary"
            >
              ← Kembali ke Dashboard
            </Button>
            
            {/* Active Component */}
            {renderActiveComponent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;