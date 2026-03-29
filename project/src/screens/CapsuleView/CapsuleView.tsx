import { ChevronDown, Image as ImageIcon, Mic, Music, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCapsules, type Capsule } from "../../services/capsule";

export const CapsuleView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [activeAudio, setActiveAudio] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadCapsule = async () => {
      try {
        const res = await getCapsules();
        const found = (res.data ?? []).find((item) => item._id === id) ?? null;
        setCapsule(found);
      } catch (err) {
        console.error(err);
      }
    };
    loadCapsule();
  }, [id]);

  const isLocked = useMemo(
    () => {
      if (!capsule) return true;
      if (capsule.isUnlocked) return false;
      return new Date() < new Date(capsule.unlockDate);
    },
    [capsule]
  );

  const mediaItems = capsule?.memories ?? [];
  const photoItems = mediaItems.filter((item) => item.type === "photo");
  const textItems = mediaItems.filter((item) => item.type === "text");
  const audioItems = mediaItems.filter((item) => item.type === "audio");

  useEffect(() => {
    // AutoPlay first audio if unlocked
    if (!isLocked && audioItems.length > 0 && audioItems[0].preview && !activeAudio && audioRef.current) {
        audioRef.current.src = audioItems[0].preview;
        audioRef.current.play().then(() => {
            setActiveAudio(audioItems[0].preview!);
            setIsPlaying(true);
        }).catch(() => {
            console.log("Autoplay blocked, needs interaction");
            setActiveAudio(audioItems[0].preview!);
        });
    }
  }, [isLocked, audioItems, activeAudio]);

  const toggleAudio = (src: string) => {
    if (!audioRef.current) return;
    if (activeAudio === src && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    audioRef.current.src = src;
    void audioRef.current.play();
    setActiveAudio(src);
    setIsPlaying(true);
  };

  const handleBottomPlayToggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!audioRef.current.src && audioItems.length > 0 && audioItems[0].preview) {
        audioRef.current.src = audioItems[0].preview;
        setActiveAudio(audioItems[0].preview);
      }
      void audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden pb-32">
      <div className="absolute top-6 right-6 text-right z-10">
        <div className="text-slate-400 text-xs tracking-wider mb-1">SESSION ID: #{id?.substring(0,8) || 'C94-MEM'}</div>
        <div className="text-slate-500 text-xs">LAT: 34.0522° N • LON: 118.2437° W</div>
      </div>

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        <div className="absolute w-full h-full [background:radial-gradient(50%_50%_at_100%_0%,rgba(26,11,46,1)_0%,rgba(10,10,26,1)_100%)]">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#7919e6] rounded-full blur-3xl opacity-20" />
          <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-[#7919e6] rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-10 left-80 w-64 h-64 rounded-full opacity-20 bg-[#7919e6] blur-3xl" />
        </div>

        <div className="absolute w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#7919e6] blur-sm"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.4 + 0.1,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center px-12 py-20 min-h-screen">
        <div className="max-w-4xl w-full">
          {/* PHOTO CAROUSEL */}
          <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x mb-12" style={{ scrollbarWidth: 'none' }}>
            {photoItems.length > 0 ? (
              photoItems.map((item, index) => (
                <div key={`${item.preview}-${index}`} className="flex-none w-80 min-h-[300px] rounded-2xl overflow-hidden border border-[#7919e633] bg-[#ffffff08] snap-center shadow-2xl relative group">
                  {item.preview ? (
                     <img src={item.preview} alt={item.content || "Capsule memory"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-400">
                       <ImageIcon className="w-8 h-8" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            ) : (
              <div className="w-full rounded-2xl border border-[#7919e633] bg-[#ffffff08] p-12 text-center text-slate-400">
                No photos added in this capsule.
              </div>
            )}
          </div>

          <div className="text-center mb-12">
            <div className="bg-[#0f172a80] backdrop-blur-md border border-[#7919e633] rounded-2xl p-8 inline-block shadow-lg">
              <p className="text-[#a855f7] text-2xl italic font-serif leading-relaxed px-8">
                {capsule?.message || "No message saved in this capsule."}
              </p>
            </div>
          </div>

          {textItems.length > 0 && (
            <div className="mb-10 space-y-3">
              {textItems.map((item, index) => (
                <div key={`${item.content}-${index}`} className="bg-[#ffffff08] border border-[#7919e633] rounded-xl p-6 text-slate-200 shadow-md">
                  {item.content}
                </div>
              ))}
            </div>
          )}

          {audioItems.length > 0 && (
            <div className="mb-10 space-y-3">
              {audioItems.map((item, index) => (
                <div key={`${item.preview}-${index}`} className="bg-[#ffffff08] border border-[#7919e633] rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-md">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-[#7919e6]/20 flex items-center justify-center">
                       <Mic className="w-5 h-5 text-[#d7b8ff]" />
                     </div>
                     <span className="text-slate-200 font-medium">Recorded Audio Memory {index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => item.preview && toggleAudio(item.preview)}
                    className="flex items-center gap-2 px-6 py-2 rounded-full border border-[#7919e666] hover:bg-[#7919e6] hover:text-white transition-all text-sm font-semibold tracking-wider uppercase text-[#d7b8ff]"
                  >
                    {activeAudio === item.preview && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {activeAudio === item.preview && isPlaying ? "Pause" : "Play"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mb-16 mt-20">
            <div className="mb-6">
              <div className="text-sm text-slate-400 mb-2 italic">
                Unlock date: {capsule?.unlockDate ? new Date(capsule.unlockDate).toLocaleString() : "Unknown"}
              </div>
              <h1 className="text-5xl md:text-6xl font-serif mb-5 tracking-widest">{isLocked ? "CAPSULE LOCKED" : "CAPSULE RELEASED"}</h1>
              <div className="text-[#7919e6] text-sm font-bold tracking-widest uppercase">
                {capsule?.title || "VAULT"} • {capsule?.mood || "No mood"}
              </div>
            </div>
            <p className="text-slate-400 italic text-lg">{isLocked ? "This capsule is still sealed." : "A promise for the future."}</p>
          </div>

          <div className="flex items-center justify-center mb-12">
            <button
              onClick={() => navigate("/dashboard")}
              className="group flex items-center gap-3 bg-[#0f172a80] hover:bg-[#0f172a] backdrop-blur-md border border-[#7919e633] hover:border-[#7919e6] rounded-full px-8 py-4 transition-all"
            >
              <span className="text-white font-medium">CLOSE VAULT</span>
              <ChevronDown className="w-5 h-5 text-white group-hover:rotate-180 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-12 max-w-sm mx-auto">
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-2">{mediaItems.length}</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Assets</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-2">{capsule?.isPrivate ? "PRIVATE" : "SHARED"}</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Storage Access</div>
            </div>
          </div>
        </div>
      </div>

      {audioItems.length > 0 && (
         <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f1f]/90 backdrop-blur-xl border-t border-[#1a1a2e] p-6 z-20">
           <div className="max-w-7xl mx-auto flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[#1e102e] to-[#2d1b45] border border-[#7919e633]">
                 <div className="w-full h-full flex items-center justify-center">
                   <Music className="w-6 h-6 text-[#d7b8ff]" />
                 </div>
               </div>
               <div>
                 <div className="text-white font-semibold truncate max-w-xs">{capsule?.title || "Audio Experience"}</div>
                 <div className="text-slate-400 text-sm tracking-wide">{capsule?.mood || "Ambient Resonance"}</div>
               </div>
             </div>

             <div className="flex items-center gap-6">
               <button className="text-slate-400 hover:text-white transition-colors">
                 <SkipBack className="w-5 h-5" fill="currentColor" />
               </button>
               <button
                 onClick={handleBottomPlayToggle}
                 className="w-12 h-12 rounded-full bg-[#7919e6] hover:bg-[#6a15cc] flex items-center justify-center transition-all hover:scale-105 shadow-[0_0_15px_rgba(121,25,230,0.4)]"
               >
                 {isPlaying ? (
                   <Pause className="w-5 h-5 text-white" fill="white" />
                 ) : (
                   <Play className="w-5 h-5 text-white" fill="white" />
                 )}
               </button>
               <button className="text-slate-400 hover:text-white transition-colors">
                 <SkipForward className="w-5 h-5" fill="currentColor" />
               </button>
             </div>

             <div className="flex flex-col items-end gap-1">
               <span className="text-xs text-slate-400 tracking-widest uppercase font-bold">Playback Engine</span>
               <span className="text-sm font-semibold text-[#d7b8ff]">Media Stream Engaged</span>
             </div>
           </div>
         </div>
      )}
      
      <audio
        ref={audioRef}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        className="hidden"
      />
    </div>
  );
};
