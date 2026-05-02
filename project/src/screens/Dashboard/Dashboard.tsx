import { Grid3x3, List, Lock, Plus, Share2, Unlock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "../../components/layout/Layout";
import { PageHeader } from "../../components/layout/PageHeader";
import { cn } from "../../lib/utils";
import { getCapsules, type Capsule } from "../../services/capsule";

const getOwnerId = (value?: string | { _id?: string; id?: string }) => {
  if (!value) return "";
  return typeof value === "string" ? value : value._id || value.id || "";
};

const buildAssetUrl = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) return value;
  return `http://localhost:5000/${value.replace(/\\/g, "/")}`;
};

const getCapsulePreviewImage = (capsule: Capsule) => {
  if (capsule.images?.[0]) return buildAssetUrl(capsule.images[0]);
  const firstPhoto = capsule.memories?.find((memory) => memory.type === "photo" && memory.preview);
  return buildAssetUrl(firstPhoto?.preview);
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [searchParams] = useSearchParams();
  const userId = localStorage.getItem("userId") || "";
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const capsuleResponse = await getCapsules();
        setCapsules(capsuleResponse.data ?? []);
      } catch (error) {
        console.error(error);
      }
    };

    void fetchData();
  }, []);

  const matchesCapsuleQuery = (capsule: Capsule) =>
    !query ||
    capsule.title?.toLowerCase().includes(query) ||
    capsule.message?.toLowerCase().includes(query) ||
    capsule.mood?.toLowerCase().includes(query);

  const personalCapsules = useMemo(
    () => capsules.filter((capsule) => capsule.isPrivate && getOwnerId(capsule.userId) === userId && matchesCapsuleQuery(capsule)),
    [capsules, userId, query]
  );

  const allSharedCapsules = useMemo(
    () =>
      capsules.filter(
        (capsule) =>
          !capsule.isPrivate &&
          capsule.isCollaborative &&
          Boolean(capsule.currentUserRole) &&
          matchesCapsuleQuery(capsule)
      ),
    [capsules, query]
  );

  const recentSharedCapsules = useMemo(
    () =>
      [...allSharedCapsules]
        .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
        .slice(0, 3),
    [allSharedCapsules]
  );

  const upcomingUnlocks = useMemo(
    () => capsules.filter((capsule) => new Date(capsule.unlockDate) > new Date() && !capsule.isUnlocked && matchesCapsuleQuery(capsule)),
    [capsules, query]
  );

  const renderCard = (capsule: Capsule) => {
    const isUnlocked = capsule.isReadyToView || capsule.canViewContent || false;
    const previewImage = isUnlocked ? getCapsulePreviewImage(capsule) : "";
    const hasImage = Boolean(previewImage);

    return (
      <div
        key={capsule._id}
        onClick={() => navigate(`/capsule/${capsule._id}`)}
        className="group relative bg-[#ffffff08] rounded-2xl border border-[#7919e633] overflow-hidden cursor-pointer hover:border-[#7919e6] transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(121,25,230,0.3)] min-h-[220px] flex flex-col"
      >
        {hasImage && (
          <div className="w-full h-32 overflow-hidden border-b border-[#7919e633]">
            <img
              src={previewImage}
              alt={capsule.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        )}
        {!hasImage && (
          <div className="w-full h-32 bg-[#0f172a] flex flex-col items-center justify-center border-b border-[#7919e633]">
            <Lock className="w-8 h-8 text-[#7919e6] mb-2" />
            <span className="text-xs text-[#7919e6] uppercase tracking-widest font-bold">
              {isUnlocked ? "Memory Capsule" : "Encrypted Node"}
            </span>
          </div>
        )}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-white font-semibold text-lg mb-1">{capsule.title}</h3>
          <p className="text-slate-500 text-xs mb-3 font-medium tracking-wide">
            {isUnlocked ? "UNLOCKED" : "UNLOCKS"} • {new Date(capsule.unlockDate).toLocaleDateString()}
          </p>

          <div className="mt-auto">
            {isUnlocked ? (
              <p className="text-slate-300 text-sm line-clamp-2">{capsule.message || "No description."}</p>
            ) : (
              <p className="text-purple-400 text-sm font-medium flex items-center gap-2">
                <Lock className="w-3 h-3" /> Sealed Vault
              </p>
            )}
          </div>

          {capsule.mood && (
            <div className="absolute top-3 right-3 bg-[#0a0a1a]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#7919e6]/30 text-[10px] text-[#d7b8ff] uppercase tracking-wider font-bold shadow-md">
              {capsule.mood}
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
        subtitle={`${capsules.length} Capsules`}
        searchPlaceholder="Search timeline..."
      />

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
            <div className="text-3xl font-black text-white">{allSharedCapsules.length}</div>
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

      <div className="flex justify-end mb-8 py-4">
        <div className="flex gap-2 bg-[#ffffff05] p-1 rounded-xl border border-[#ffffff10]">
          <button
            onClick={() => setViewMode("grid")}
            className={cn("p-2 rounded-lg transition-colors", viewMode === "grid" ? "bg-[#7919e6] text-white" : "text-slate-400")}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn("p-2 rounded-lg transition-colors", viewMode === "list" ? "bg-[#7919e6] text-white" : "text-slate-400")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-16">
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-purple-500 rounded-full inline-block shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            Personal Vaults
          </h2>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
            <button
              onClick={() => navigate("/createcapsule")}
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

        {recentSharedCapsules.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-2 h-8 bg-orange-500 rounded-full inline-block shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                Recent Shared Vaults
              </h2>
              <button onClick={() => navigate("/shared")} className="text-sm text-[#d7b8ff] hover:text-white">
                View all shared vaults
              </button>
            </div>
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {recentSharedCapsules.map(renderCard)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

