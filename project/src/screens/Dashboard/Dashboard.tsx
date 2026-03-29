import { Lock, Plus, Grid3x3, List, Share2, Unlock } from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import { useState, useEffect, useMemo } from "react";
import { cn } from "../../lib/utils";
import { PageHeader } from "../../components/layout/PageHeader";
import { useNavigate } from "react-router-dom";
import { getMemories } from "../../services/memory";
import API from "../../api";

export const Dashboard = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);

  const [memories, setMemories] = useState<any[]>([]);
  const [capsules, setCapsules] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const memRes = await getMemories();
        setMemories(memRes.data ?? []);

        const capRes = await API.get("/capsules");
        setCapsules(capRes.data ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleNewCapsule = () => {
    navigate("/createcapsule");
  };

  const moods = ["Happy", "Nostalgic", "Adventurous", "Calm"];

  const filteredMemories = useMemo(() => {
    if (!moodFilter) return memories;
    return memories.filter(m => m.mood?.toLowerCase() === moodFilter.toLowerCase() || m.text?.toLowerCase().includes(moodFilter.toLowerCase()));
  }, [memories, moodFilter]);

  const personalCapsules = capsules.filter(c => c.isPrivate);
  const sharedCapsules = capsules.filter(c => !c.isPrivate);
  const upcomingUnlocks = capsules.filter(c => new Date(c.unlockDate) > new Date() && !c.isUnlocked);

  const renderCard = (c: any) => {
    const isUnlocked = new Date() >= new Date(c.unlockDate) || c.isUnlocked;
    const hasImage = c.images && c.images.length > 0;
    
    return (
      <div
        key={c._id}
        onClick={() => navigate(`/capsule/${c._id}`)}
        className="group relative bg-[#ffffff08] rounded-2xl border border-[#7919e633] overflow-hidden cursor-pointer hover:border-[#7919e6] transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(121,25,230,0.3)] min-h-[220px] flex flex-col"
      >
        {hasImage && isUnlocked && (
          <div className="w-full h-32 overflow-hidden border-b border-[#7919e633]">
             <img src={`http://localhost:5000/${c.images[0].replace(/\\/g, '/')}`} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}
        {!isUnlocked && (
          <div className="w-full h-32 bg-[#0f172a] flex flex-col items-center justify-center border-b border-[#7919e633]">
             <Lock className="w-8 h-8 text-[#7919e6] mb-2" />
             <span className="text-xs text-[#7919e6] uppercase tracking-widest font-bold">Encrypted Node</span>
          </div>
        )}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-white font-semibold text-lg mb-1">{c.title}</h3>
          <p className="text-slate-500 text-xs mb-3 font-medium tracking-wide">
            {isUnlocked ? "UNLOCKED" : "UNLOCKS"} • {new Date(c.unlockDate).toLocaleDateString()}
          </p>

          <div className="mt-auto">
            {isUnlocked ? (
               <p className="text-slate-300 text-sm line-clamp-2">{c.message || "No description."}</p>
            ) : (
               <p className="text-purple-400 text-sm font-medium flex items-center gap-2">
                 <Lock className="w-3 h-3" /> Sealed Vault
               </p>
            )}
          </div>
          
          {c.mood && (
            <div className="absolute top-3 right-3 bg-[#0a0a1a]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#7919e6]/30 text-[10px] text-[#d7b8ff] uppercase tracking-wider font-bold shadow-md">
               {c.mood}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <PageHeader
        title="Personal Gallery"
        subtitle={`${memories.length} Memories • ${capsules.length} Capsules`}
        searchPlaceholder="Search timeline..."
      />

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <div className="bg-[#ffffff05] backdrop-blur-md rounded-2xl p-6 border border-[#ffffff10] flex items-center gap-6 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-blue-500/20 transition-all" />
           <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 z-10">
             <Grid3x3 className="w-6 h-6 text-blue-400" />
           </div>
           <div className="z-10">
             <div className="text-3xl font-black text-white">{capsules.length}</div>
             <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Total Vaults</div>
           </div>
        </div>
        <div className="bg-[#ffffff05] backdrop-blur-md rounded-2xl p-6 border border-[#ffffff10] flex items-center gap-6 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-purple-500/20 transition-all" />
           <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 z-10">
             <Lock className="w-6 h-6 text-purple-400" />
           </div>
           <div className="z-10">
             <div className="text-3xl font-black text-white">{personalCapsules.length}</div>
             <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Private Hubs</div>
           </div>
        </div>
        <div className="bg-[#ffffff05] backdrop-blur-md rounded-2xl p-6 border border-[#ffffff10] flex items-center gap-6 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-orange-500/20 transition-all" />
           <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 z-10">
             <Share2 className="w-6 h-6 text-orange-400" />
           </div>
           <div className="z-10">
             <div className="text-3xl font-black text-white">{sharedCapsules.length}</div>
             <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Shared Nodes</div>
           </div>
        </div>
        <div className="bg-[#ffffff05] backdrop-blur-md rounded-2xl p-6 border border-[#ffffff10] flex items-center gap-6 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-green-500/20 transition-all" />
           <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 z-10">
             <Unlock className="w-6 h-6 text-green-400" />
           </div>
           <div className="z-10">
             <div className="text-3xl font-black text-white">{upcomingUnlocks.length}</div>
             <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Upcoming</div>
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8 py-4">
        {moods.map((mood) => (
          <button
            key={mood}
            onClick={() => setMoodFilter(moodFilter === mood ? null : mood)}
            className={cn(
              "px-6 py-2 rounded-full text-sm transition-all font-medium",
              moodFilter === mood
                ? "bg-[#7919e6] text-white shadow-[0_0_15px_rgba(121,25,230,0.5)] border border-[#7919e6]"
                : "bg-[#ffffff08] text-slate-400 hover:text-white hover:bg-[#ffffff12] border border-[#ffffff10]"
            )}
          >
            {mood}
          </button>
        ))}

        <div className="ml-auto flex gap-2 bg-[#ffffff05] p-1 rounded-xl border border-[#ffffff10]">
          <button onClick={() => setViewMode("grid")} className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? "bg-[#7919e6] text-white" : "text-slate-400")}>
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-[#7919e6] text-white" : "text-slate-400")}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-16">
        {/* PERSONAL VAULTS */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-purple-500 rounded-full inline-block shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            Personal Vaults
          </h2>
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
            {/* ➕ NEW CAPSULE TILE */}
            <button
              onClick={handleNewCapsule}
              className="aspect-square lg:aspect-auto bg-[#ffffff05] rounded-2xl border-2 border-dashed border-[#33415580] hover:border-[#7919e6] hover:bg-[#ffffff0a] transition-all flex flex-col items-center justify-center gap-4 min-h-[220px] group"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#7919e6]/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#7919e6] shadow-[0_0_15px_rgba(121,25,230,0.3)] transition-all">
                <Plus className="w-8 h-8 text-[#d7b8ff] group-hover:text-white" />
              </div>
              <div className="text-white font-medium tracking-wide">Create New Vault</div>
            </button>
            {personalCapsules.map(renderCard)}
          </div>
        </section>

        {/* SHARED VAULTS */}
        {sharedCapsules.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-orange-500 rounded-full inline-block shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
              Shared Vaults
            </h2>
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
              {sharedCapsules.map(renderCard)}
            </div>
          </section>
        )}

        {/* MEMORIES POOL */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-blue-500 rounded-full inline-block shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            Memory Stream Snapshots
          </h2>
          {filteredMemories.length === 0 ? (
             <div className="text-slate-500 italic p-8 bg-[#ffffff03] rounded-2xl border border-dashed border-[#ffffff10] text-center">
               No standalone memories found for this filter.
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredMemories.map((m: any) => (
                  <div key={m._id} className="bg-[#ffffff08] p-6 rounded-2xl border border-[#ffffff10] hover:border-blue-500/50 transition-colors group relative cursor-pointer" onClick={() => navigate('/timeline')}>
                    {m.mood && (
                      <span className="absolute top-4 right-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest">{m.mood}</span>
                    )}
                    <p className="text-slate-200 leading-relaxed font-medium mb-4 pr-12">{m.text}</p>
                    <span className="text-xs text-slate-500 tracking-wider uppercase font-semibold">{new Date(m.createdAt || m.date).toLocaleString()}</span>
                  </div>
                ))}
             </div>
          )}
        </section>
      </div>
    </Layout>
  );
};