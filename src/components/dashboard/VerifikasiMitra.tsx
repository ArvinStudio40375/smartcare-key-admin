import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Mitra {
  id: string;
  nama_toko: string;
  email: string;
  alamat: string;
  phone_number: string;
  description: string;
  status: string;
  created_at: string;
}

const VerifikasiMitra = () => {
  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingMitras();
  }, []);

  const fetchPendingMitras = async () => {
    try {
      const { data, error } = await supabase
        .from("mitra")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMitras(data || []);
    } catch (error) {
      console.error("Error fetching mitras:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data mitra",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifikasi = async (mitraId: string) => {
    try {
      const { error } = await supabase
        .from("mitra")
        .update({ status: "terverifikasi" })
        .eq("id", mitraId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Mitra berhasil diverifikasi",
      });

      // Refresh data
      fetchPendingMitras();
    } catch (error) {
      console.error("Error verifying mitra:", error);
      toast({
        title: "Error",
        description: "Gagal memverifikasi mitra",
        variant: "destructive",
      });
    }
  };

  const handleTolak = async (mitraId: string) => {
    try {
      const { error } = await supabase
        .from("mitra")
        .update({ status: "ditolak" })
        .eq("id", mitraId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Mitra ditolak",
      });

      // Refresh data
      fetchPendingMitras();
    } catch (error) {
      console.error("Error rejecting mitra:", error);
      toast({
        title: "Error",
        description: "Gagal menolak mitra",
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
          Verifikasi Mitra Baru
        </h2>
        <p className="text-muted-foreground">
          Terdapat {mitras.length} mitra menunggu verifikasi
        </p>
      </div>

      {mitras.length === 0 ? (
        <Card className="bg-gradient-card border border-border">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tidak ada mitra pending
            </h3>
            <p className="text-muted-foreground">
              Semua permintaan mitra sudah diproses
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {mitras.map((mitra) => (
            <Card key={mitra.id} className="bg-gradient-card border border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-foreground">{mitra.nama_toko}</CardTitle>
                    <p className="text-muted-foreground">{mitra.email}</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Alamat:</label>
                    <p className="text-muted-foreground">{mitra.alamat}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Telepon:</label>
                    <p className="text-muted-foreground">{mitra.phone_number}</p>
                  </div>
                </div>
                
                {mitra.description && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Deskripsi:</label>
                    <p className="text-muted-foreground">{mitra.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground">Tanggal Daftar:</label>
                  <p className="text-muted-foreground">
                    {new Date(mitra.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => handleVerifikasi(mitra.id)}
                    className="bg-gradient-primary hover:shadow-glow"
                  >
                    ✅ Verifikasi
                  </Button>
                  <Button
                    onClick={() => handleTolak(mitra.id)}
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

export default VerifikasiMitra;