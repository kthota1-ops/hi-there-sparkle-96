import { Users, Target, Calendar, Store, Coins, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "challenges", label: "Challenges", icon: Target },
    { id: "events", label: "Events", icon: Calendar },
    { id: "shop", label: "Shop", icon: Store },
    { id: "coins", label: "Coin Logs", icon: Coins },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border glow-border min-h-[calc(100vh-76px)]">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              activeTab === item.id
                ? "bg-primary text-primary-foreground glow-border"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
