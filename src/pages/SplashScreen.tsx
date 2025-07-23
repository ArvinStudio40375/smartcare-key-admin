import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow animate-pulse">
            <svg
              className="w-16 h-16 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" />
            </svg>
          </div>
          <div className="absolute inset-0 w-32 h-32 mx-auto bg-primary rounded-3xl animate-ping opacity-20"></div>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
          SmartCare
        </h1>
        <p className="text-xl text-muted-foreground mb-8">Admin Panel</p>
        
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;