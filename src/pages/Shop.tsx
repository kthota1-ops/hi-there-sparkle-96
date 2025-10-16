import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Coins,
  Package,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  History,
} from "lucide-react";
import Navbar from "@/components/dashboard/Navbar";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Shop = () => {
  const [profile, setProfile] = useState<any>(null);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
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
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(profileData);

      const { data: itemsData } = await supabase
        .from("shop_items")
        .select("*")
        .gt("stock", 0)
        .order("coin_price", { ascending: true });

      setShopItems(itemsData || []);

      const { data: transactionsData } = await supabase
        .from("shop_transactions")
        .select("*, shop_items(name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      setTransactions(transactionsData || []);
    } catch (error) {
      console.error("Error fetching shop data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = (item: any) => {
    setSelectedItem(item);
    setShowConfirm(true);
  };

  const handleRedeem = async () => {
    if (!profile || !selectedItem) return;

    if (profile.coins < selectedItem.coin_price) {
      toast({
        title: "Insufficient Coins 💰",
        description: "Complete more challenges to earn coins!",
        variant: "destructive",
      });
      setShowConfirm(false);
      return;
    }

    try {
      const { error } = await supabase.from("shop_transactions").insert({
        user_id: profile.id,
        item_id: selectedItem.id,
        coins_spent: selectedItem.coin_price,
        status: "completed",
      });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ coins: profile.coins - selectedItem.coin_price })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      const { error: stockError } = await supabase
        .from("shop_items")
        .update({ stock: selectedItem.stock - 1 })
        .eq("id", selectedItem.id);

      if (stockError) throw stockError;

      toast({
        title: "Success! 🎉",
        description: `You've redeemed ${selectedItem.name}!`,
      });

      setShowConfirm(false);
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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl glow-text">Loading shop...</p>
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
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Shop Area */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold glow-text mb-2">
                  GDSC Shop
                </h1>
                <p className="text-muted-foreground">
                  Redeem your coins for exclusive merch and perks
                </p>
              </div>
            </div>

            {shopItems.length === 0 ? (
              <Card className="p-16 text-center glow-card">
                <Package className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Coming Soon!</h2>
                <p className="text-xl text-muted-foreground mb-6">
                  Exciting merch and perks will be available soon.
                </p>
                <p className="text-muted-foreground">
                  Keep earning coins by completing challenges and attending
                  events!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {shopItems.map((item) => {
                  const canAfford = profile.coins >= item.coin_price;
                  return (
                    <Card
                      key={item.id}
                      className="p-6 glow-card hover-lift group relative overflow-hidden"
                    >
                      {!canAfford && (
                        <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-bold z-10">
                          Need {item.coin_price - profile.coins} more
                        </div>
                      )}

                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingBag className="w-20 h-20 text-primary/50" />
                        )}
                      </div>

                      <h3 className="text-lg font-bold mb-2 line-clamp-2">
                        {item.name}
                      </h3>

                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-secondary" />
                          <span className="text-2xl font-bold text-secondary">
                            {item.coin_price}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Stock:{" "}
                          </span>
                          <span className="font-bold">{item.stock}</span>
                        </div>
                      </div>

                      <Button
                        className="w-full glow-border"
                        disabled={!canAfford}
                        onClick={() => handleRedeemClick(item)}
                      >
                        {canAfford ? (
                          <>
                            <Sparkles className="mr-2 w-4 h-4" />
                            Redeem Now
                          </>
                        ) : (
                          "Insufficient Coins"
                        )}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Balance Card */}
            <Card className="p-6 glow-card sticky top-4 bg-gradient-to-br from-secondary/20 to-card">
              <div className="text-center mb-6">
                <Coins className="w-16 h-16 mx-auto mb-4 text-secondary" />
                <p className="text-sm text-muted-foreground mb-2">
                  Your Balance
                </p>
                <p className="text-5xl font-bold glow-text-secondary mb-4">
                  {profile.coins}
                </p>
                <p className="text-xs text-muted-foreground">GDSC Coins</p>
              </div>

              <Button
                variant="outline"
                className="w-full mb-2"
                onClick={() => navigate("/dashboard")}
              >
                <TrendingUp className="mr-2 w-4 h-4" />
                Earn More Coins
              </Button>
            </Card>

            {/* Recent Transactions */}
            <Card className="p-6 glow-card">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Orders
              </h3>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No orders yet
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-3 bg-muted/20 rounded-lg"
                    >
                      <p className="text-sm font-medium line-clamp-1">
                        {transaction.shop_items?.name}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-secondary font-bold">
                          -{transaction.coins_spent} coins
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            transaction.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl glow-text">
              Confirm Redemption
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to redeem this item?
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
                <ShoppingBag className="w-12 h-12 text-primary" />
                <div className="flex-1">
                  <h4 className="font-bold mb-1">{selectedItem.name}</h4>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-secondary" />
                    <span className="text-xl font-bold text-secondary">
                      {selectedItem.coin_price}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Current Balance</span>
                  <span className="font-bold">{profile.coins} coins</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Item Cost</span>
                  <span className="font-bold text-destructive">
                    -{selectedItem.coin_price} coins
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between items-center">
                  <span className="font-bold">New Balance</span>
                  <span className="text-xl font-bold text-secondary">
                    {profile.coins - selectedItem.coin_price} coins
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleRedeem} className="glow-border">
              <Sparkles className="mr-2 w-4 h-4" />
              Confirm Redemption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shop;
