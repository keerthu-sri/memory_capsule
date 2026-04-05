import { ArrowLeft, Calendar, FileText, Image, Lock, Mic, Music, Plus, Send, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "../../components/theme/ThemeToggle";
import { MiniModal } from "../../components/ui/MiniModal";
import { MiniNotice } from "../../components/ui/MiniNotice";
import { Button } from "../../components/ui/button";
import { startWavRecording, type WavRecordingSession } from "../../lib/wavRecorder";
import { cn } from "../../lib/utils";
import { createCapsule } from "../../services/capsule";

interface CapsuleMemory {
  id: string;
  type: "photo" | "text" | "audio";
  content: string;
  preview?: string;
  file?: File;
  mediaKind?: "voice" | "song";
}

export const CreateCapsule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const songInputRef = useRef<HTMLInputElement>(null);
  const wavRecorderRef = useRef<WavRecordingSession | null>(null);
  const noticeTimeoutRef = useRef<number | null>(null);

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
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [notice, setNotice] = useState<{ message: string; variant: "info" | "success" | "error" } | null>(null);
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState("");

  const moods = ["Happy", "Nostalgic", "Adventurous", "Peaceful", "Hopeful"];

  const showNotice = (message: string, variant: "info" | "success" | "error" = "info") => {
    setNotice({ message, variant });
    if (noticeTimeoutRef.current) window.clearTimeout(noticeTimeoutRef.current);
    noticeTimeoutRef.current = window.setTimeout(() => setNotice(null), 2600);
  };

  useEffect(() => {
    const loadAudioInputs = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const microphones = devices.filter((device) => device.kind === "audioinput");
        setAudioInputs(microphones);
        if (!selectedMicId && microphones[0]?.deviceId) {
          setSelectedMicId(microphones[0].deviceId);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadAudioInputs();
  }, [selectedMicId]);

  const handleAddMemory = () => {
    if (!noteDraft.trim()) {
      showNotice("Write a quick note before adding it.", "error");
      return;
    }

    setMemories((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "text",
        content: noteDraft.trim(),
      },
    ]);
    setNoteDraft("");
    setShowNoteModal(false);
  };

  const handleRemoveMemory = (id: string) => {
    setMemories((prev) => prev.filter((memory) => memory.id !== id));
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setMemories((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${file.name}`,
            type: "photo",
            content: file.name,
            preview: String(reader.result ?? ""),
            file,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    showNotice(`${files.length} image${files.length > 1 ? "s" : ""} added to the capsule.`, "success");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddSong = () => {
    songInputRef.current?.click();
  };

  const handleSongUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("audio/")) return;

    setMemories((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "audio",
        content: file.name,
        preview: URL.createObjectURL(file),
        file,
        mediaKind: "song",
      },
    ]);

    showNotice("Song added to your capsule draft.", "success");
    if (songInputRef.current) songInputRef.current.value = "";
  };

  const handleRecordVoice = async () => {
    if (isRecording && wavRecorderRef.current) {
      const result = await wavRecorderRef.current.stop();
      wavRecorderRef.current = null;
      setIsRecording(false);
      setMemories((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "audio",
          content: "Voice Note",
          preview: result.previewUrl,
          file: result.file,
          mediaKind: "voice",
        },
      ]);
      showNotice("Voice note recorded. Use the preview player to check audio.", "success");
      return;
    }

    try {
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      };

      if (selectedMicId) {
        audioConstraints.deviceId = { exact: selectedMicId };
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices.filter((device) => device.kind === "audioinput");
      setAudioInputs(microphones);

      const activeTrack = stream.getAudioTracks()[0];
      const settings = activeTrack?.getSettings();
      if (settings?.deviceId) {
        setSelectedMicId(settings.deviceId);
      }

      wavRecorderRef.current = await startWavRecording(stream);
      setIsRecording(true);
      showNotice("Recording started. Speak into the selected microphone, then stop to save.", "info");
    } catch (error) {
      console.error(error);
      showNotice("Microphone permission is required for voice notes.", "error");
    }
  };

  const handleAddCollaborator = () => {
    const email = newCollaborator.trim().toLowerCase();
    if (!email) return;
    if (members.some((member) => member.email === email)) return;

    setMembers((prev) => [...prev, { email, role: newRole }]);
    setNewCollaborator("");
    setNewRole("viewer");
  };

  const handleRemoveCollaborator = (email: string) => {
    setMembers((prev) => prev.filter((member) => member.email !== email));
  };

  const handleCreateCapsule = async () => {
    try {
      if (!capsuleName.trim() || !unlocksDate) {
        showNotice("Please fill in capsule name and unlock date.", "error");
        return;
      }

      setIsSubmitting(true);

      const unlockDateTime = unlocksTime ? new Date(`${unlocksDate}T${unlocksTime}`) : new Date(unlocksDate);
      const formData = new FormData();

      formData.append("title", capsuleName.trim());
      formData.append("message", description.trim());
      formData.append("unlockDate", unlockDateTime.toISOString());
      formData.append("mood", mood);
      formData.append("isPrivate", isPrivate ? "true" : "false");
      formData.append("isCollaborative", (!isPrivate).toString());

      if (members.length > 0) {
        formData.append("members", JSON.stringify(members));
      }

      const textMemories = memories.filter((memory) => memory.type === "text").map((memory) => memory.content);
      if (textMemories.length > 0) {
        formData.append("textMemories", JSON.stringify(textMemories));
      }

      memories
        .filter((memory) => memory.type === "photo" && memory.file)
        .forEach((memory) => formData.append("image", memory.file as Blob));

      memories
        .filter((memory) => memory.type === "audio" && memory.file)
        .forEach((memory) => formData.append(memory.mediaKind === "song" ? "song" : "audio", memory.file as Blob));

      await createCapsule(formData);

      showNotice(!isPrivate && members.length > 0 ? "Capsule created and invites sent." : "Capsule created.", "success");
      navigate(isPrivate ? "/calendarview" : "/shared");
    } catch (error) {
      console.error(error);
      showNotice("Error creating capsule.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="theme-shell min-h-screen relative overflow-hidden">
      <MiniNotice open={Boolean(notice)} message={notice?.message || ""} variant={notice?.variant || "info"} />
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
      <input ref={songInputRef} type="file" accept="audio/*" onChange={handleSongUpload} className="hidden" />

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        <div className="theme-overlay" />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[var(--app-accent)] rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-[var(--app-accent)] rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-80 w-64 h-64 rounded-full opacity-20 bg-[var(--app-accent)] blur-3xl" />
      </div>

      <MiniModal
        open={showNoteModal}
        title="Add a Memory Note"
        description="Write a short note and add it to this capsule."
        confirmLabel="Add Note"
        cancelLabel="Cancel"
        onConfirm={handleAddMemory}
        onCancel={() => {
          setShowNoteModal(false);
          setNoteDraft("");
        }}
        confirmDisabled={!noteDraft.trim()}
      >
        <textarea
          value={noteDraft}
          onChange={(event) => setNoteDraft(event.target.value)}
          rows={5}
          placeholder="Write your memory note..."
          className="theme-input w-full rounded-2xl px-4 py-3 text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)] resize-none"
        />
      </MiniModal>

      <div className="relative">
        <div className="theme-header border-b backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-[var(--app-surface)] rounded-xl transition-colors">
                <ArrowLeft className="w-6 h-6 theme-muted" />
              </button>
              <h1 className="text-3xl font-bold truncate">Create Memory Capsule</h1>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <ThemeToggle />
              <div className="theme-muted text-sm whitespace-nowrap">
                STEP <span className="text-[var(--app-accent)] font-bold">1</span> OF 3
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid lg:grid-cols-[minmax(0,2fr)_360px] gap-8 items-start">
            <div className="space-y-8 min-w-0">
              <div className="theme-surface rounded-2xl p-8 border backdrop-blur-md">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[var(--app-accent)]" />
                  Capsule Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium theme-muted mb-3">Capsule Name</label>
                    <input
                      type="text"
                      value={capsuleName}
                      onChange={(event) => setCapsuleName(event.target.value)}
                      placeholder="e.g., Summer Memories 2024"
                      className="theme-input w-full rounded-xl px-4 py-3 text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-muted mb-3">Description</label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Tell the story of this capsule..."
                      rows={4}
                      className="theme-input w-full rounded-xl px-4 py-3 text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-muted mb-3">Mood / Feeling</label>
                    <div className="flex flex-wrap gap-3">
                      {moods.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setMood(item)}
                          className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all border",
                            mood === item
                              ? "bg-[var(--app-accent)] text-white border-[var(--app-accent)]"
                              : "theme-surface text-[var(--app-muted)] border-[var(--app-border-soft)] hover:text-[var(--app-text)]"
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="theme-surface rounded-2xl p-8 border backdrop-blur-md">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[var(--app-accent)]" />
                  When to Unlock
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium theme-muted mb-3">Unlock Date</label>
                    <input
                      type="date"
                      value={unlocksDate}
                      onChange={(event) => setUnlocksDate(event.target.value)}
                      className="theme-input w-full rounded-xl px-4 py-3 text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-muted mb-3">Unlock Time (Optional)</label>
                    <input
                      type="time"
                      value={unlocksTime}
                      onChange={(event) => setUnlocksTime(event.target.value)}
                      className="theme-input w-full rounded-xl px-4 py-3 text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                    />
                  </div>
                </div>
              </div>

              <div className="theme-surface rounded-2xl p-8 border backdrop-blur-md">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <Plus className="w-5 h-5 text-[var(--app-accent)]" />
                  Add Memories
                </h2>

                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="flex items-center justify-center gap-3 bg-gradient-to-br from-[#7919e6] to-[#a855f7] hover:from-[#6a15cc] hover:to-[#9333ea] rounded-xl py-4 font-medium transition-all shadow-lg text-white"
                  >
                    <Image className="w-5 h-5" />
                    Add Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(true)}
                    className="flex items-center justify-center gap-3 bg-gradient-to-br from-[#7919e6] to-[#a855f7] hover:from-[#6a15cc] hover:to-[#9333ea] rounded-xl py-4 font-medium transition-all shadow-lg text-white"
                  >
                    <FileText className="w-5 h-5" />
                    Add Note
                  </button>
                  <button
                    type="button"
                    onClick={handleRecordVoice}
                    className="flex items-center justify-center gap-3 bg-gradient-to-br from-[#7919e6] to-[#a855f7] hover:from-[#6a15cc] hover:to-[#9333ea] rounded-xl py-4 font-medium transition-all shadow-lg text-white"
                  >
                    <Mic className="w-5 h-5" />
                    {isRecording ? "Stop Recording" : "Add Voice"}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSong}
                    className="flex items-center justify-center gap-3 bg-gradient-to-br from-[#7919e6] to-[#a855f7] hover:from-[#6a15cc] hover:to-[#9333ea] rounded-xl py-4 font-medium transition-all shadow-lg text-white"
                  >
                    <Music className="w-5 h-5" />
                    Add Song
                  </button>
                </div>

                <div className="mb-6 grid md:grid-cols-[minmax(0,1fr)_220px] gap-4">
                  <div className="theme-surface-strong rounded-xl border border-[var(--app-border-soft)] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-[var(--app-accent)] mb-2">Recording Status</div>
                    <div className="text-sm theme-muted">
                      {isRecording ? "Recording in progress... speak now and click stop when you are done." : "Ready to record a voice note."}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium theme-muted mb-3">Microphone</label>
                    <select
                      value={selectedMicId}
                      onChange={(event) => setSelectedMicId(event.target.value)}
                      className="theme-input w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--app-accent)]"
                    >
                      {audioInputs.length === 0 && <option value="">Default microphone</option>}
                      {audioInputs.map((device, index) => (
                        <option key={device.deviceId || index} value={device.deviceId}>
                          {device.label || `Microphone ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {memories.length > 0 && (
                  <div className="space-y-4">
                    {memories.map((memory) => (
                      <div
                        key={memory.id}
                        className="theme-surface-strong border rounded-xl p-4 flex items-center gap-4 hover:bg-[var(--app-surface)] transition-all"
                      >
                        {memory.type === "photo" && memory.preview && (
                          <>
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={memory.preview} alt="Memory preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Image className="w-4 h-4 text-[var(--app-accent)]" />
                                <span className="font-medium">Photo Memory</span>
                              </div>
                              <p className="text-sm theme-muted">{memory.content}</p>
                            </div>
                          </>
                        )}
                        {memory.type === "text" && (
                          <>
                            <div className="w-12 h-12 rounded-lg bg-[var(--app-accent)]/20 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-[var(--app-accent)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">Text Note</span>
                              <p className="text-sm theme-muted line-clamp-2">{memory.content}</p>
                            </div>
                          </>
                        )}
                        {memory.type === "audio" && (
                          <>
                            <div className="w-12 h-12 rounded-lg bg-[var(--app-accent)]/20 flex items-center justify-center flex-shrink-0">
                              {memory.mediaKind === "song" ? <Music className="w-5 h-5 text-[var(--app-accent)]" /> : <Mic className="w-5 h-5 text-[var(--app-accent)]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">{memory.mediaKind === "song" ? "Song" : "Voice Memo"}</span>
                              <p className="text-sm theme-muted">{memory.content}</p>
                              {memory.preview && (
                                <audio controls className="mt-2 w-full max-w-[320px]">
                                  <source src={memory.preview} type={memory.file?.type} />
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

            <div className="space-y-8 lg:sticky lg:top-28">
              <div className="theme-surface rounded-2xl p-8 border backdrop-blur-md">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[var(--app-accent)]" />
                  Privacy
                </h3>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all",
                      isPrivate
                        ? "bg-[var(--app-accent)]/20 border-[var(--app-accent)] shadow-md"
                        : "theme-surface-strong border-[var(--app-border-soft)] hover:border-[var(--app-accent)]/50"
                    )}
                  >
                    <div className="font-medium mb-1">Private</div>
                    <div className="text-xs theme-muted">Only you can access this capsule.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all",
                      !isPrivate
                        ? "bg-[var(--app-accent)]/20 border-[var(--app-accent)] shadow-md"
                        : "theme-surface-strong border-[var(--app-border-soft)] hover:border-[var(--app-accent)]/50"
                    )}
                  >
                    <div className="font-medium mb-1">Collaborative</div>
                    <div className="text-xs theme-muted">Editors can contribute until you lock it. Viewers wait until unlock.</div>
                  </button>
                </div>
              </div>

              {!isPrivate && (
                <div className="theme-surface rounded-2xl p-8 border backdrop-blur-md">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                    <User className="w-5 h-5 text-[var(--app-accent)]" />
                    Invite People
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_120px_52px] gap-2 items-center">
                      <input
                        type="email"
                        value={newCollaborator}
                        onChange={(event) => setNewCollaborator(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && handleAddCollaborator()}
                        placeholder="Email address"
                        className="theme-input rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--app-accent)]"
                      />
                      <select
                        value={newRole}
                        onChange={(event) => setNewRole(event.target.value as "viewer" | "editor")}
                        className="theme-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--app-accent)] appearance-none"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCollaborator}
                        className="bg-[var(--app-accent)] hover:bg-[#6a15cc] rounded-xl h-[44px] transition-colors flex items-center justify-center text-white"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {members.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-[var(--app-border-soft)]">
                        {members.map((collaborator) => (
                          <div key={collaborator.email} className="theme-surface-strong flex items-center justify-between gap-3 p-3 rounded-lg transition-all">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm truncate">{collaborator.email}</div>
                              <div className="text-xs theme-muted capitalize">{collaborator.role}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCollaborator(collaborator.email)}
                              className="text-red-400 hover:text-red-300 text-sm hover:bg-red-500/10 px-2 py-1 rounded transition-all"
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

              <div className="theme-gradient rounded-2xl p-8 shadow-xl text-white">
                <h3 className="text-lg font-semibold mb-6">Capsule Summary</h3>

                <div className="space-y-4 text-sm mb-8">
                  <div>
                    <div className="text-white/80 mb-1">Name</div>
                    <div className="font-medium text-lg break-words">{capsuleName || "Unnamed"}</div>
                  </div>
                  <div>
                    <div className="text-white/80 mb-1">Unlocks</div>
                    <div className="font-medium">{unlocksDate || "Not set"}</div>
                  </div>
                  <div>
                    <div className="text-white/80 mb-1">Memories</div>
                    <div className="font-medium">{memories.length} item(s)</div>
                  </div>
                  <div>
                    <div className="text-white/80 mb-1">Type</div>
                    <div className="font-medium">{isPrivate ? "Private" : "Collaborative"}</div>
                  </div>
                  {!isPrivate && (
                    <div>
                      <div className="text-white/80 mb-1">Invites</div>
                      <div className="font-medium">{members.length} collaborator(s)</div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleCreateCapsule}
                  disabled={!capsuleName.trim() || !unlocksDate || isSubmitting}
                  className="w-full bg-white text-[var(--app-accent)] hover:bg-white/90 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xl"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Creating..." : "Create Capsule"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
