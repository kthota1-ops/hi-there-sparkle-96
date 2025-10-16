import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Trophy,
  Target,
  Store,
  Zap,
  TrendingUp,
} from "lucide-react";
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
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(profileData);

      const { data: challengesData } = await supabase
        .from("challenges")
        .select("*")
        .limit(3);

      setChallenges(challengesData || []);

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);

      setEvents(eventsData || []);

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

  const handleRSVP = async (eventId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase.from("event_rsvps").insert({
        user_id: profile.id,
        event_id: eventId,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already RSVP'd",
            description: "You've already registered for this event!",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "RSVP Confirmed! 🎉",
          description: "You've successfully registered for the event.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl glow-text">Loading dashboard...</p>
        </div>
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
          <Card className="p-6 glow-card col-span-full lg:col-span-2 bg-gradient-to-br from-card to-card/50">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#FBBC04]" />
              <span className="glow-text">Progress Tracker</span>
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium">XP Progress</span>
                  <span className="text-sm font-bold glow-text">
                    {profile.total_xp} / {nextRankXP} XP
                  </span>
                </div>
                <Progress
                  value={progressPercentage}
                  className="h-4 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {nextRankXP - profile.total_xp} XP until next rank
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30 hover-lift">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-primary animate-fade-in">
                    {profile.total_xp}
                  </p>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/10 border border-secondary/30 hover-lift">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-secondary" />
                  <p className="text-3xl font-bold text-secondary animate-fade-in">
                    {profile.events_attended}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Events Attended
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/30 hover-lift">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-3xl font-bold text-accent capitalize animate-fade-in">
                    {profile.rank}
                  </p>
                  <p className="text-sm text-muted-foreground">Current Rank</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Shop Access */}
          <Card className="p-6 glow-card hover-lift cursor-pointer bg-gradient-to-br from-secondary/20 to-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-secondary" />
              <span className="glow-text-secondary">Shop</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Redeem your coins for exclusive GDSC merch and perks!
            </p>
            <Button
              onClick={() => navigate("/shop")}
              className="w-full glow-border bg-secondary hover:bg-secondary/90 text-background"
            >
              <Zap className="mr-2" />
              Browse Shop
            </Button>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6 glow-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4285F4]" />
              Upcoming Events
            </h2>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No upcoming events
                </p>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-border rounded-lg p-4 hover-lift bg-card/50"
                  >
                    <h3 className="font-medium mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      variant="outline"
                      onClick={() => handleRSVP(event.id)}
                    >
                      RSVP Now
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Current Challenges */}
          <Card className="p-6 glow-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#EA4335]" />
              Active Challenges
            </h2>
            <div className="space-y-3">
              {challenges.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active challenges
                </p>
              ) : (
                challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="border border-border rounded-lg p-4 hover-lift bg-card/50"
                  >
                    <h3 className="font-medium mb-2">{challenge.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary font-bold flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {challenge.coins_reward} Coins
                      </span>
                      <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
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
              <Trophy className="w-5 h-5 text-[#FBBC04]" />
              Top Contributors
            </h2>
            <div className="space-y-2">
              {leaderboard.map((student, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                    student.full_name === profile.full_name
                      ? "bg-primary/20 border border-primary/50 glow-border"
                      : "bg-muted/20 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold text-lg ${
                        index === 0
                          ? "text-[#FBBC04]"
                          : index === 1
                          ? "text-gray-400"
                          : index === 2
                          ? "text-[#CD7F32]"
                          : "text-muted-foreground"
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">
                      {student.full_name}
                    </span>
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
