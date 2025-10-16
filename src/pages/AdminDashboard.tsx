import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Target, Calendar, Store } from "lucide-react";
import Navbar from "@/components/dashboard/Navbar";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeEvents: 0,
    totalCoinsIssued: 0,
    activeChallenges: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    fetchDashboardData(user.id);
  };

  const fetchDashboardData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(profileData);

      // Fetch stats
      const { count: studentsCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: eventsCount } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .gte("event_date", new Date().toISOString());

      const { count: challengesCount } = await supabase
        .from("challenges")
        .select("*", { count: "exact", head: true });

      const { data: coinsData } = await supabase
        .from("profiles")
        .select("coins");

      const totalCoins =
        coinsData?.reduce((sum, p) => sum + p.coins, 0) || 0;

      setStats({
        totalStudents: studentsCount || 0,
        activeEvents: eventsCount || 0,
        totalCoinsIssued: totalCoins,
        activeChallenges: challengesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl glow-text">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen">
      <Navbar
        userName={profile.full_name}
        coins={profile.coins}
        rank={profile.rank}
        isAdmin
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 glow-text">Admin Dashboard</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 glow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-primary">
                  {stats.totalStudents}
                </p>
              </div>
              <Users className="w-12 h-12 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="p-6 glow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Events</p>
                <p className="text-3xl font-bold text-secondary">
                  {stats.activeEvents}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-secondary opacity-50" />
            </div>
          </Card>

          <Card className="p-6 glow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Coins Issued
                </p>
                <p className="text-3xl font-bold text-accent">
                  {stats.totalCoinsIssued}
                </p>
              </div>
              <Store className="w-12 h-12 text-accent opacity-50" />
            </div>
          </Card>

          <Card className="p-6 glow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Challenges
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.activeChallenges}
                </p>
              </div>
              <Target className="w-12 h-12 text-foreground opacity-50" />
            </div>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 glow-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Manage Students
            </h2>
            <p className="text-muted-foreground mb-4">
              View, edit, and manage student profiles, ranks, and coins.
            </p>
            <Button className="w-full glow-border">View Students</Button>
          </Card>

          <Card className="p-6 glow-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Challenges
            </h2>
            <p className="text-muted-foreground mb-4">
              Create and manage challenges with coin and XP rewards.
            </p>
            <Button className="w-full glow-border">Manage Challenges</Button>
          </Card>

          <Card className="p-6 glow-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Events
            </h2>
            <p className="text-muted-foreground mb-4">
              Create, edit, and track GDSC events and RSVPs.
            </p>
            <Button className="w-full glow-border">Manage Events</Button>
          </Card>

          <Card className="p-6 glow-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Shop Inventory
            </h2>
            <p className="text-muted-foreground mb-4">
              Manage shop items, stock, and pricing.
            </p>
            <Button className="w-full glow-border">Manage Shop</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
