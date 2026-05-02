import { Lock, Calendar } from "lucide-react";
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCapsules, type Capsule } from "../../services/capsule";
import { getMemories, type Memory } from "../../services/memory";

export const CalendarView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const toLocalKey = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const buildAssetUrl = (value?: string) => {
    if (!value) return "";
    if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) return value;
    return `${import.meta.env.VITE_API_URL}/${value.replace(/\\/g, "/")}`;
  };
  
  const getCapsulePreviewImage = (capsule?: Capsule) => {
    if (!capsule) return undefined;
    if (capsule.images?.[0]) return buildAssetUrl(capsule.images[0]);
    const firstPhoto = capsule.memories?.find((memory) => memory.type === "photo" && memory.preview);
    return firstPhoto?.preview ? buildAssetUrl(firstPhoto.preview) : undefined;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [capsulesRes, memoriesRes] = await Promise.all([getCapsules(), getMemories()]);
        setCapsules(capsulesRes.data ?? []);
        setMemories(memoriesRes.data ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const selectedMonth = selectedDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const moodStats = useMemo(() => {
    const sourceCapsules = capsules.filter((capsule) =>
      !query ||
      capsule.title?.toLowerCase().includes(query) ||
      capsule.message?.toLowerCase().includes(query) ||
      capsule.mood?.toLowerCase().includes(query)
    );
    const moods = sourceCapsules.map((c) => c.mood || "Unknown");
    const total = moods.length || 1;
    const counter = moods.reduce<Record<string, number>>((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    const colors = ["bg-amber-500", "bg-cyan-500", "bg-rose-500", "bg-purple-500"];
    return Object.entries(counter).map(([mood, count], index) => ({
      mood,
      percentage: Math.round((count / total) * 100),
      color: colors[index % colors.length],
    }));
  }, [capsules, query]);

  const filteredCapsules = useMemo(
    () =>
      capsules.filter((capsule) =>
        !query ||
        capsule.title?.toLowerCase().includes(query) ||
        capsule.message?.toLowerCase().includes(query) ||
        capsule.mood?.toLowerCase().includes(query)
      ),
    [capsules, query]
  );

  const filteredMemories = useMemo(
    () =>
      memories.filter((memory) =>
        !query ||
        memory.text?.toLowerCase().includes(query) ||
        memory.mood?.toLowerCase().includes(query)
      ),
    [memories, query]
  );

  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const mondayOffset = (firstDay.getDay() + 6) % 7;

    const days: Array<{
      key: string;
      day: number;
      inCurrentMonth: boolean;
      hasMemory?: boolean;
      capsule?: Capsule;
      locked?: boolean;
      mood?: string;
      previewImage?: string;
    }> = [];

    for (let i = mondayOffset - 1; i >= 0; i -= 1) {
      const d = new Date(year, month, -i);
      days.push({ key: `prev-${d.toISOString()}`, day: d.getDate(), inCurrentMonth: false });
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const date = new Date(year, month, day);
      const key = toLocalKey(date);
      const capsule = filteredCapsules.find(
        (c) => toLocalKey(c.unlockDate) === key
      );
      const memory = filteredMemories.find((m) => {
        const source = m.createdAt || m.date;
        return source ? toLocalKey(source) === key : false;
      });
      const unlocked =
        Boolean(capsule?.isReadyToView || capsule?.canViewContent || capsule?.isUnlocked) ||
        (capsule ? new Date() >= new Date(capsule.unlockDate) : false);
      const previewImage = unlocked ? getCapsulePreviewImage(capsule) : undefined;
      days.push({
        key,
        day,
        inCurrentMonth: true,
        hasMemory: Boolean(capsule || memory),
        capsule,
        locked: capsule ? !unlocked : false,
        mood: capsule?.mood || memory?.mood,
        previewImage,
      });
    }

    while (days.length < 35) {
      const nextDay = days.length - (mondayOffset + lastDay.getDate()) + 1;
      const d = new Date(year, month + 1, nextDay);
      days.push({ key: `next-${d.toISOString()}`, day: d.getDate(), inCurrentMonth: false });
    }

    return days;
  }, [filteredCapsules, filteredMemories, selectedDate]);

  const getMoodColor = (mood?: string) => {
    switch (mood?.toLowerCase()) {
      case "happy": return "border-amber-500";
      case "nostalgic": return "border-cyan-500";
      case "peaceful": return "border-blue-500";
      case "adventurous": return "border-purple-500";
      default: return "border-[#7919e6]";
    }
  };

  return (
    <Layout>
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1 tracking-tight">Memory Capsule</h1>
              <p className="text-slate-400 text-sm">Relive your moments, one day at a time</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20">
                  <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="text-white font-bold text-sm">+3</div>
            </div>
            <Button onClick={() => navigate("/createcapsule")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600">
              + New Capsule
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-3 space-y-6">
          <div className="bg-[#3d2817] rounded-2xl p-6 border border-amber-900/30">
            <h3 className="text-amber-200 text-xs tracking-wider uppercase mb-6 font-medium">MOOD STATISTICS</h3>
            <div className="space-y-5">
              {(moodStats.length ? moodStats : [{ mood: "No Data", percentage: 0, color: "bg-slate-600" }]).map((stat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-100 text-sm">{stat.mood}</span>
                    <span className="text-amber-200 text-sm font-bold">{stat.percentage}%</span>
                  </div>
                  <div className="h-2 bg-amber-950 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", stat.color)}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#2a2520] rounded-2xl p-6 border border-amber-900/20">
            <h3 className="text-amber-200/80 text-xs tracking-wider uppercase mb-4 font-medium">MONTHLY RECAP</h3>
            <div className="space-y-3">
              <p className="text-amber-100/70 text-sm leading-relaxed">
                Your "Golden Hour" memories are 12% higher than last month. You seem more active in the evenings.
              </p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-amber-900/20">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-amber-100 font-medium text-sm">{filteredCapsules.length} Capsules</div>
                  <div className="text-amber-200/60 text-xs">Archived this month</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs text-white/90 uppercase tracking-wider font-medium">GOLDEN HOUR</div>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{filteredMemories.length}</div>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                <img src="https://i.pravatar.cc/150?img=20" alt="User" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-white text-sm font-medium">Total Memories</div>
                <div className="text-white/70 text-xs">Captured so far</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-9">
          <div className="bg-[#2a2520] rounded-3xl p-8 border border-amber-900/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(
                      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
                    )
                  }
                  className="text-amber-200 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-amber-100">{selectedMonth}</h2>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(
                      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
                    )
                  }
                  className="text-amber-200 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-500/30">
                    <img src={`https://i.pravatar.cc/150?img=${i + 15}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="text-amber-200 font-bold text-sm">+3</div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs text-amber-400/60 font-medium uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
              {calendarDays.map((dayData) => (
                <div
                  key={dayData.key}
                  className={cn(
                    "aspect-square rounded-xl transition-all relative group",
                    dayData.hasMemory || dayData.locked
                      ? "bg-gradient-to-br from-amber-900/20 to-stone-900/20 border cursor-pointer hover:scale-105"
                      : "bg-stone-900/10 border border-transparent",
                    dayData.hasMemory && getMoodColor(dayData.mood),
                    dayData.locked && "border-amber-500/50"
                  )}
                  onClick={() => dayData.capsule?._id && navigate(`/capsule/${dayData.capsule._id}`)}
                >
                  <div className={cn(
                    "absolute top-2 right-2 text-xs font-medium",
                    dayData.hasMemory || dayData.locked ? "text-amber-100" : "text-amber-400/40"
                  )}>
                    {dayData.day.toString().padStart(2, '0')}
                  </div>

                  {dayData.hasMemory && dayData.inCurrentMonth && (
                    <div className="w-full h-full rounded-xl overflow-hidden p-2">
                      <div className="relative w-full h-full overflow-hidden rounded-lg border border-amber-500/20 bg-amber-900/30">
                        {dayData.previewImage ? (
                          <>
                            <img
                              src={dayData.previewImage}
                              alt={dayData.capsule?.title || "Memory preview"}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-2 pb-2 pt-6">
                              <div className="truncate text-[11px] font-medium text-white">
                                {dayData.capsule?.title || "Memory"}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-amber-100">
                            {dayData.capsule?.title || "Memory"}
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 left-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          dayData.mood?.toLowerCase() === "happy" && "bg-amber-400",
                          dayData.mood?.toLowerCase() === "nostalgic" && "bg-cyan-400",
                          dayData.mood?.toLowerCase() === "peaceful" && "bg-blue-400",
                          dayData.mood?.toLowerCase() === "adventurous" && "bg-purple-400"
                        )} />
                      </div>
                    </div>
                  )}

                  {dayData.locked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Lock className="w-6 h-6 text-amber-500 mb-2" />
                      {dayData.locked && (
                        <div className="text-[10px] text-amber-400 font-medium bg-amber-950/50 px-2 py-1 rounded">
                          LOCKED
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
