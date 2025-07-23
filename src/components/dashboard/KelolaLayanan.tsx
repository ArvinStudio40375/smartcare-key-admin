import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Layanan {
  id: string;
  nama_layanan: string;
  description: string;
  base_price: number;
  icon_url: string;
  created_at: string;
  updated_at: string;
}

const KelolaLayanan = () => {
  const [layanans, setLayanans] = useState<Layanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLayanan, setEditingLayanan] = useState<Layanan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama_layanan: "",
    description: "",
    base_price: "",
    icon_url: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLayanans();
  }, []);

  const fetchLayanans = async () => {
    try {
      const { data, error } = await supabase
        .from("layanan")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLayanans(data || []);
    } catch (error) {
      console.error("Error fetching layanan:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data layanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_layanan || !formData.base_price) {
      toast({
        title: "Error",
        description: "Nama layanan dan harga dasar wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      const layananData = {
        nama_layanan: formData.nama_layanan,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        icon_url: formData.icon_url
      };

      if (editingLayanan) {
        // Update existing layanan
        const { error } = await supabase
          .from("layanan")
          .update(layananData)
          .eq("id", editingLayanan.id);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Layanan berhasil diperbarui",
        });
      } else {
        // Create new layanan
        const { error } = await supabase
          .from("layanan")
          .insert(layananData);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Layanan baru berhasil ditambahkan",
        });
      }

      // Reset form and close dialog
      setFormData({
        nama_layanan: "",
        description: "",
        base_price: "",
        icon_url: ""
      });
      setEditingLayanan(null);
      setIsDialogOpen(false);
      fetchLayanans();
    } catch (error) {
      console.error("Error saving layanan:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan layanan",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (layanan: Layanan) => {
    setEditingLayanan(layanan);
    setFormData({
      nama_layanan: layanan.nama_layanan,
      description: layanan.description || "",
      base_price: layanan.base_price?.toString() || "",
      icon_url: layanan.icon_url || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (layananId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("layanan")
        .delete()
        .eq("id", layananId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Layanan berhasil dihapus",
      });

      fetchLayanans();
    } catch (error) {
      console.error("Error deleting layanan:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus layanan",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingLayanan(null);
    setFormData({
      nama_layanan: "",
      description: "",
      base_price: "",
      icon_url: ""
    });
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
            Kelola Layanan SmartCare
          </h2>
          <p className="text-muted-foreground">
            Atur daftar layanan yang tersedia dalam sistem
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow">
              + Tambah Layanan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-card border border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingLayanan ? "Edit Layanan" : "Tambah Layanan Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nama Layanan *
                </label>
                <Input
                  value={formData.nama_layanan}
                  onChange={(e) => setFormData({ ...formData, nama_layanan: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="Contoh: Perbaikan AC"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Deskripsi
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="Deskripsi layanan..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Harga Dasar (Rp) *
                </label>
                <Input
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="50000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  URL Icon
                </label>
                <Input
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="https://example.com/icon.png"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="bg-gradient-primary hover:shadow-glow">
                  {editingLayanan ? "Perbarui" : "Tambah"}
                </Button>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {layanans.length === 0 ? (
        <Card className="bg-gradient-card border border-border">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Belum ada layanan
            </h3>
            <p className="text-muted-foreground">
              Tambahkan layanan pertama untuk memulai
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layanans.map((layanan) => (
            <Card key={layanan.id} className="bg-gradient-card border border-border hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {layanan.icon_url ? (
                    <img 
                      src={layanan.icon_url} 
                      alt={layanan.nama_layanan}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⚙️</span>
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-foreground text-lg">
                      {layanan.nama_layanan}
                    </CardTitle>
                    <p className="text-xl font-bold text-primary">
                      Rp {layanan.base_price?.toLocaleString("id-ID") || "0"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {layanan.description && (
                  <p className="text-muted-foreground text-sm">
                    {layanan.description}
                  </p>
                )}

                <div className="text-xs text-muted-foreground">
                  <p>Dibuat: {new Date(layanan.created_at).toLocaleDateString("id-ID")}</p>
                  {layanan.updated_at !== layanan.created_at && (
                    <p>Diperbarui: {new Date(layanan.updated_at).toLocaleDateString("id-ID")}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEdit(layanan)}
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-secondary"
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(layanan.id)}
                    variant="destructive"
                    size="sm"
                  >
                    🗑️ Hapus
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

export default KelolaLayanan;