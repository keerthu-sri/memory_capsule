import { Clock, Grid2x2, Settings, Share2, Sparkles, Gift, Snowflake } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

interface SidebarProps {
  userName?: string;
  userRole?: string;
}

export const Sidebar = ({ userName = "Julian Vane", userRole = "Premium Member" }: SidebarProps) => {
  const location = useLocation();

  const navItems = [
    { icon: Grid2x2, label: "My Capsules", path: "/dashboard" },
    { icon: Share2, label: "Shared Vaults", path: "/shared" },
    { icon: Clock, label: "Time Archive", path: "/calendarview" },
  ];

  const favorites = [
    { icon: Sparkles, label: "Summer '23", color: "bg-blue-500" },
    { icon: Gift, label: "Paris Journey", color: "bg-emerald-500" },
  ];

  const categories = [
    { icon: Gift, label: "VINTAGE", path: "/dashboard" },
    { icon: Gift, label: "CYBER", path: "/calendarview" },
    { icon: Snowflake, label: "DREAMY", path: "/shared" },
  ];

  return (
    <div className="w-60 min-h-screen bg-[#0a0a1a] border-r border-[#1a1a2e] flex flex-col"> {/* min-h-screen flex-col */}
      {/* Fixed Top Header */}
      <div className="p-6 border-b border-[#1a1a2e] shrink-0"> {/* shrink-0 prevents shrinking */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#7919e6] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-white font-semibold text-lg">Aethera</span>
        </div>
      </div>

      {/* Scrollable Middle Content - flex-1 handles remaining space */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Navigation Section */}
        <div className="mb-8">
          <span className="text-slate-500 text-xs font-medium tracking-wider uppercase px-3 mb-3 block">
            NAVIGATION
          </span>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isActive
                      ? "bg-[#7919e6] text-white"
                      : "text-slate-400 hover:bg-[#ffffff08] hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Favorites Section */}
        <div className="mb-8">
          <span className="text-slate-500 text-xs font-medium tracking-wider uppercase px-3 mb-3 block">
            FAVORITES
          </span>
          <div className="space-y-1">
            {favorites.map((item, index) => {
              return (
                <button
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-[#ffffff08] hover:text-white transition-all w-full"
                >
                  <div className={cn("w-2 h-2 rounded-full", item.color)} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <span className="text-slate-500 text-xs font-medium tracking-wider uppercase px-3 mb-3 block">
            CATEGORIES
          </span>
          <div className="space-y-1">
            {categories.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-[#ffffff08] hover:text-white transition-all w-full"
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Profile - Always Stays at End */}
      <div className="p-4 border-t border-[#1a1a2e] shrink-0"> {/* shrink-0 pins it */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
          <div className="flex-1 min-w-0"> {/* min-w-0 prevents overflow */}
            <div className="text-white text-sm font-medium truncate">{userName}</div> {/* truncate long names */}
            <div className="text-slate-500 text-xs">{userRole}</div>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors p-1">
            <Settings className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
