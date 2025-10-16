import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Trophy,
  Rocket,
  Brain,
  Coins,
  Code,
  Calendar,
  Award,
  ArrowRight,
  Zap,
} from "lucide-react";
import octodevLogo from "@/assets/octodev-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Code,
      title: "Weekly Coding Competitions",
      description: "Test your skills in exciting challenges",
      color: "text-[#4285F4]",
    },
    {
      icon: Rocket,
      title: "Hackathons & Real Projects",
      description: "Build products that matter",
      color: "text-[#EA4335]",
    },
    {
      icon: Brain,
      title: "Mentorship & Learning",
      description: "Learn from industry experts",
      color: "text-[#FBBC04]",
    },
    {
      icon: Coins,
      title: "Earn GDSC Coins",
      description: "Unlock rewards & exclusive merch",
      color: "text-[#34A853]",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1F3F] via-[#1E4FC2] to-[#4C83FF] opacity-50 animate-pulse" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <img
            src={octodevLogo}
            alt="OctoDev"
            className="w-64 h-64 mx-auto mb-8 drop-shadow-[0_0_60px_rgba(76,131,255,0.8)] animate-fade-in"
          />
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 glow-text">
            Learn. Build. Ship. Together.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Join the GDSC community at Eastern Michigan University — where students
            create real projects, compete in hackathons, and level up their
            developer journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 glow-border bg-primary hover:bg-primary/90"
            >
              Join the Club <ArrowRight className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("events")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-lg px-8 py-6 border-2"
            >
              View Events
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 glow-text">
            Why Join GDSC EMU?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-8 glow-card hover-lift cursor-pointer bg-card/80 backdrop-blur"
              >
                <feature.icon
                  className={`w-12 h-12 mb-4 ${feature.color}`}
                />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rank & Coins Section */}
      <section className="py-24 bg-gradient-to-br from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 glow-text">
              Level Up Your Journey
            </h2>
            
            <Card className="p-12 glow-card glass-card">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="space-y-3">
                  <Trophy className="w-16 h-16 mx-auto text-[#FBBC04]" />
                  <h3 className="text-2xl font-bold">Complete Challenges</h3>
                  <p className="text-muted-foreground">
                    Tackle coding problems and earn XP
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Coins className="w-16 h-16 mx-auto text-[#00FF9C]" />
                  <h3 className="text-2xl font-bold">Earn GDSC Coins</h3>
                  <p className="text-muted-foreground">
                    Get rewarded for every achievement
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Award className="w-16 h-16 mx-auto text-[#4C83FF]" />
                  <h3 className="text-2xl font-bold">Unlock Ranks</h3>
                  <p className="text-muted-foreground">
                    Bronze → Silver → Gold → Platinum → Diamond
                  </p>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/shop")}
                  className="glow-border"
                >
                  <Zap className="mr-2" />
                  Redeem Rewards in Shop
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section id="events" className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 glow-text">
            Upcoming Events
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 glow-card hover-lift">
                <Calendar className="w-8 h-8 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">
                  Workshop {i}: Cloud Development
                </h3>
                <p className="text-muted-foreground mb-4">
                  Learn to build scalable apps with Google Cloud Platform
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary font-bold">
                    +50 Coins
                  </span>
                  <Button size="sm" variant="outline">
                    RSVP
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              variant="outline"
              className="border-2"
            >
              Login to See All Events
            </Button>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4C83FF] to-[#00FF9C] opacity-10" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <img
              src={octodevLogo}
              alt="OctoDev"
              className="w-48 h-48 mx-auto mb-8 opacity-30"
            />
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Become part of EMU's most innovative student community.
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12">
              Join 500+ students learning, building, and shipping together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6 glow-border bg-gradient-to-r from-[#4285F4] to-[#34A853]"
              >
                Join Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6 border-2 border-white/50"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
