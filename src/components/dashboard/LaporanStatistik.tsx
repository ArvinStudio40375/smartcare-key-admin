import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Statistics {
  totalUsers: number;
  totalMitras: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingTopups: number;
  completedServices: number;
  averageRating: number;
  monthlyGrowth: {
    users: number;
    revenue: number;
  };
}

const LaporanStatistik = () => {
  const [stats, setStats] = useState<Statistics>({
    totalUsers: 0,
    totalMitras: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingTopups: 0,
    completedServices: 0,
    averageRating: 0,
    monthlyGrowth: {
      users: 0,
      revenue: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [
        usersResult,
        mitrasResult,
        topupsResult,
        tagihansResult,
        completedTagihansResult,
        ratingsResult
      ] = await Promise.all([
        // Total Users
        supabase.from("users").select("id", { count: "exact", head: true }),
        
        // Total Mitras
        supabase.from("mitra").select("id", { count: "exact", head: true }),
        
        // Top-ups data
        supabase.from("topup").select("nominal, status, created_at"),
        
        // Tagihan data
        supabase.from("tagihan").select("nominal, status, order_date"),
        
        // Completed services
        supabase.from("tagihan").select("id", { count: "exact", head: true }).eq("status", "completed"),
        
        // Average rating
        supabase.from("tagihan").select("rating").not("rating", "is", null)
      ]);

      const totalUsers = usersResult.count || 0;
      const totalMitras = mitrasResult.count || 0;
      const topups = topupsResult.data || [];
      const tagihans = tagihansResult.data || [];
      const completedServices = completedTagihansResult.count || 0;
      const ratings = ratingsResult.data || [];

      // Calculate total transactions and revenue
      const approvedTopups = topups.filter(t => t.status === "approved");
      const completedTagihans = tagihans.filter(t => t.status === "completed");
      
      const totalTransactions = approvedTopups.length + completedTagihans.length;
      const totalRevenue = completedTagihans.reduce((sum, t) => sum + (t.nominal || 0), 0);
      
      const pendingTopups = topups.filter(t => t.status === "pending").length;
      
      // Calculate average rating
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length 
        : 0;

      // Calculate monthly growth (simple calculation for last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentUsers = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());
      
      const recentRevenue = completedTagihans
        .filter(t => new Date(t.order_date) >= thirtyDaysAgo)
        .reduce((sum, t) => sum + (t.nominal || 0), 0);

      setStats({
        totalUsers,
        totalMitras,
        totalTransactions,
        totalRevenue,
        pendingTopups,
        completedServices,
        averageRating: Math.round(averageRating * 10) / 10,
        monthlyGrowth: {
          users: recentUsers.count || 0,
          revenue: recentRevenue
        }
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast({
        title: "Error",
        description: "Gagal memuat statistik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Laporan & Statistik
        </h2>
        <p className="text-muted-foreground">
          Data analitik dan laporan kinerja sistem SmartCare
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-3xl">👥</div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalUsers.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-green-500">
                  +{stats.monthlyGrowth.users} bulan ini
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Mitra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-3xl">🏪</div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalMitras.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mitra terdaftar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-3xl">💰</div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalTransactions.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Transaksi berhasil
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-3xl">📈</div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  Rp {stats.totalRevenue.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-green-500">
                  +Rp {stats.monthlyGrowth.revenue.toLocaleString("id-ID")} bulan ini
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Status Layanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Layanan Selesai</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✅</span>
                <span className="font-bold text-foreground">
                  {stats.completedServices}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Top-up Menunggu</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⏳</span>
                <span className="font-bold text-yellow-500">
                  {stats.pendingTopups}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Rating Rata-rata</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⭐</span>
                <span className="font-bold text-foreground">
                  {stats.averageRating}/5
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Pertumbuhan Bulanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pengguna Baru</span>
                <span className="font-bold text-green-500">
                  +{stats.monthlyGrowth.users}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((stats.monthlyGrowth.users / Math.max(stats.totalUsers, 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pendapatan Bulanan</span>
                <span className="font-bold text-primary">
                  Rp {stats.monthlyGrowth.revenue.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((stats.monthlyGrowth.revenue / Math.max(stats.totalRevenue, 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-card border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm font-medium text-foreground">Export Data</p>
              <p className="text-xs text-muted-foreground">Download laporan</p>
            </div>
            
            <div className="text-center p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">📧</div>
              <p className="text-sm font-medium text-foreground">Kirim Laporan</p>
              <p className="text-xs text-muted-foreground">Email otomatis</p>
            </div>
            
            <div className="text-center p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm font-medium text-foreground">Laporan Berkala</p>
              <p className="text-xs text-muted-foreground">Atur jadwal</p>
            </div>
            
            <div className="text-center p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-sm font-medium text-foreground">Analisis Detail</p>
              <p className="text-xs text-muted-foreground">Lihat detail</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaporanStatistik;