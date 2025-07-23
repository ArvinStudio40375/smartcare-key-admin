import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Tagihan {
  id: string;
  user_id: string;
  mitra_id: string;
  layanan_id: string;
  nominal: number;
  status: string;
  payment_method: string;
  order_date: string;
  completion_date: string;
  rating: number;
  review: string;
  users?: {
    nama: string;
    email: string;
  };
  mitra?: {
    nama_toko: string;
  };
  layanan?: {
    nama_layanan: string;
  };
}

const KelolaTagihan = () => {
  const [tagihans, setTagihans] = useState<Tagihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchTagihans();
  }, [filter]);

  const fetchTagihans = async () => {
    try {
      let query = supabase
        .from("tagihan")
        .select(`
          *,
          users (nama, email),
          mitra (nama_toko),
          layanan (nama_layanan)
        `)
        .order("order_date", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTagihans(data || []);
    } catch (error) {
      console.error("Error fetching tagihans:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data tagihan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (tagihanId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === "completed") {
        updateData.completion_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("tagihan")
        .update(updateData)
        .eq("id", tagihanId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `Status tagihan berhasil diubah ke ${newStatus}`,
      });

      fetchTagihans();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Gagal mengubah status tagihan",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "processing":
        return "bg-blue-500/10 text-blue-500";
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "cancelled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu";
      case "processing":
        return "Diproses";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Kelola Tagihan
          </h2>
          <p className="text-muted-foreground">
            Kelola semua tagihan layanan dalam sistem
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "Semua" },
          { value: "pending", label: "Menunggu" },
          { value: "processing", label: "Diproses" },
          { value: "completed", label: "Selesai" },
          { value: "cancelled", label: "Dibatalkan" }
        ].map((filterOption) => (
          <Button
            key={filterOption.value}
            variant={filter === filterOption.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filterOption.value)}
            className={
              filter === filterOption.value
                ? "bg-gradient-primary"
                : "border-border hover:bg-secondary"
            }
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      {tagihans.length === 0 ? (
        <Card className="bg-gradient-card border border-border">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🧾</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tidak ada tagihan
            </h3>
            <p className="text-muted-foreground">
              {filter === "all" 
                ? "Belum ada tagihan dalam sistem"
                : `Tidak ada tagihan dengan status ${getStatusText(filter)}`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tagihans.map((tagihan) => (
            <Card key={tagihan.id} className="bg-gradient-card border border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-foreground">
                      {tagihan.layanan?.nama_layanan || "Layanan tidak ditemukan"}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      ID: {tagihan.id.slice(0, 8)}...
                    </p>
                  </div>
                  <Badge className={getStatusColor(tagihan.status)}>
                    {getStatusText(tagihan.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Pelanggan:</label>
                    <p className="text-muted-foreground">
                      {tagihan.users?.nama || "User tidak ditemukan"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tagihan.users?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Mitra:</label>
                    <p className="text-muted-foreground">
                      {tagihan.mitra?.nama_toko || "Mitra tidak ditemukan"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Nominal:</label>
                    <p className="text-xl font-bold text-primary">
                      Rp {tagihan.nominal.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Tanggal Order:</label>
                    <p className="text-muted-foreground">
                      {new Date(tagihan.order_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Metode Pembayaran:</label>
                    <p className="text-muted-foreground">
                      {tagihan.payment_method || "Belum ditentukan"}
                    </p>
                  </div>
                </div>

                {tagihan.completion_date && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Tanggal Selesai:</label>
                    <p className="text-muted-foreground">
                      {new Date(tagihan.completion_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long", 
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                )}

                {tagihan.rating && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Rating:</label>
                      <p className="text-muted-foreground">
                        {"⭐".repeat(tagihan.rating)} ({tagihan.rating}/5)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Review:</label>
                      <p className="text-muted-foreground">
                        {tagihan.review || "Tidak ada review"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {tagihan.status === "pending" && (
                    <Button
                      onClick={() => updateStatus(tagihan.id, "processing")}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      Proses
                    </Button>
                  )}
                  {tagihan.status === "processing" && (
                    <Button
                      onClick={() => updateStatus(tagihan.id, "completed")}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Selesai
                    </Button>
                  )}
                  {(tagihan.status === "pending" || tagihan.status === "processing") && (
                    <Button
                      onClick={() => updateStatus(tagihan.id, "cancelled")}
                      variant="destructive"
                      size="sm"
                    >
                      Batalkan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default KelolaTagihan;