import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Package } from "lucide-react";
import Navbar from "@/components/dashboard/Navbar";
import { useToast } from "@/hooks/use-toast";

const Shop = () => {
  const [profile, setProfile] = useState<any>(null);
  const [shopItems, setShopItems] = useState<any[]>([]);
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
    fetchShopData(user.id);
  };

  const fetchShopData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(profileData);

      // Fetch shop items
      const { data: itemsData } = await supabase
        .from("shop_items")
        .select("*")
        .gt("stock", 0)
        .order("coin_price", { ascending: true });

      setShopItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching shop data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (item: any) => {
    if (!profile) return;

    if (profile.coins < item.coin_price) {
      toast({
        title: "Insufficient Coins",
        description: "Complete more challenges to earn coins!",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create transaction
      const { error } = await supabase.from("shop_transactions").insert({
        user_id: profile.id,
        item_id: item.id,
        coins_spent: item.coin_price,
        status: "pending",
      });

      if (error) throw error;

      // Update user coins
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ coins: profile.coins - item.coin_price })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      // Update item stock
      const { error: stockError } = await supabase
        .from("shop_items")
        .update({ stock: item.stock - 1 })
        .eq("id", item.id);

      if (stockError) throw stockError;

      toast({
        title: "Item Redeemed!",
        description: `You've successfully redeemed ${item.name}!`,
      });

      // Refresh data
      fetchShopData(profile.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl glow-text">Loading shop...</p>
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
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold glow-text">GDSC Shop</h1>
            <p className="text-muted-foreground mt-2">
              Redeem your coins for exclusive merch and perks
            </p>
          </div>
          <Card className="p-4 glow-card">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-2xl font-bold">{profile.coins} Coins</p>
              </div>
            </div>
          </Card>
        </div>

        {shopItems.length === 0 ? (
          <Card className="p-12 text-center glow-card">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">
              Shop items coming soon!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shopItems.map((item) => {
              const canAfford = profile.coins >= item.coin_price;
              return (
                <Card key={item.id} className="p-6 glow-card">
                  {item.image_url && (
                    <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <Package className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-secondary" />
                      <span className="text-xl font-bold text-secondary">
                        {item.coin_price}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Stock: {item.stock}
                    </span>
                  </div>
                  <Button
                    className="w-full glow-border"
                    disabled={!canAfford}
                    onClick={() => handleRedeem(item)}
                  >
                    {canAfford ? "Redeem" : "Insufficient Coins"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
