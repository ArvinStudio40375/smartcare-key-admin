import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface AppSettings {
  // General Settings
  appName: string;
  appDescription: string;
  appVersion: string;
  
  // Financial Settings
  minTopupAmount: number;
  maxTopupAmount: number;
  minSaldoLimit: number;
  serviceFeePercentage: number;
  
  // User Settings
  autoVerifyUsers: boolean;
  allowGuestCheckout: boolean;
  requirePhoneVerification: boolean;
  
  // Mitra Settings
  autoVerifyMitras: boolean;
  mitraCommissionPercentage: number;
  minMitraRating: number;
  
  // Notification Settings
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  enablePushNotifications: boolean;
  
  // Maintenance Settings
  maintenanceMode: boolean;
  maintenanceMessage: string;
  
  // Security Settings
  sessionTimeout: number;
  maxLoginAttempts: number;
  requireStrongPassword: boolean;
}

const PengaturanAplikasi = () => {
  const [settings, setSettings] = useState<AppSettings>({
    // General Settings
    appName: "SmartCare",
    appDescription: "Platform layanan smartcare terpercaya",
    appVersion: "1.0.0",
    
    // Financial Settings
    minTopupAmount: 10000,
    maxTopupAmount: 10000000,
    minSaldoLimit: 5000,
    serviceFeePercentage: 5,
    
    // User Settings
    autoVerifyUsers: false,
    allowGuestCheckout: true,
    requirePhoneVerification: true,
    
    // Mitra Settings
    autoVerifyMitras: false,
    mitraCommissionPercentage: 15,
    minMitraRating: 4.0,
    
    // Notification Settings
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    enablePushNotifications: true,
    
    // Maintenance Settings
    maintenanceMode: false,
    maintenanceMessage: "Sistem sedang dalam perbaikan. Mohon tunggu beberapa saat.",
    
    // Security Settings
    sessionTimeout: 60,
    maxLoginAttempts: 3,
    requireStrongPassword: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Mark as having changes when settings are modified
    setHasChanges(true);
  }, [settings]);

  const loadSettings = () => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("app_settings");
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
    setHasChanges(false);
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage (in a real app, this would be sent to an API)
      localStorage.setItem("app_settings", JSON.stringify(settings));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Pengaturan Disimpan",
        description: "Semua pengaturan aplikasi berhasil disimpan",
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    if (confirm("Apakah Anda yakin ingin mengembalikan semua pengaturan ke default?")) {
      setSettings({
        appName: "SmartCare",
        appDescription: "Platform layanan smartcare terpercaya",
        appVersion: "1.0.0",
        minTopupAmount: 10000,
        maxTopupAmount: 10000000,
        minSaldoLimit: 5000,
        serviceFeePercentage: 5,
        autoVerifyUsers: false,
        allowGuestCheckout: true,
        requirePhoneVerification: true,
        autoVerifyMitras: false,
        mitraCommissionPercentage: 15,
        minMitraRating: 4.0,
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        enablePushNotifications: true,
        maintenanceMode: false,
        maintenanceMessage: "Sistem sedang dalam perbaikan. Mohon tunggu beberapa saat.",
        sessionTimeout: 60,
        maxLoginAttempts: 3,
        requireStrongPassword: true,
      });
      
      toast({
        title: "Pengaturan Direset",
        description: "Semua pengaturan telah dikembalikan ke default",
      });
    }
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Pengaturan Aplikasi
          </h2>
          <p className="text-muted-foreground">
            Konfigurasi umum sistem SmartCare
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={resetSettings}
            variant="outline"
            className="border-border hover:bg-secondary"
          >
            🔄 Reset
          </Button>
          <Button
            onClick={saveSettings}
            disabled={loading || !hasChanges}
            className="bg-gradient-primary hover:shadow-glow"
          >
            {loading ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card className="bg-gradient-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Pengaturan Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nama Aplikasi
                </label>
                <Input
                  value={settings.appName}
                  onChange={(e) => updateSetting("appName", e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Versi Aplikasi
                </label>
                <Input
                  value={settings.appVersion}
                  onChange={(e) => updateSetting("appVersion", e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Deskripsi Aplikasi
              </label>
              <Textarea
                value={settings.appDescription}
                onChange={(e) => updateSetting("appDescription", e.target.value)}
                className="bg-secondary border-border"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card className="bg-gradient-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Pengaturan Keuangan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Minimum Top-up (Rp)
                </label>
                <Input
                  type="number"
                  value={settings.minTopupAmount}
                  onChange={(e) => updateSetting("minTopupAmount", parseInt(e.target.value))}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Maximum Top-up (Rp)
                </label>
                <Input
                  type="number"
                  value={settings.maxTopupAmount}
                  onChange={(e) => updateSetting("maxTopupAmount", parseInt(e.target.value))}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Batas Minimum Saldo (Rp)
                </label>
                <Input
                  type="number"
                  value={settings.minSaldoLimit}
                  onChange={(e) => updateSetting("minSaldoLimit", parseInt(e.target.value))}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Fee Layanan (%)
                </label>
                <Input
                  type="number"
                  value={settings.serviceFeePercentage}
                  onChange={(e) => updateSetting("serviceFeePercentage", parseFloat(e.target.value))}
                  className="bg-secondary border-border"
                  step="0.1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User & Mitra Settings */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Pengaturan User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Auto Verifikasi User</label>
                  <p className="text-xs text-muted-foreground">Verifikasi otomatis user baru</p>
                </div>
                <Switch
                  checked={settings.autoVerifyUsers}
                  onCheckedChange={(checked) => updateSetting("autoVerifyUsers", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Guest Checkout</label>
                  <p className="text-xs text-muted-foreground">Izinkan pemesanan tanpa akun</p>
                </div>
                <Switch
                  checked={settings.allowGuestCheckout}
                  onCheckedChange={(checked) => updateSetting("allowGuestCheckout", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Verifikasi Telepon</label>
                  <p className="text-xs text-muted-foreground">Wajib verifikasi nomor telepon</p>
                </div>
                <Switch
                  checked={settings.requirePhoneVerification}
                  onCheckedChange={(checked) => updateSetting("requirePhoneVerification", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Pengaturan Mitra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Auto Verifikasi Mitra</label>
                  <p className="text-xs text-muted-foreground">Verifikasi otomatis mitra baru</p>
                </div>
                <Switch
                  checked={settings.autoVerifyMitras}
                  onCheckedChange={(checked) => updateSetting("autoVerifyMitras", checked)}
                />
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Komisi Mitra (%)
                </label>
                <Input
                  type="number"
                  value={settings.mitraCommissionPercentage}
                  onChange={(e) => updateSetting("mitraCommissionPercentage", parseFloat(e.target.value))}
                  className="bg-secondary border-border"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Rating Minimum Mitra
                </label>
                <Input
                  type="number"
                  value={settings.minMitraRating}
                  onChange={(e) => updateSetting("minMitraRating", parseFloat(e.target.value))}
                  className="bg-secondary border-border"
                  step="0.1"
                  min="1"
                  max="5"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <Card className="bg-gradient-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Pengaturan Notifikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Email Notifications</label>
                  <p className="text-xs text-muted-foreground">Kirim notifikasi via email</p>
                </div>
                <Switch
                  checked={settings.enableEmailNotifications}
                  onCheckedChange={(checked) => updateSetting("enableEmailNotifications", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">SMS Notifications</label>
                  <p className="text-xs text-muted-foreground">Kirim notifikasi via SMS</p>
                </div>
                <Switch
                  checked={settings.enableSMSNotifications}
                  onCheckedChange={(checked) => updateSetting("enableSMSNotifications", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Push Notifications</label>
                  <p className="text-xs text-muted-foreground">Kirim push notification</p>
                </div>
                <Switch
                  checked={settings.enablePushNotifications}
                  onCheckedChange={(checked) => updateSetting("enablePushNotifications", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance & Security */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Mode Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Aktifkan Maintenance</label>
                  <p className="text-xs text-muted-foreground">Nonaktifkan akses user sementara</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Pesan Maintenance
                </label>
                <Textarea
                  value={settings.maintenanceMessage}
                  onChange={(e) => updateSetting("maintenanceMessage", e.target.value)}
                  className="bg-secondary border-border"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Pengaturan Keamanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Session Timeout (menit)
                </label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting("sessionTimeout", parseInt(e.target.value))}
                  className="bg-secondary border-border"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Max Login Attempts
                </label>
                <Input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => updateSetting("maxLoginAttempts", parseInt(e.target.value))}
                  className="bg-secondary border-border"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Password Kuat</label>
                  <p className="text-xs text-muted-foreground">Wajib password kompleks</p>
                </div>
                <Switch
                  checked={settings.requireStrongPassword}
                  onCheckedChange={(checked) => updateSetting("requireStrongPassword", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PengaturanAplikasi;