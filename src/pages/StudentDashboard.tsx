import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Trophy, Target, Store } from "lucide-react";
import Navbar from "@/components/dashboard/Navbar";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
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

      // Fetch challenges
      const { data: challengesData } = await supabase
        .from("challenges")
        .select("*")
        .limit(3);

      setChallenges(challengesData || []);

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);

      setEvents(eventsData || []);

      // Fetch leaderboard
      const { data: leaderboardData } = await supabase
        .from("profiles")
        .select("full_name, coins, rank")
        .order("coins", { ascending: false })
        .limit(5);

      setLeaderboard(leaderboardData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNextRankXP = (rank: string) => {
    const thresholds = {
      bronze: 1000,
      silver: 2500,
      gold: 5000,
      platinum: 10000,
      diamond: 20000,
    };
    return thresholds[rank as keyof typeof thresholds] || 1000;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl glow-text">Loading dashboard...</p>
      </div>
    );
  }

  if (!profile) return null;

  const nextRankXP = getNextRankXP(profile.rank);
  const progressPercentage = (profile.total_xp / nextRankXP) * 100;

  return (
    <div className="min-h-screen">
      <Navbar
        userName={profile.full_name}
        coins={profile.coins}
        rank={profile.rank}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Progress Tracker */}
          <Card className="p-6 glow-card col-span-full lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-secondary" />
              Progress Tracker
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">XP Progress</span>
                  <span className="text-sm font-bold">
                    {profile.total_xp} / {nextRankXP} XP
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {profile.total_xp}
                  </p>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-secondary">
                    {profile.events_attended}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Events Attended
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent capitalize">
                    {profile.rank}
                  </p>
                  <p className="text-sm text-muted-foreground">Current Rank</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Shop Access */}
          <Card className="p-6 glow-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Shop
            </h2>
            <p className="text-muted-foreground mb-4">
              Redeem your coins for exclusive GDSC merch and perks!
            </p>
            <Button
              onClick={() => navigate("/shop")}
              className="w-full glow-border"
            >
              Browse Shop
            </Button>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6 glow-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Events
            </h2>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-muted-foreground">No upcoming events</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-border rounded-lg p-3"
                  >
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>
                    <Button size="sm" className="mt-2 w-full" variant="outline">
                      RSVP
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Current Challenges */}
          <Card className="p-6 glow-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Current Challenges
            </h2>
            <div className="space-y-3">
              {challenges.length === 0 ? (
                <p className="text-muted-foreground">No active challenges</p>
              ) : (
                challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="border border-border rounded-lg p-3"
                  >
                    <h3 className="font-medium">{challenge.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-secondary font-bold">
                        {challenge.coins_reward} Coins
                      </span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Leaderboard */}
          <Card className="p-6 glow-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Leaderboard
            </h2>
            <div className="space-y-2">
              {leaderboard.map((student, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 rounded bg-muted/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">#{index + 1}</span>
                    <span className="text-sm">{student.full_name}</span>
                  </div>
                  <span className="font-bold text-secondary">
                    {student.coins}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
