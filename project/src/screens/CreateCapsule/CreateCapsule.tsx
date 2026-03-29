import { ArrowLeft, Calendar, FileText, Image, Lock, Plus, Send, User, Mic, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import API from "../../api";

interface CapsuleMemory {
  id: string;
  type: "photo" | "text" | "audio";
  content: string;
  preview?: string;
  file?: File; // 🔥 ADD THIS
}

export const CreateCapsule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capsuleName, setCapsuleName] = useState("");
  const [description, setDescription] = useState("");
  const [unlocksDate, setUnlocksDate] = useState("");
  const [unlocksTime, setUnlocksTime] = useState("");
  const [mood, setMood] = useState("Happy");
  const [memories, setMemories] = useState<CapsuleMemory[]>([]);
  const [isPrivate, setIsPrivate] = useState(!(location.state as { collaborative?: boolean } | null)?.collaborative);
  const [members, setMembers] = useState<{ email: string; role: "viewer" | "editor" }[]>([]);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [newRole, setNewRole] = useState<"viewer" | "editor">("viewer");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const moods = ["Happy", "Nostalgic", "Adventurous", "Peaceful", "Hopeful"];

  const handleAddMemory = (type: "photo" | "text" | "audio") => {
  if (type === "text") {
    const note = window.prompt("Write your memory note");
    if (!note || !note.trim()) return;

    const newMemory: CapsuleMemory = {
      id: Date.now().toString(),
      type: "text",
      content: note.trim(),
    };

    setMemories(prev => [...prev, newMemory]);
  }
};

  const handleRemoveMemory = (id: string) => {
    setMemories(prev => prev.filter((m) => m.id !== id));
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const newMemory: CapsuleMemory = {
          id: Date.now().toString(),
          type: "photo",
          content: file.name,
          preview: String(reader.result ?? ""),
          file: file,
        };
        setMemories(prev => [...prev, newMemory]);
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRecordVoice = async () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current);
        const reader = new FileReader();
        reader.onload = () => {
          setMemories((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "audio",
              content: "Voice Note",
              preview: String(reader.result ?? ""),
              file: new File([blob], "voice-note.mp4")
            },
          ]);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("Microphone permission is required for voice notes");
    }
  };

  const handleAddCollaborator = () => {
    if (newCollaborator.trim() && !members.some((m) => m.email === newCollaborator)) {
      setMembers(prev => [...prev, { email: newCollaborator, role: newRole }]);
      setNewCollaborator("");
      setNewRole("viewer");
    }
  };

  const handleRemoveCollaborator = (email: string) => {
    setMembers(prev => prev.filter((c) => c.email !== email));
  };


