import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  user_id: string;
  nominal: number;
  payment_method: string;
  status: string;
  transaction_code: string;
  created_at: string;
  type: "topup" | "tagihan";
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

const RiwayatTransaksi = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [filter, typeFilter]);

  const fetchTransactions = async () => {
    try {
      const transactions: Transaction[] = [];

      // Fetch top-up transactions
      if (typeFilter === "all" || typeFilter === "topup") {
        let topupQuery = supabase
          .from("topup")
          .select(`
            *,
            users (nama, email)
          `)
          .order("created_at", { ascending: false });

        if (filter !== "all") {
          topupQuery = topupQuery.eq("status", filter);
        }

        const { data: topupData, error: topupError } = await topupQuery;
        if (topupError) throw topupError;

        topupData?.forEach(topup => {
          transactions.push({
            ...topup,
            type: "topup"
          });
        });
      }

      // Fetch tagihan transactions
      if (typeFilter === "all" || typeFilter === "tagihan") {
        let tagihanQuery = supabase
          .from("tagihan")
          .select(`
            *,
            users (nama, email),
            mitra (nama_toko),
            layanan (nama_layanan)
          `)
          .order("order_date", { ascending: false });

        if (filter !== "all") {
          tagihanQuery = tagihanQuery.eq("status", filter);
        }

        const { data: tagihanData, error: tagihanError } = await tagihanQuery;
        if (tagihanError) throw tagihanError;

        tagihanData?.forEach(tagihan => {
          transactions.push({
            id: tagihan.id,
            user_id: tagihan.user_id,
            nominal: tagihan.nominal,
            payment_method: tagihan.payment_method || "Unknown",
            status: tagihan.status,
            transaction_code: "",
            created_at: tagihan.order_date,
            type: "tagihan",
            users: tagihan.users,
            mitra: tagihan.mitra,
            layanan: tagihan.layanan
          });
        });
      }

      // Sort by created_at
      transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Gagal memuat riwayat transaksi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "approved":
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "rejected":
      case "cancelled":
        return "bg-red-500/10 text-red-500";
      case "processing":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu";
      case "approved":
        return "Disetujui";
      case "completed":
        return "Selesai";
      case "rejected":
        return "Ditolak";
      case "cancelled":
        return "Dibatalkan";
      case "processing":
        return "Diproses";
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    return type === "topup" 
      ? "bg-blue-500/10 text-blue-500" 
      : "bg-green-500/10 text-green-500";
  };

  const getTypeText = (type: string) => {
    return type === "topup" ? "Top Up" : "Layanan";
  };

  const filteredTransactions = transactions.filter(transaction =>
    searchTerm === "" ||
    transaction.users?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          Riwayat Transaksi
        </h2>
        <p className="text-muted-foreground">
          Log semua transaksi keuangan dalam sistem
        </p>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Cari Transaksi
          </label>
          <Input
            placeholder="Cari nama, email, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Tipe Transaksi
          </label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="topup">Top Up</SelectItem>
              <SelectItem value="tagihan">Layanan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Status
          </label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
              <SelectItem value="processing">Diproses</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={fetchTransactions}
            className="w-full bg-gradient-primary hover:shadow-glow"
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <Card className="bg-gradient-card border border-border">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tidak ada transaksi
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Tidak ada transaksi yang sesuai dengan pencarian"
                : "Belum ada transaksi dalam sistem"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
          </div>
          
          <div className="grid gap-4">
            {filteredTransactions.map((transaction) => (
              <Card key={`${transaction.type}-${transaction.id}`} className="bg-gradient-card border border-border">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex space-x-3">
                      <Badge className={getTypeColor(transaction.type)}>
                        {getTypeText(transaction.type)}
                      </Badge>
                      <Badge className={getStatusColor(transaction.status)}>
                        {getStatusText(transaction.status)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        Rp {transaction.nominal.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Pelanggan:</label>
                      <p className="text-muted-foreground">
                        {transaction.users?.nama || "User tidak ditemukan"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.users?.email}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">
                        {transaction.type === "topup" ? "Metode Pembayaran:" : "Layanan:"}
                      </label>
                      <p className="text-muted-foreground">
                        {transaction.type === "topup" 
                          ? transaction.payment_method
                          : transaction.layanan?.nama_layanan || "Tidak diketahui"
                        }
                      </p>
                      {transaction.type === "tagihan" && transaction.mitra && (
                        <p className="text-xs text-muted-foreground">
                          Mitra: {transaction.mitra.nama_toko}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">ID Transaksi:</label>
                      <p className="text-muted-foreground font-mono text-sm">
                        {transaction.id.slice(0, 8)}...
                      </p>
                      {transaction.transaction_code && (
                        <p className="text-xs text-muted-foreground">
                          Kode: {transaction.transaction_code}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiwayatTransaksi;