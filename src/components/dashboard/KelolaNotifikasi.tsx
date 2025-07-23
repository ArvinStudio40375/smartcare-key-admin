import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: "users" | "mitras" | "all";
  created_at: string;
}

const KelolaNotifikasi = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "all" as "users" | "mitras" | "all",
    sendImmediately: true,
    scheduledTime: ""
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMitras: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    loadTemplates();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersResult, mitrasResult] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("mitra").select("id", { count: "exact", head: true }).eq("status", "terverifikasi")
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalMitras: mitrasResult.count || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const loadTemplates = () => {
    // Load saved templates from localStorage
    const savedTemplates = localStorage.getItem("notification_templates");
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  };

  const saveTemplate = () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "Error",
        description: "Judul dan pesan notifikasi wajib diisi",
        variant: "destructive",
      });
      return;
    }

    const newTemplate: NotificationTemplate = {
      id: Date.now().toString(),
      title: formData.title,
      message: formData.message,
      type: formData.type,
      created_at: new Date().toISOString()
    };

    const updatedTemplates = [newTemplate, ...templates];
    setTemplates(updatedTemplates);
    localStorage.setItem("notification_templates", JSON.stringify(updatedTemplates));

    toast({
      title: "Berhasil",
      description: "Template notifikasi berhasil disimpan",
    });
  };

  const sendNotification = async () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "Error",
        description: "Judul dan pesan notifikasi wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would send notifications through your notification service
      // For now, we'll simulate the sending process
      
      let recipientCount = 0;
      if (formData.type === "users") {
        recipientCount = stats.totalUsers;
      } else if (formData.type === "mitras") {
        recipientCount = stats.totalMitras;
      } else {
        recipientCount = stats.totalUsers + stats.totalMitras;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Notifikasi Terkirim",
        description: `Notifikasi berhasil dikirim ke ${recipientCount} penerima`,
      });

      // Save template and reset form
      saveTemplate();
      setFormData({
        title: "",
        message: "",
        type: "all",
        sendImmediately: true,
        scheduledTime: ""
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Gagal mengirim notifikasi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: NotificationTemplate) => {
    setFormData({
      ...formData,
      title: template.title,
      message: template.message,
      type: template.type
    });
  };

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem("notification_templates", JSON.stringify(updatedTemplates));
    
    toast({
      title: "Berhasil",
      description: "Template berhasil dihapus",
    });
  };

  const getRecipientCount = () => {
    switch (formData.type) {
      case "users":
        return stats.totalUsers;
      case "mitras":
        return stats.totalMitras;
      default:
        return stats.totalUsers + stats.totalMitras;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "users":
        return "Users";
      case "mitras":
        return "Mitras";
      default:
        return "Semua";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "users":
        return "bg-blue-500/10 text-blue-500";
      case "mitras":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-purple-500/10 text-purple-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Kelola Notifikasi
        </h2>
        <p className="text-muted-foreground">
          Kirim pengumuman dan notifikasi ke pengguna sistem
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Notification Form */}
        <Card className="bg-gradient-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Buat Notifikasi Baru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Judul Notifikasi
              </label>
              <Input
                placeholder="Masukkan judul notifikasi"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Penerima
              </label>
              <Select value={formData.type} onValueChange={(value: "users" | "mitras" | "all") => 
                setFormData({ ...formData, type: value })
              }>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Semua ({stats.totalUsers + stats.totalMitras} penerima)
                  </SelectItem>
                  <SelectItem value="users">
                    Users saja ({stats.totalUsers} penerima)
                  </SelectItem>
                  <SelectItem value="mitras">
                    Mitras saja ({stats.totalMitras} penerima)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Pesan Notifikasi
              </label>
              <Textarea
                placeholder="Masukkan pesan notifikasi..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-secondary border-border"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.sendImmediately}
                onCheckedChange={(checked) => setFormData({ ...formData, sendImmediately: checked })}
              />
              <label className="text-sm font-medium text-foreground">
                Kirim sekarang
              </label>
            </div>

            {!formData.sendImmediately && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Jadwal Pengiriman
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
            )}

            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div className="bg-background p-3 rounded border">
                <h4 className="font-semibold text-foreground">
                  {formData.title || "Judul Notifikasi"}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.message || "Pesan notifikasi akan ditampilkan di sini..."}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <Badge className={getTypeColor(formData.type)}>
                    {getTypeText(formData.type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {getRecipientCount()} penerima
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={sendNotification}
                disabled={loading || !formData.title || !formData.message}
                className="flex-1 bg-gradient-primary hover:shadow-glow"
              >
                {loading ? "Mengirim..." : "📤 Kirim Notifikasi"}
              </Button>
              <Button
                onClick={saveTemplate}
                disabled={!formData.title || !formData.message}
                variant="outline"
                className="border-border hover:bg-secondary"
              >
                💾 Simpan Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card className="bg-gradient-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Template Notifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-muted-foreground">
                  Belum ada template tersimpan
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div key={template.id} className="border border-border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground text-sm">
                        {template.title}
                      </h4>
                      <Badge className={getTypeColor(template.type)}>
                        {getTypeText(template.type)}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {template.message}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {new Date(template.created_at).toLocaleDateString("id-ID")}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => useTemplate(template)}
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 px-2"
                        >
                          Gunakan
                        </Button>
                        <Button
                          onClick={() => deleteTemplate(template.id)}
                          size="sm"
                          variant="destructive"
                          className="text-xs h-6 px-2"
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🏪</div>
            <div className="text-2xl font-bold text-foreground">{stats.totalMitras}</div>
            <p className="text-sm text-muted-foreground">Total Mitras</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-2xl font-bold text-foreground">{stats.totalUsers + stats.totalMitras}</div>
            <p className="text-sm text-muted-foreground">Total Penerima</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KelolaNotifikasi;