const handleCreateCapsule = async () => {
  try {
    if (!capsuleName.trim() || !unlocksDate) {
      alert("Please fill in capsule name and unlock date");
      return;
    }

    const unlockDateTime = unlocksTime
      ? new Date(`${unlocksDate}T${unlocksTime}`)
      : new Date(unlocksDate);

    // ✅ CREATE FORMDATA
    const formData = new FormData();

    formData.append("title", capsuleName);
    formData.append("message", description);
    formData.append("unlockDate", unlockDateTime.toISOString());
    formData.append("mood", mood);
    formData.append("isPrivate", isPrivate ? "true" : "false");
    
    if (members.length > 0) {
      formData.append("members", JSON.stringify(members));
    }

    const textMemories = memories.filter(m => m.type === "text").map(m => m.content);
    if (textMemories.length > 0) formData.append("textMemories", JSON.stringify(textMemories));

    const photoMemories = memories.filter(m => m.type === "photo" && m.file);
    photoMemories.forEach(m => formData.append("image", m.file as Blob));

    const audioMemories = memories.filter(m => m.type === "audio" && m.file);
    if (audioMemories.length > 0) formData.append("audio", audioMemories[0].file as Blob);

    await API.post("/capsules", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Capsule created 🎉");
    navigate("/calendarview");
  } catch (err) {
    console.error(err);
    alert("Error creating capsule");
  }
};

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      
      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        <div className="absolute w-full h-full [background:radial-gradient(50%_50%_at_100%_0%,rgba(26,11,46,1)_0%,rgba(10,10,26,1)_100%)]">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#7919e6] rounded-full blur-3xl opacity-20" />
          <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-[#7919e6] rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-10 left-80 w-64 h-64 rounded-full opacity-20 bg-[#7919e6] blur-3xl" />
        </div>
      </div>

      <div className="relative">
        {/* Header */}
        <div className="border-b border-[#33415580] bg-[#0f0f1f]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-[#ffffff08] rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-slate-400" />
              </button>
              <h1 className="text-3xl font-bold">Create Memory Capsule</h1>
            </div>
            <div className="text-slate-400 text-sm">
              STEP <span className="text-[#7919e6] font-bold">1</span> OF 3
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Panel - Basic Info */}
            <div className="col-span-2 space-y-8">
              {/* Capsule Details */}
              <div className="bg-[#ffffff08] rounded-2xl p-8 border border-[#7919e633] backdrop-blur-md">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#7919e6]" />
                  Capsule Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Capsule Name
                    </label>
                    <input
                      type="text"
                      value={capsuleName}
                      onChange={(e) => setCapsuleName(e.target.value)}
                      placeholder="e.g., Summer Memories 2024"
                      className="w-full bg-[#0f172a80] border border-[#33415580] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#7919e6] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell the story of this capsule..."
                      rows={4}
                      className="w-full bg-[#0f172a80] border border-[#33415580] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#7919e6] transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Mood / Feeling
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {moods.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMood(m)}
                          className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all",
                            mood === m
                              ? "bg-[#7919e6] text-white"
                              : "bg-[#ffffff08] text-slate-400 hover:text-white border border-[#33415580]"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Unlock Date & Time */}
              <div className="bg-[#ffffff08] rounded-2xl p-8 border border-[#7919e633] backdrop-blur-md">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#7919e6]" />
                  When to Unlock
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Unlock Date
                    </label>
                    <input
                      type="date"
                      value={unlocksDate}
                      onChange={(e) => setUnlocksDate(e.target.value)}
                      className="w-full bg-[#0f172a80] border border-[#33415580] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7919e6] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Unlock Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={unlocksTime}
                      onChange={(e) => setUnlocksTime(e.target.value)}
                      className="w-full bg-[#0f172a80] border border-[#33415580] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7919e6] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Add Memories */}
              <div className="bg-[#ffffff08] rounded-2xl p-8 border border-[#7919e633] backdrop-blur-md">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <Plus className="w-5 h-5 text-[#7919e6]" />
                  Add Memories
                </h2>

                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-br from-[#7919e6] to-[#a855f7] hover:from-[#6a15cc] hover:to-[#9333ea] rounded-xl py-4 font-medium transition-all shadow-lg"
                  >
                    <Image className="w-5 h-5" />
                    Add Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMemory("text")}
                    className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-br from-[#7919e6] to-[#a855f7] hover:from-[#6a15cc] hover:to-[#9333ea] rounded-xl py-4 font-medium transition-all shadow-lg"
                  >
                    <FileText className="w-5 h-5" />
                    Add Note
                  </button>
                  <button
                    type="button"
                    onClick={handleRecordVoice}
                    className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-br from-[#7919e6] to-[#a855f7] hover:from-[#6a15cc] hover:to-[#9333ea] rounded-xl py-4 font-medium transition-all shadow-lg"
                  >
                    <Mic className="w-5 h-5" />
                    {isRecording ? "Stop Recording" : "Add Voice"}
                  </button>
                </div>

                {memories.length > 0 && (
                  <div className="space-y-4">
                    {memories.map((memory) => (
                      <div
                        key={memory.id}
                        className="bg-[#0f172a80] border border-[#33415580] rounded-xl p-4 flex items-center gap-4 hover:bg-[#ffffff12] transition-all"
                      >
                        {memory.type === "photo" && memory.preview && (
                          <>
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={memory.preview}
                                alt="Memory preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Image className="w-4 h-4 text-[#7919e6]" />
                                <span className="font-medium text-white">Photo Memory</span>
                              </div>
                              <p className="text-sm text-slate-400">Photo added successfully</p>
                            </div>
                          </>
                        )}
                        {memory.type === "text" && (
                          <>
                            <div className="w-12 h-12 rounded-lg bg-[#7919e6]/20 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-[#7919e6]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white">Text Note</span>
                              </div>
                              <p className="text-sm text-slate-400 line-clamp-2">{memory.content || "Text memory added"}</p>
                            </div>
                          </>
                        )}
                        {memory.type === "audio" && (
                          <>
                            <div className="w-12 h-12 rounded-lg bg-[#7919e6]/20 flex items-center justify-center flex-shrink-0">
                              <Mic className="w-5 h-5 text-[#7919e6]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white">Voice Memo</span>
                              </div>
                              <p className="text-sm text-slate-400">Voice recording added</p>
                              {memory.preview && (
                                <audio controls className="mt-2 w-full max-w-[280px]">
                                  <source src={memory.preview} />
                                </audio>
                              )}
                            </div>
                          </>
                        )}
                        <button
                          onClick={() => handleRemoveMemory(memory.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all ml-auto"
                          title="Remove memory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Security & Sharing - FIXED STICKY */}
            <div className="col-span-1 space-y-8">
              {/* Privacy Settings - STAYS STUCK ON SCROLL */}
              <div className="bg-[#ffffff08] rounded-2xl p-8 border border-[#7919e633] backdrop-blur-md">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[#7919e6]" />
                  Privacy
                </h3>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all",
                      isPrivate
                        ? "bg-[#7919e6]/20 border-[#7919e6] shadow-md"
                        : "bg-[#0f172a80] border-[#33415580] hover:border-[#7919e6]/50 hover:bg-[#ffffff08]"
                    )}
                  >
                    <div className="font-medium mb-1 text-white">🔒 Private</div>
                    <div className="text-xs text-slate-400">Only you can access</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all",
                      !isPrivate
                        ? "bg-[#7919e6]/20 border-[#7919e6] shadow-md"
                        : "bg-[#0f172a80] border-[#33415580] hover:border-[#7919e6]/50 hover:bg-[#ffffff08]"
                    )}
                  >
                    <div className="font-medium mb-1 text-white">👥 Collaborative</div>
                    <div className="text-xs text-slate-400">Invite others to add memories</div>
                  </button>
                </div>
              </div>

              {/* Collaborators */}
              {!isPrivate && (
                <div className="bg-[#ffffff08] rounded-2xl p-8 border border-[#7919e633] backdrop-blur-md">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                    <User className="w-5 h-5 text-[#7919e6]" />
                    Invite People
                  </h3>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newCollaborator}
                          onChange={(e) => setNewCollaborator(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddCollaborator()}
                          placeholder="Email address"
                          className="flex-1 bg-[#0f172a80] border border-[#33415580] rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#7919e6] transition-colors"
                        />
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value as "viewer"|"editor")}
                          className="bg-[#0f172a80] border border-[#33415580] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7919e6] transition-colors appearance-none"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAddCollaborator}
                          className="bg-[#7919e6] hover:bg-[#6a15cc] rounded-xl px-4 py-2 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {members.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-[#33415580]">
                        {members.map((collab) => (
                          <div
                            key={collab.email}
                            className="flex items-center justify-between bg-[#0f172a80] p-3 rounded-lg hover:bg-[#ffffff12] transition-all"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm text-white truncate">{collab.email}</span>
                              <span className="text-xs text-slate-400 capitalize">{collab.role}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCollaborator(collab.email)}
                              className="text-red-400 hover:text-red-300 text-sm hover:bg-red-500/10 p-1 rounded transition-all"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gradient-to-br from-[#7919e6] to-[#a855f7] rounded-2xl p-8 shadow-xl">
                <h3 className="text-lg font-semibold mb-6 text-white">Capsule Summary</h3>

                <div className="space-y-4 text-sm mb-8">
                  <div>
                    <div className="text-white/80 mb-1">Name</div>
                    <div className="font-medium text-lg text-white">{capsuleName || "Unnamed"}</div>
                  </div>
                  <div>
                    <div className="text-white/80 mb-1">Unlocks</div>
                    <div className="font-medium text-white">{unlocksDate || "Not set"}</div>
                  </div>
                  <div>
                    <div className="text-white/80 mb-1">Memories</div>
                    <div className="font-medium text-white">{memories.length} item(s)</div>
                  </div>
                  <div>
                    <div className="text-white/80 mb-1">Type</div>
                    <div className="font-medium text-white">{isPrivate ? "Private" : "Collaborative"}</div>
                  </div>
                </div>

                <Button
                  onClick={handleCreateCapsule}
                  disabled={!capsuleName.trim() || !unlocksDate}
                  className="w-full bg-white text-[#7919e6] hover:bg-white/90 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xl"
                >
                  <Send className="w-4 h-4" />
                  Create Capsule
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};