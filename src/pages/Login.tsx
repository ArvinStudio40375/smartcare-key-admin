import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [accessCode, setAccessCode] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = () => {
    if (accessCode === "011090") {
      localStorage.setItem("smartcare_admin_logged_in", "true");
      toast({
        title: "Login Berhasil",
        description: "Selamat datang di SmartCare Admin",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Kode Akses Salah!",
        description: "Silakan masukkan kode akses yang benar",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border border-border shadow-card">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow mb-4">
            <svg
              className="w-10 h-10 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10V11.5C15.4 11.5 16 12.4 16 13V16C16 17.4 15.4 18 14.8 18H9.2C8.6 18 8 17.4 8 16V13C8 12.4 8.6 11.5 9.2 11.5V10C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.5 8.7 10.5 10V11.5H13.5V10C13.5 8.7 12.8 8.2 12 8.2Z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Admin SmartCare
          </CardTitle>
          <p className="text-muted-foreground">
            Masukkan kode akses untuk melanjutkan
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="accessCode" className="text-sm font-medium text-foreground">
              Kode Akses
            </label>
            <Input
              id="accessCode"
              type="password"
              placeholder="Masukkan kode akses"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              className="bg-secondary border-border"
            />
          </div>
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            Masuk
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;