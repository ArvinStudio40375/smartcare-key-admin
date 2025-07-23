import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  nama: string;
  email: string;
  saldo: number;
}

interface Mitra {
  id: string;
  nama_toko: string;
  email: string;
  saldo: number;
}

const KirimSaldoManual = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [selectedType, setSelectedType] = useState<"user" | "mitra">("user");
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchMitras();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, nama, email, saldo")
        .order("nama");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMitras = async () => {
    try {
      const { data, error } = await supabase
        .from("mitra")
        .select("id, nama_toko, email, saldo")
        .eq("status", "terverifikasi")
        .order("nama_toko");

      if (error) throw error;
      setMitras(data || []);
    } catch (error) {
      console.error("Error fetching mitras:", error);
    }
  };

  const handleKirimSaldo = async () => {
    if (!selectedId || !amount) {
      toast({
        title: "Error",
        description: "Harap lengkapi semua field",
        variant: "destructive",
      });
      return;
    }

    const nominal = parseInt(amount);
    if (nominal <= 0) {
      toast({
        title: "Error",
        description: "Nominal harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedType === "user") {
        // Update saldo user
        const { error } = await supabase
          .rpc("tambah_saldo", {
            user_id_input: selectedId,
            jumlah_input: nominal
          });

        if (error) throw error;
      } else {
        // Get current saldo first
        const { data: mitraData, error: fetchError } = await supabase
          .from("mitra")
          .select("saldo")
          .eq("id", selectedId)
          .single();

        if (fetchError) throw fetchError;

        // Update saldo mitra
        const { error } = await supabase
          .from("mitra")
          .update({ saldo: mitraData.saldo + nominal })
          .eq("id", selectedId);

        if (error) throw error;
      }

      toast({
        title: "Berhasil",
        description: `Saldo sebesar Rp ${nominal.toLocaleString("id-ID")} berhasil dikirim`,
      });

      // Reset form
      setSelectedId("");
      setAmount("");
      
      // Refresh data
      fetchUsers();
      fetchMitras();
    } catch (error) {
      console.error("Error sending saldo:", error);
      toast({
        title: "Error",
        description: "Gagal mengirim saldo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedData = () => {
    if (selectedType === "user") {
      return users.find(u => u.id === selectedId);
    } else {
      return mitras.find(m => m.id === selectedId);
    }
  };

  const selectedData = getSelectedData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Kirim Saldo Manual
        </h2>
        <p className="text-muted-foreground">
          Transfer saldo secara manual ke user atau mitra
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Form Transfer Saldo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Tipe Penerima
              </label>
              <Select value={selectedType} onValueChange={(value: "user" | "mitra") => {
                setSelectedType(value);
                setSelectedId("");
              }}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Pilih tipe penerima" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="mitra">Mitra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Pilih {selectedType === "user" ? "User" : "Mitra"}
              </label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={`Pilih ${selectedType}`} />
                </SelectTrigger>
                <SelectContent>
                  {selectedType === "user" 
                    ? users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.nama} ({user.email})
                        </SelectItem>
                      ))
                    : mitras.map(mitra => (
                        <SelectItem key={mitra.id} value={mitra.id}>
                          {mitra.nama_toko} ({mitra.email})
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Nominal (Rp)
              </label>
              <Input
                type="number"
                placeholder="Masukkan nominal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary border-border"
                min="1"
              />
            </div>

            <Button
              onClick={handleKirimSaldo}
              disabled={loading || !selectedId || !amount}
              className="w-full bg-gradient-primary hover:shadow-glow"
            >
              {loading ? "Mengirim..." : "💸 Kirim Saldo"}
            </Button>
          </CardContent>
        </Card>

        {selectedData && (
          <Card className="bg-gradient-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Informasi Penerima</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nama:</label>
                <p className="text-lg font-semibold text-foreground">
                  {selectedType === "user" 
                    ? (selectedData as User).nama 
                    : (selectedData as Mitra).nama_toko
                  }
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Email:</label>
                <p className="text-muted-foreground">{selectedData.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Saldo Saat Ini:</label>
                <p className="text-xl font-bold text-primary">
                  Rp {selectedData.saldo.toLocaleString("id-ID")}
                </p>
              </div>

              {amount && (
                <div className="pt-4 border-t border-border">
                  <label className="text-sm font-medium text-foreground">Saldo Setelah Transfer:</label>
                  <p className="text-xl font-bold text-green-500">
                    Rp {(selectedData.saldo + parseInt(amount || "0")).toLocaleString("id-ID")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KirimSaldoManual;