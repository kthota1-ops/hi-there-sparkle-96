import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Chrome, ArrowLeft } from "lucide-react";
import octodevLogo from "@/assets/octodev-logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Welcome to GDSC EMU. Redirecting to your dashboard...",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0C1F3F] via-[#1E4FC2] to-[#0A0D14] opacity-60" />

      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-20"
      >
        <ArrowLeft className="mr-2" />
        Back
      </Button>

      <Card className="w-full max-w-md relative z-10 glass-card p-8 glow-card">
        <div className="flex flex-col items-center mb-8">
          <img
            src={octodevLogo}
            alt="OctoDev Logo"
            className="w-32 h-32 mb-4 drop-shadow-[0_0_40px_rgba(76,131,255,0.6)]"
          />
          <h1 className="text-3xl font-bold glow-text">GDSC EMU</h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Welcome back!" : "Join the community"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="fullName" className="text-foreground">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                className="mt-1 bg-background/50 border-primary/30 focus:border-primary"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 bg-background/50 border-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 bg-background/50 border-primary/30 focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            className="w-full glow-border bg-primary hover:bg-primary/90 text-lg py-6"
            disabled={loading}
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full border-2 border-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04] py-6"
          disabled
        >
          <Chrome className="mr-2" />
          Sign up with Google
        </Button>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline text-sm"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
