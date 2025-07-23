import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  nama: string;
  email: string;
  phone_number: string;
  saldo: number;
  created_at: string;
  profile_picture_url: string;
}

interface Mitra {
  id: string;
  nama_toko: string;
  email: string;
  phone_number: string;
  alamat: string;
  status: string;
  saldo: number;
  description: string;
  created_at: string;
}

interface AdminCredential {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const KelolaPengguna = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [admins, setAdmins] = useState<AdminCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchMitras(),
        fetchAdmins()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMitras = async () => {
    try {
      let query = supabase
        .from("mitra")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMitras(data || []);
    } catch (error) {
      console.error("Error fetching mitras:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_credentials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const updateMitraStatus = async (mitraId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("mitra")
        .update({ status: newStatus })
        .eq("id", mitraId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `Status mitra berhasil diubah ke ${newStatus}`,
      });

      fetchMitras();
    } catch (error) {
      console.error("Error updating mitra status:", error);
      toast({
        title: "Error",
        description: "Gagal mengubah status mitra",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "terverifikasi":
        return "bg-green-500/10 text-green-500";
      case "ditolak":
        return "bg-red-500/10 text-red-500";
      case "suspended":
        return "bg-orange-500/10 text-orange-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu";
      case "terverifikasi":
        return "Terverifikasi";
      case "ditolak":
        return "Ditolak";
      case "suspended":
        return "Disuspend";
      default:
        return status;
    }
  };

  const filteredUsers = users.filter(user =>
    searchTerm === "" ||
    user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMitras = mitras.filter(mitra =>
    searchTerm === "" ||
    mitra.nama_toko.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mitra.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdmins = admins.filter(admin =>
    searchTerm === "" ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          Kelola Pengguna
        </h2>
        <p className="text-muted-foreground">
          Kelola data user, mitra, dan admin dalam sistem
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          fetchMitras();
        }}>
          <SelectTrigger className="bg-secondary border-border w-48">
            <SelectValue placeholder="Filter Status Mitra" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="terverifikasi">Terverifikasi</SelectItem>
            <SelectItem value="ditolak">Ditolak</SelectItem>
            <SelectItem value="suspended">Disuspend</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="mitras">Mitras ({filteredMitras.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({filteredAdmins.length})</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card className="bg-gradient-card border border-border">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Tidak ada user
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Tidak ada user yang sesuai pencarian" : "Belum ada user terdaftar"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="bg-gradient-card border border-border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                            {user.profile_picture_url ? (
                              <img 
                                src={user.profile_picture_url} 
                                alt={user.nama}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xl">👤</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{user.nama}</h3>
                            <p className="text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground">Telepon:</label>
                            <p className="text-muted-foreground">
                              {user.phone_number || "Tidak ada"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground">Saldo:</label>
                            <p className="text-lg font-bold text-primary">
                              Rp {user.saldo.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground">Bergabung:</label>
                            <p className="text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Mitras Tab */}
        <TabsContent value="mitras" className="space-y-4">
          {filteredMitras.length === 0 ? (
            <Card className="bg-gradient-card border border-border">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🏪</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Tidak ada mitra
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Tidak ada mitra yang sesuai pencarian" : "Belum ada mitra terdaftar"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredMitras.map((mitra) => (
                <Card key={mitra.id} className="bg-gradient-card border border-border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{mitra.nama_toko}</h3>
                        <p className="text-muted-foreground">{mitra.email}</p>
                      </div>
                      <Badge className={getStatusColor(mitra.status)}>
                        {getStatusText(mitra.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Telepon:</label>
                        <p className="text-muted-foreground">{mitra.phone_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Alamat:</label>
                        <p className="text-muted-foreground">{mitra.alamat}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Saldo:</label>
                        <p className="text-lg font-bold text-primary">
                          Rp {mitra.saldo.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Bergabung:</label>
                        <p className="text-muted-foreground">
                          {new Date(mitra.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>

                    {mitra.description && (
                      <div className="mb-4">
                        <label className="text-sm font-medium text-foreground">Deskripsi:</label>
                        <p className="text-muted-foreground">{mitra.description}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {mitra.status === "pending" && (
                        <>
                          <Button
                            onClick={() => updateMitraStatus(mitra.id, "terverifikasi")}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            ✅ Verifikasi
                          </Button>
                          <Button
                            onClick={() => updateMitraStatus(mitra.id, "ditolak")}
                            variant="destructive"
                            size="sm"
                          >
                            ❌ Tolak
                          </Button>
                        </>
                      )}
                      
                      {mitra.status === "terverifikasi" && (
                        <Button
                          onClick={() => updateMitraStatus(mitra.id, "suspended")}
                          variant="destructive"
                          size="sm"
                        >
                          🚫 Suspend
                        </Button>
                      )}
                      
                      {mitra.status === "suspended" && (
                        <Button
                          onClick={() => updateMitraStatus(mitra.id, "terverifikasi")}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          ✅ Aktifkan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins" className="space-y-4">
          {filteredAdmins.length === 0 ? (
            <Card className="bg-gradient-card border border-border">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Tidak ada admin
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Tidak ada admin yang sesuai pencarian" : "Belum ada admin terdaftar"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAdmins.map((admin) => (
                <Card key={admin.id} className="bg-gradient-card border border-border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{admin.email}</h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="default">{admin.role}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Dibuat: {new Date(admin.created_at).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-xl">👨‍💼</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KelolaPengguna;