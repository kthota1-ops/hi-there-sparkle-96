import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, Target, Calendar, Store, TrendingUp, Activity } from "lucide-react";
import Navbar from "@/components/dashboard/Navbar";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
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
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(profileData);

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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl glow-text">Loading admin dashboard...</p>
        </div>
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

      <div className="flex">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold glow-text mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your GDSC community and track engagement
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 glow-card hover-lift bg-gradient-to-br from-[#4285F4]/20 to-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Students
                  </p>
                  <p className="text-4xl font-bold glow-text">
                    {stats.totalStudents}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Active members
                  </p>
                </div>
                <Users className="w-16 h-16 text-[#4285F4] opacity-50" />
              </div>
            </Card>

            <Card className="p-6 glow-card hover-lift bg-gradient-to-br from-[#34A853]/20 to-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Active Events
                  </p>
                  <p className="text-4xl font-bold glow-text">
                    {stats.activeEvents}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Upcoming
                  </p>
                </div>
                <Calendar className="w-16 h-16 text-[#34A853] opacity-50" />
              </div>
            </Card>

            <Card className="p-6 glow-card hover-lift bg-gradient-to-br from-[#FBBC04]/20 to-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Coins Issued
                  </p>
                  <p className="text-4xl font-bold glow-text">
                    {stats.totalCoinsIssued}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    In circulation
                  </p>
                </div>
                <Store className="w-16 h-16 text-[#FBBC04] opacity-50" />
              </div>
            </Card>

            <Card className="p-6 glow-card hover-lift bg-gradient-to-br from-[#EA4335]/20 to-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Challenges
                  </p>
                  <p className="text-4xl font-bold glow-text">
                    {stats.activeChallenges}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Available
                  </p>
                </div>
                <Target className="w-16 h-16 text-[#EA4335] opacity-50" />
              </div>
            </Card>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 glow-card hover-lift">
              <Users className="w-12 h-12 mb-4 text-[#4285F4]" />
              <h3 className="text-xl font-bold mb-3">Manage Students</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                View profiles, edit ranks, adjust coin balances, and track student progress.
              </p>
              <div className="text-sm text-muted-foreground">
                Coming soon in Cloud dashboard
              </div>
            </Card>

            <Card className="p-6 glow-card hover-lift">
              <Target className="w-12 h-12 mb-4 text-[#EA4335]" />
              <h3 className="text-xl font-bold mb-3">Challenges</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Create coding challenges with custom coin and XP rewards.
              </p>
              <div className="text-sm text-muted-foreground">
                Coming soon in Cloud dashboard
              </div>
            </Card>

            <Card className="p-6 glow-card hover-lift">
              <Calendar className="w-12 h-12 mb-4 text-[#34A853]" />
              <h3 className="text-xl font-bold mb-3">Events</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Organize workshops, hackathons, and track RSVPs.
              </p>
              <div className="text-sm text-muted-foreground">
                Coming soon in Cloud dashboard
              </div>
            </Card>

            <Card className="p-6 glow-card hover-lift">
              <Store className="w-12 h-12 mb-4 text-[#FBBC04]" />
              <h3 className="text-xl font-bold mb-3">Shop Inventory</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Manage merch items, pricing, and stock levels.
              </p>
              <div className="text-sm text-muted-foreground">
                Coming soon in Cloud dashboard
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
