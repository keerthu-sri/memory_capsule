import { useEffect, useState } from "react";
import { Layout } from "../../components/layout/Layout";
import { Plus, Settings, TrendingUp, Heart, Droplet, Zap } from "lucide-react";
import { getMemories } from "../../services/memory";
import { getCapsules } from "../../services/capsule";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

export const Timeline = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState("DAWN");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [memRes, capRes] = await Promise.all([
          getMemories(),
          getCapsules()
        ]);
        
        const memoriesData = (memRes.data || []).map((m: any) => ({
          ...m,
          type: "memory",
          displayDate: new Date(m.createdAt || m.date),
          title: m.text?.substring(0, 20) || "Memory"
        }));
        
        const capsulesData = (capRes.data || []).map((c: any) => ({
          ...c,
          type: "capsule",
          displayDate: new Date(c.unlockDate || c.createdAt)
        }));

        const combined = [...memoriesData, ...capsulesData].sort(
          (a, b) => a.displayDate.getTime() - b.displayDate.getTime()
        );
        
        setItems(combined);
      } catch (err) {
        console.error("Failed to load timeline", err);
      }
    };
    fetchAll();
  }, []);

  const getGlowColor = (mood?: string) => {
    mood = mood?.toLowerCase();
    if (mood === "calm" || mood === "nostalgic") return "shadow-[0_0_40px_rgba(34,211,238,0.4)] border-cyan-400";
    if (mood === "joyful" || mood === "happy") return "shadow-[0_0_40px_rgba(244,114,182,0.4)] border-pink-400";
    if (mood === "energetic") return "shadow-[0_0_40px_rgba(250,204,21,0.4)] border-yellow-400";
    return "shadow-[0_0_40px_rgba(126,34,206,0.4)] border-purple-400";
  };

  return (
    <Layout>
      {/* Top Time Filter */}
      <div className="flex justify-center w-full mb-16 relative z-10">
        <div className="bg-[#ffffff08] rounded-full p-1 border border-[#33415540] flex items-center backdrop-blur-md">
          {["DAWN", "DAY", "DUSK"].map((time) => (
            <button
              key={time}
              onClick={() => setTimeFilter(time)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-semibold tracking-[2px] transition-all",
                timeFilter === time
                  ? "bg-[#d97736] text-white shadow-[0_0_15px_rgba(217,119,54,0.5)]"
                  : "text-slate-400 hover:text-white bg-transparent"
              )}
            >
              • {time}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        
        {/* Horizontal Line connecting items */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#ffffff20] to-transparent transform -translate-y-1/2 z-0" />

        {/* Floating Left Side Mood Filter */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center bg-[#ffffff05] rounded-3xl p-3 border border-[#ffffff10] backdrop-blur-md z-20">
          <div className="writing-vertical-lr text-[10px] text-slate-500 tracking-[3px] mb-6 transform -rotate-180">
            MOODS
          </div>
          <div className="flex flex-col gap-4">
            <button className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-[0_0_15px_rgba(244,114,182,0.5)] overflow-hidden">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </button>
            <button className="w-10 h-10 rounded-full border border-cyan-500/50 flex items-center justify-center hover:bg-cyan-500/20 transition-all">
              <Droplet className="w-4 h-4 text-cyan-400" fill="currentColor" />
            </button>
            <button className="w-10 h-10 rounded-full border border-orange-500/50 flex items-center justify-center hover:bg-orange-500/20 transition-all">
              <Zap className="w-4 h-4 text-orange-400" fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Horizontal Stream Container */}
        <div className="w-full max-w-5xl flex items-center justify-start gap-16 relative z-10 overflow-x-auto pb-12 pt-8 snap-x px-12 custom-scrollbar">
          
          {items.map((item, idx) => {
            const isUnlocked = item.type === 'memory' || new Date() >= new Date(item.unlockDate || item.displayDate) || item.isUnlocked;

            return (
              <div key={idx} className="flex flex-col items-center snap-center relative shrink-0">
                <div 
                  onClick={() => navigate(item.type === 'capsule' ? `/capsule/${item._id}` : "#")}
                  className={cn(
                    "w-48 h-48 rounded-full border-[3px] overflow-hidden relative cursor-pointer group bg-slate-900 flex items-center justify-center",
                    getGlowColor(item.mood || (idx % 2 === 0 ? 'calm' : 'joyful'))
                  )}
                >
                  {item.images?.length > 0 && isUnlocked ? (
                    <img src={`http://localhost:5000/${item.images[0].replace(/\\/g, '/')}`} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                      <span className="text-white text-xs text-center px-4 opacity-50">
                        {item.type === 'capsule' && !isUnlocked ? "Locked Node" : (item.message || item.text || "No Image")}
                      </span>
                    </div>
                  )}
                  
                  {/* Internal gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                
                <div className="mt-6 flex flex-col items-center text-center">
                  <span className={cn(
                     "text-[10px] uppercase tracking-[2px] font-bold mb-1",
                     item.mood?.toLowerCase() === 'calm' ? "text-cyan-400" : "text-pink-400"
                  )}>
                    {item.mood || (idx % 2 === 0 ? "CALM" : "JOYFUL")}
                  </span>
                  <span className="text-xs text-slate-400 font-medium tracking-widest mb-1">
                    {item.displayDate.toLocaleDateString("en-US", { month: "short", year: "numeric", day: "numeric" }).toUpperCase()}
                  </span>
                  <span className="text-white/90 font-medium text-sm truncate max-w-[150px]">
                    {item.title}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Current Live Node */}
          <div className="flex flex-col items-center snap-center shrink-0 ml-8">
            <div className="w-64 h-64 rounded-full border border-slate-700 bg-gradient-to-b from-[#1a1c29] to-[#0f111a] flex flex-col items-center justify-center shadow-2xl relative">
              <span className="text-[10px] text-slate-400 tracking-[3px] uppercase mb-4">Memory Stream</span>
              <span className="text-3xl font-bold text-white tracking-widest mb-4">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}
              </span>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              </div>
              
              <div className="absolute -bottom-16">
                <button className="px-6 py-2 rounded-full border border-slate-700 bg-[#ffffff05] backdrop-blur-sm text-xs text-slate-400 tracking-widest hover:text-white hover:border-slate-500 transition-all cursor-default">
                  RECORDING LIVE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Right Side Tools */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20">
          <button 
             onClick={() => navigate("/createcapsule")}
             className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </button>
          <button className="w-12 h-12 rounded-full bg-[#ffffff08] border border-[#ffffff10] flex items-center justify-center backdrop-blur-md hover:bg-[#ffffff15] transition-all">
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </button>
          <button className="w-12 h-12 rounded-full bg-[#ffffff08] border border-[#ffffff10] flex items-center justify-center backdrop-blur-md hover:bg-[#ffffff15] transition-all">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>

      </div>

      {/* Bottom Stats & Shared Vaults Preview */}
      <div className="flex justify-between items-end mt-12 w-full px-8 relative z-10">
        <div className="flex gap-12 bg-[#ffffff05] backdrop-blur-sm p-6 rounded-3xl border border-[#ffffff0a]">
          <div className="flex flex-col">
            <span className="text-[10px] text-pink-500 font-bold tracking-[2px] uppercase mb-2">Collection</span>
            <span className="text-2xl font-bold text-white">{items.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-500 font-bold tracking-[2px] uppercase mb-2">Sealed</span>
            <span className="text-2xl font-bold text-white">{items.filter(i => i.type === 'capsule' && new Date() < new Date(i.unlockDate) && !i.isUnlocked).length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-orange-500 font-bold tracking-[2px] uppercase mb-2">Echoes (Memories)</span>
            <span className="text-2xl font-bold text-white">{items.filter(i => i.type === 'memory').length}</span>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/shared')}
          className="flex items-center gap-4 bg-[#ffffff05] backdrop-blur-sm px-6 py-4 rounded-full border border-[#ffffff0a] cursor-pointer hover:bg-[#ffffff10] transition-all"
        >
           <div className="flex -space-x-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-[#2a2b36]" />
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 border border-[#2a2b36]" />
             <div className="w-8 h-8 rounded-full bg-[#3d3f4a] flex items-center justify-center border border-[#2a2b36] z-10">
               <span className="text-[10px] text-white font-medium pl-1">{items.filter(i => i.type === 'capsule' && !i.isPrivate).length}</span>
             </div>
           </div>
           <span className="text-[10px] text-slate-400 tracking-widest font-semibold uppercase ml-2">Shared Vaults Overview</span>
        </div>
      </div>
      
    </Layout>
  );
};
