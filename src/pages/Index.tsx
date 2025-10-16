import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import octodevLogo from "@/assets/octodev-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-12 text-center glow-card">
        <img
          src={octodevLogo}
          alt="OctoDev Logo"
          className="w-48 h-48 mx-auto mb-8 animate-fade-in"
        />
        <h1 className="text-5xl font-bold mb-4 glow-text">
          Welcome to GDSC EMU
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Google Developer Student Club
        </p>
        <p className="text-lg text-muted-foreground mb-8">
          Eastern Michigan University
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="glow-border text-lg"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/shop")}
            className="text-lg"
          >
            View Shop
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;
