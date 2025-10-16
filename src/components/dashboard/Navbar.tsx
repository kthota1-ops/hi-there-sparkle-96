import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coins, LogOut, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import octodevLogo from "@/assets/octodev-logo.png";

interface NavbarProps {
  userName: string;
  coins: number;
  rank: string;
  isAdmin?: boolean;
}

const Navbar = ({ userName, coins, rank, isAdmin }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "See you soon!",
    });
    navigate("/auth");
  };

  const getRankColor = (rank: string) => {
    const colors = {
      bronze: "text-orange-600",
      silver: "text-gray-400",
      gold: "text-yellow-400",
      platinum: "text-cyan-400",
      diamond: "text-purple-400",
    };
    return colors[rank.toLowerCase() as keyof typeof colors] || "text-gray-400";
  };

  return (
    <nav className="bg-card border-b border-border glow-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={octodevLogo} alt="OctoDev" className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold glow-text">GDSC EMU</h1>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? "Admin Dashboard" : "Student Dashboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full glow-border">
              <Coins className="w-5 h-5 text-secondary" />
              <span className="font-bold">{coins}</span>
            </div>

            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getRankColor(
                rank
              )}`}
            >
              <Award className="w-5 h-5" />
              <span className="font-bold capitalize">{rank}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{userName}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-destructive/20"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
