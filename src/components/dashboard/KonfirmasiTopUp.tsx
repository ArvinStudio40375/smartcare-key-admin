import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TopUp {
  id: string;
  user_id: string;
  nominal: number;
  payment_method: string;
  status: string;
  transaction_code: string;
  created_at: string;
  users?: {
    nama: string;
    email: string;
  };
}

const KonfirmasiTopUp = () => {
  const [topups, setTopups] = useState<TopUp[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingTopUps();
  }, []);

  const fetchPendingTopUps = async () => {
    try {
      const { data, error } = await supabase
        .from("topup")
        .select(`
          *,
          users (
            nama,
            email
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTopups(data || []);
    } catch (error) {
      console.error("Error fetching topups:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data top up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKonfirmasi = async (topup: TopUp) => {
    try {
      // Update status topup
      const { error: topupError } = await supabase
        .from("topup")
        .update({ status: "approved" })
        .eq("id", topup.id);

      if (topupError) throw topupError;

      // Update saldo user menggunakan function
      const { error: saldoError } = await supabase
        .rpc("tambah_saldo", {
          user_id_input: topup.user_id,
          jumlah_input: topup.nominal
        });

      if (saldoError) throw saldoError;

      toast({
        title: "Berhasil",
        description: `Top up sebesar Rp ${topup.nominal.toLocaleString("id-ID")} telah dikonfirmasi`,
      });

      fetchPendingTopUps();
    } catch (error) {
      console.error("Error confirming topup:", error);
      toast({
        title: "Error",
        description: "Gagal mengkonfirmasi top up",
        variant: "destructive",
      });
    }
  };

  const handleTolak = async (topupId: string) => {
    try {
      const { error } = await supabase
        .from("topup")
        .update({ status: "rejected" })
        .eq("id", topupId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Top up ditolak",
      });

      fetchPendingTopUps();
    } catch (error) {
      console.error("Error rejecting topup:", error);
      toast({
        title: "Error",
        description: "Gagal menolak top up",
        variant: "destructive",
      });
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
          Konfirmasi Top Up Saldo
        </h2>
        <p className="text-muted-foreground">
          Terdapat {topups.length} permintaan top up menunggu konfirmasi
        </p>
      </div>

      {topups.length === 0 ? (
        <Card className="bg-gradient-card border border-border">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tidak ada permintaan top up
            </h3>
            <p className="text-muted-foreground">
              Semua permintaan top up sudah diproses
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {topups.map((topup) => (
            <Card key={topup.id} className="bg-gradient-card border border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-foreground">
                      {topup.users?.nama || "User tidak ditemukan"}
                    </CardTitle>
                    <p className="text-muted-foreground">{topup.users?.email}</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Nominal:</label>
                    <p className="text-xl font-bold text-primary">
                      Rp {topup.nominal.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Metode Pembayaran:</label>
                    <p className="text-muted-foreground">{topup.payment_method}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Kode Transaksi:</label>
                    <p className="text-muted-foreground font-mono">
                      {topup.transaction_code || "Tidak ada"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Tanggal Permintaan:</label>
                  <p className="text-muted-foreground">
                    {new Date(topup.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => handleKonfirmasi(topup)}
                    className="bg-gradient-primary hover:shadow-glow"
                  >
                    ✅ Konfirmasi
                  </Button>
                  <Button
                    onClick={() => handleTolak(topup.id)}
                    variant="destructive"
                  >
                    ❌ Tolak
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default KonfirmasiTopUp;