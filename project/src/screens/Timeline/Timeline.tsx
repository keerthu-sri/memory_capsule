import { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/layout/Layout";
import { Plus, Settings, TrendingUp, Heart, Droplet, Zap, Clock3, Lock } from "lucide-react";
import { getMemories } from "../../services/memory";
import { getCapsules } from "../../services/capsule";
import { cn } from "../../lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";

const buildAssetUrl = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${import.meta.env.VITE_API_URL}/${value.replace(/\\/g, "/")}`;
};

export const Timeline = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState("DAWN");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [memRes, capRes] = await Promise.all([getMemories(), getCapsules()]);

        const memoriesData = (memRes.data || []).map((m: any) => ({
          ...m,
          type: "memory",
          displayDate: new Date(m.createdAt || m.date),
          title: m.text?.substring(0, 36) || "Memory",
        }));

        const capsulesData = (capRes.data || []).map((c: any) => ({
          ...c,
          type: "capsule",
          displayDate: new Date(c.unlockDate || c.createdAt),
          title: c.title || "Capsule",
        }));

        const combined = [...memoriesData, ...capsulesData].sort(
          (a, b) => a.displayDate.getTime() - b.displayDate.getTime()
        );

        setItems(combined);
      } catch (err) {
        console.error("Failed to load timeline", err);
      }
    };

    void fetchAll();
  }, []);

  const getGlowColor = (mood?: string) => {
    const normalized = mood?.toLowerCase();
    if (normalized === "calm" || normalized === "nostalgic") return "shadow-[0_0_40px_rgba(34,211,238,0.35)] border-cyan-400";
    if (normalized === "joyful" || normalized === "happy") return "shadow-[0_0_40px_rgba(244,114,182,0.35)] border-pink-400";
    if (normalized === "energetic" || normalized === "adventurous") return "shadow-[0_0_40px_rgba(250,204,21,0.35)] border-amber-400";
    return "shadow-[0_0_40px_rgba(126,34,206,0.35)] border-purple-400";
  };

  const moodButtonClass = (mood: string | null, activeClass: string) =>
    cn(
      "flex h-10 w-10 items-center justify-center rounded-full border transition-all",
      moodFilter === mood ? activeClass : "border-white/10 bg-[#ffffff05]"
    );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const hour = item.displayDate.getHours();
      const matchesTime =
        timeFilter === "DAWN" ? hour < 12 : timeFilter === "DAY" ? hour >= 12 && hour < 18 : hour >= 18;
      const matchesMood = !moodFilter || item.mood?.toLowerCase() === moodFilter;
      const matchesQuery =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.text?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query) ||
        item.mood?.toLowerCase().includes(query);

      return matchesTime && matchesMood && matchesQuery;
    });
  }, [items, moodFilter, query, timeFilter]);

  return (
    <Layout>
      <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.35em] text-[#d7b8ff]">Memory Stream</div>
          <h1 className="text-5xl font-bold tracking-tight text-white">Your capsule timeline</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            A softer zig-zag journey through sealed vaults and released moments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-full border border-[#33415540] bg-[#ffffff08] p-1 backdrop-blur-md">
            {["DAWN", "DAY", "DUSK"].map((time) => (
              <button
                key={time}
                onClick={() => setTimeFilter(time)}
                className={cn(
                  "rounded-full px-6 py-2 text-xs font-semibold tracking-[2px] transition-all",
                  timeFilter === time
                    ? "bg-[#d97736] text-white shadow-[0_0_15px_rgba(217,119,54,0.5)]"
                    : "bg-transparent text-slate-400 hover:text-white"
                )}
              >
                � {time}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#ffffff05] px-3 py-2 backdrop-blur-md">
            <button className={moodButtonClass("happy", "border-pink-500/40 bg-pink-500/20")} onClick={() => setMoodFilter((current) => current === "happy" ? null : "happy")}>
              <Heart className="h-4 w-4 text-pink-300" fill="currentColor" />
            </button>
            <button className={moodButtonClass("nostalgic", "border-cyan-500/40 bg-cyan-500/20")} onClick={() => setMoodFilter((current) => current === "nostalgic" ? null : "nostalgic")}>
              <Droplet className="h-4 w-4 text-cyan-300" fill="currentColor" />
            </button>
            <button className={moodButtonClass("adventurous", "border-amber-500/40 bg-amber-500/20")} onClick={() => setMoodFilter((current) => current === "adventurous" ? null : "adventurous")}>
              <Zap className="h-4 w-4 text-amber-300" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,16,45,0.92),rgba(11,10,26,0.95))] px-6 py-10 shadow-[0_30px_90px_rgba(76,29,149,0.18)] sm:px-10">
          <div className="absolute bottom-10 left-1/2 top-10 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent md:block" />

          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.04] p-10 text-center text-slate-400">
              No timeline moments match this search or mood filter yet.
            </div>
          ) : (
            <div className="space-y-12">
              {filteredItems.map((item, idx) => {
                const isLeft = idx % 2 === 0;
                const isUnlocked =
                  item.type === "memory" ||
                  new Date() >= new Date(item.unlockDate || item.displayDate) ||
                  item.isUnlocked ||
                  item.canViewContent;
                const previewImage = isUnlocked && item.images?.[0] ? buildAssetUrl(item.images[0]) : "";

                return (
                  <div
                    key={`${item.type}-${item._id}-${idx}`}
                    className={cn("relative grid items-center gap-6 md:grid-cols-2", !isLeft && "md:[&>*:first-child]:order-2")}
                  >
                    <div className={cn("flex", isLeft ? "md:justify-end" : "md:justify-start")}>
                      <div
                        onClick={() => item.type === "capsule" && navigate(`/capsule/${item._id}`)}
                        className={cn(
                          "group relative w-full max-w-md cursor-pointer overflow-hidden rounded-[28px] border bg-white/[0.04] p-5 backdrop-blur-md transition-all hover:-translate-y-1",
                          getGlowColor(item.mood)
                        )}
                      >
                        <div className="flex items-start gap-5">
                          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[26px] border border-white/10 bg-[#120f22]">
                            {previewImage ? (
                              <img
                                src={previewImage}
                                alt={item.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#261a44] to-[#110d1f] text-center text-[11px] uppercase tracking-[0.25em] text-slate-400">
                                {item.type === "capsule" && !isUnlocked ? <Lock className="h-6 w-6 text-[#d7b8ff]" /> : "Memory"}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex items-center gap-2">
                              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#d7b8ff]">
                                {item.type}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                                {(item.mood || "quiet").toUpperCase()}
                              </span>
                            </div>

                            <h3 className="truncate text-xl font-semibold text-white">{item.title}</h3>
                            <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                              <Clock3 className="h-3.5 w-3.5" />
                              {item.displayDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
                              {item.type === "capsule" && !isUnlocked
                                ? "This capsule is still sealed and waiting for its unlock moment."
                                : item.message || item.text || "A quiet fragment from your archive."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={cn("relative hidden h-full md:block", isLeft ? "md:pl-16" : "md:pr-16")}>
                      <div className={cn("absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-4 border-[#0b0a1a] bg-[#7919e6] shadow-[0_0_25px_rgba(121,25,230,0.9)]", isLeft ? "-left-2.5" : "-right-2.5")} />
                      <div className={cn("rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300", isLeft ? "ml-10" : "mr-10")}>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Memory note</div>
                        <div className="mt-2 font-medium text-white">
                          {item.type === "capsule" && !isUnlocked ? "Locked node" : "Open reflection"}
                        </div>
                        <div className="mt-2 text-slate-400">
                          {item.type === "capsule"
                            ? `Unlock date: ${new Date(item.unlockDate || item.displayDate).toLocaleDateString()}`
                            : "Captured in your memory stream"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="relative grid items-center gap-6 md:grid-cols-2">
                <div className="flex md:justify-end">
                  <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#33415550] bg-gradient-to-br from-[#171826] to-[#0f111a] p-8">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Memory Stream</div>
                    <div className="mt-4 text-4xl font-black tracking-[0.2em] text-white">
                      {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.8)]" />
                      <div className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
                      <div className="h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
                    </div>
                    <button className="mt-8 rounded-full border border-slate-700 bg-white/[0.03] px-5 py-2 text-xs tracking-[0.25em] text-slate-400">
                      RECORDING LIVE
                    </button>
                  </div>
                </div>
                <div className="relative hidden h-full md:block">
                  <div className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-4 border-[#0b0a1a] bg-cyan-500 shadow-[0_0_25px_rgba(34,211,238,0.8)]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <button
            onClick={() => navigate("/createcapsule")}
            className="flex w-full items-center justify-between rounded-3xl bg-gradient-to-br from-[#f59e0b] to-[#ec4899] px-6 py-5 text-left shadow-[0_25px_45px_rgba(236,72,153,0.18)]"
          >
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-white/70">Create</div>
              <div className="mt-2 text-2xl font-bold text-white">Add a new capsule</div>
            </div>
            <Plus className="h-7 w-7 text-white" />
          </button>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Signal Stats</div>
                <div className="mt-2 text-2xl font-bold text-white">Stream pulse</div>
              </div>
              <TrendingUp className="h-6 w-6 text-[#d7b8ff]" />
            </div>

            <div className="space-y-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-pink-400">Collection</div>
                <div className="mt-2 text-3xl font-black text-white">{filteredItems.length}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-400">Sealed</div>
                <div className="mt-2 text-3xl font-black text-white">
                  {filteredItems.filter((item) => item.type === "capsule" && new Date() < new Date(item.unlockDate) && !item.isUnlocked).length}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-amber-400">Echoes</div>
                <div className="mt-2 text-3xl font-black text-white">
                  {filteredItems.filter((item) => item.type === "memory").length}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Studio Tools</div>
                <div className="mt-2 text-xl font-bold text-white">Quick actions</div>
              </div>
              <Settings className="h-5 w-5 text-slate-400" />
            </div>

            <div className="space-y-3">
              <button className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300 hover:border-[#7919e6]/50">
                Search-powered highlights
                <TrendingUp className="h-4 w-4 text-slate-500" />
              </button>
              <button
                onClick={() => navigate("/shared")}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300 hover:border-[#7919e6]/50"
              >
                Shared vaults overview
                <Plus className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
