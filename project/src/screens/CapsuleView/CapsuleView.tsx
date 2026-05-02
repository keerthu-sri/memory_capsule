import {
  ChevronDown,
  Image as ImageIcon,
  Lock,
  Mic,
  Music,
  Pause,
  Play,
  Send,
  SkipBack,
  SkipForward,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import { ThemeToggle } from "../../components/theme/ThemeToggle";
import { MiniNotice } from "../../components/ui/MiniNotice";
import { startWavRecording, type WavRecordingSession } from "../../lib/wavRecorder";
import {
  addCapsuleMemories,
  getCapsule,
  lockCapsule,
  type Capsule,
  type CapsuleMemoryItem,
} from "../../services/capsule";

const buildAssetUrl = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${import.meta.env.VITE_API_URL}/${value.replace(/\\/g, "/")}`;
};

const getUserLabel = (value?: string | { _id?: string; id?: string; name?: string; email?: string }) => {
  if (!value) return "Unknown";
  return typeof value === "string" ? value : value.name || value.email || value._id || value.id || "Unknown";
};

export const CapsuleView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const songInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const wavRecorderRef = useRef<WavRecordingSession | null>(null);

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAudio, setActiveAudio] = useState<string>("");
  const [newNote, setNewNote] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [pendingAudio, setPendingAudio] = useState<File | null>(null);
  const [pendingAudioKind, setPendingAudioKind] = useState<"voice" | "song">("voice");
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [notice, setNotice] = useState<{ message: string; variant: "info" | "success" | "error" } | null>(null);
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState("");
  const [pendingAudioPreview, setPendingAudioPreview] = useState("");
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState("");

  const showNotice = (message: string, variant: "info" | "success" | "error" = "info") => {
    setNotice({ message, variant });
    window.setTimeout(() => setNotice((current) => (current?.message === message ? null : current)), 2600);
  };

  const loadCapsule = async () => {
    if (!id) return;

    try {
      const response = await getCapsule(id);
      setCapsule(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void loadCapsule();
  }, [id]);

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

  useEffect(() => {
    if (!id) return;

    socketRef.current = io(`${import.meta.env.VITE_API_URL}`);
    socketRef.current.emit("joinCapsule", id);
    socketRef.current.on("capsuleUpdated", (payload: { capsuleId?: string }) => {
      if (payload?.capsuleId === id) {
        void loadCapsule();
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id]);

  const mediaItems = capsule?.memories ?? [];
  const photoItems = mediaItems.filter((item) => item.type === "photo");
  const textItems = mediaItems.filter((item) => item.type === "text");
  const audioItems = mediaItems.filter((item) => item.type === "audio");

  const canEdit = capsule?.canEdit ?? false;
  const canLock = capsule?.canLock ?? false;
  const canViewContent = capsule?.canViewContent ?? false;
  const currentRole = capsule?.currentUserRole;

  useEffect(() => {
    if (!canViewContent || audioItems.length === 0 || activeAudio || !audioRef.current) return;

    const first = buildAssetUrl(audioItems[0].preview);
    if (!first) return;

    audioRef.current.src = first;
    setActiveAudio(first);
  }, [audioItems, activeAudio, canViewContent]);

  useEffect(() => {
    if (!pendingPhoto) {
      setPendingPhotoPreview("");
      return;
    }

    const url = URL.createObjectURL(pendingPhoto);
    setPendingPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingPhoto]);

  useEffect(() => {
    if (!pendingAudio) {
      setPendingAudioPreview("");
      return;
    }

    const url = URL.createObjectURL(pendingAudio);
    setPendingAudioPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingAudio]);

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
    if (!audioRef.current || !activeAudio) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      void audioRef.current.play();
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingPhoto(file);
    showNotice("Photo ready to preview and save.", "info");
  };

  const handleSongSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("audio/")) return;

    setPendingAudio(file);
    setPendingAudioKind("song");
    showNotice("Song ready to preview and save.", "info");
  };

  const handleRecordVoice = async () => {
    if (isRecording && wavRecorderRef.current) {
      const result = await wavRecorderRef.current.stop();
      wavRecorderRef.current = null;
      setIsRecording(false);
      setPendingAudio(result.file);
      setPendingAudioKind("voice");
      showNotice("Voice note ready. Use the preview player to check volume before saving.", "success");
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

  const resetDrafts = () => {
    setNewNote("");
    setPendingPhoto(null);
    setPendingAudio(null);
    setPendingAudioKind("voice");
    if (uploadInputRef.current) uploadInputRef.current.value = "";
    if (songInputRef.current) songInputRef.current.value = "";
  };

  const handleSaveContribution = async () => {
    if (!id) return;
    if (!newNote.trim() && !pendingPhoto && !pendingAudio) {
      showNotice("Add a note, photo, voice note, or song first.", "error");
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      if (newNote.trim()) {
        formData.append("textMemories", JSON.stringify([newNote.trim()]));
      }
      if (pendingPhoto) {
        formData.append("image", pendingPhoto);
      }
      if (pendingAudio) {
        formData.append(pendingAudioKind === "song" ? "song" : "audio", pendingAudio);
      }

      const response = await addCapsuleMemories(id, formData);
      setCapsule(response.data);
      resetDrafts();
      showNotice("Changes saved to the capsule.", "success");
    } catch (error) {
      console.error(error);
      showNotice("Unable to update this capsule.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLockCapsule = async () => {
    if (!id) return;

    try {
      setIsLocking(true);
      const response = await lockCapsule(id);
      setCapsule(response.data);
      showNotice("Capsule locked.", "success");
    } catch (error) {
      console.error(error);
      showNotice("Unable to lock this capsule.", "error");
    } finally {
      setIsLocking(false);
    }
  };

  const roleLabel = useMemo(() => {
    if (currentRole === "owner") return "Creator";
    if (currentRole === "editor") return "Editor";
    if (currentRole === "viewer") return "Viewer";
    return "Pending Invite";
  }, [currentRole]);

  const hiddenMessage = useMemo(() => {
    if (currentRole === "viewer") return "This capsule stays hidden for viewers until it unlocks.";
    if (!currentRole) return "Accept the invite from Shared Sanctuary to join this capsule.";
    return "This capsule is still sealed.";
  }, [currentRole]);

  const collaboratorList = useMemo(() => {
    if (!capsule) return [];

    const ownerLabel = getUserLabel(capsule.userId);
    const acceptedMembers = (capsule.members || []).map((member) => ({
      key: `${typeof member.user === "string" ? member.user : member.user?._id || member.user?.id || member.user?.email}`,
      label: getUserLabel(member.user),
      role: member.role,
      status: member.status || "accepted",
    }));

    return [
      { key: "owner", label: ownerLabel, role: "owner", status: "accepted" },
      ...acceptedMembers,
    ];
  }, [capsule]);

  return (
    <div className="theme-shell min-h-screen relative overflow-hidden pb-32">
      <MiniNotice open={Boolean(notice)} message={notice?.message || ""} variant={notice?.variant || "info"} />
      <div className="absolute top-6 right-6 text-right z-10 flex items-center gap-4">
        <ThemeToggle />
        <div>
          <div className="theme-muted text-xs tracking-wider mb-1">SESSION ID: #{id?.substring(0, 8) || "C94-MEM"}</div>
          <div className="theme-subtle text-xs">ROLE: {roleLabel}</div>
        </div>
      </div>

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        <div className="theme-overlay" />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[var(--app-accent)] rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-[var(--app-accent)] rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-80 w-64 h-64 rounded-full opacity-20 bg-[var(--app-accent)] blur-3xl" />
      </div>

      <div className="relative px-6 lg:px-12 py-20 min-h-screen">
        <div className="max-w-7xl mx-auto grid xl:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
          <div className="min-w-0">
            {canEdit && (
              <div className="mb-10 theme-surface border rounded-3xl p-5 md:p-6 backdrop-blur-md">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
                  <div>
                    <div className="text-xs text-[var(--app-accent)] uppercase tracking-[0.3em] mb-2">Collaborative Editing</div>
                    <h2 className="text-2xl font-bold">Add your contribution</h2>
                  </div>
                  {capsule?.isLocked && (
                    <span className="text-xs uppercase tracking-widest theme-muted border border-[var(--app-border-soft)] rounded-full px-3 py-1">
                      Locked
                    </span>
                  )}
                </div>

                <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-5 items-start">
                  <textarea
                    value={newNote}
                    onChange={(event) => setNewNote(event.target.value)}
                    rows={5}
                    placeholder="Add a note to this shared capsule..."
                    className="theme-input min-h-[220px] w-full rounded-2xl px-4 py-3 placeholder-[var(--app-subtle)] focus:outline-none focus:border-[var(--app-accent)] resize-none"
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <input ref={uploadInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                    <input ref={songInputRef} type="file" accept="audio/*" onChange={handleSongSelect} className="hidden" />
                    <button
                      type="button"
                      onClick={() => uploadInputRef.current?.click()}
                      className="theme-input w-full rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 hover:border-[var(--app-accent)]"
                    >
                      <Upload className="w-4 h-4" />
                      {pendingPhoto ? "Photo ready" : "Add photo"}
                    </button>
                    <button
                      type="button"
                      onClick={handleRecordVoice}
                      className="theme-input w-full rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 hover:border-[var(--app-accent)]"
                    >
                      <Mic className="w-4 h-4" />
                      {isRecording ? "Stop recording" : pendingAudio && pendingAudioKind === "voice" ? "Voice ready" : "Add voice"}
                    </button>
                    <button
                      type="button"
                      onClick={() => songInputRef.current?.click()}
                      className="theme-input w-full rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 hover:border-[var(--app-accent)]"
                    >
                      <Music className="w-4 h-4" />
                      {pendingAudio && pendingAudioKind === "song" ? "Song ready" : "Add song"}
                    </button>
                    <select
                      value={selectedMicId}
                      onChange={(event) => setSelectedMicId(event.target.value)}
                      className="theme-input w-full rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--app-accent)]"
                    >
                      {audioInputs.length === 0 && <option value="">Default microphone</option>}
                      {audioInputs.map((device, index) => (
                        <option key={device.deviceId || index} value={device.deviceId}>
                          {device.label || `Microphone ${index + 1}`}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleSaveContribution}
                      disabled={isSaving}
                      className="w-full rounded-2xl bg-[var(--app-accent)] hover:bg-[#6a15cc] px-4 py-2.5 flex items-center justify-center gap-2 text-white"
                    >
                      <Send className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-sm theme-muted">
                  Editors can keep adding photos, voice notes, and songs until the creator locks the capsule.
                </div>

                {(newNote.trim() || pendingPhoto || pendingAudio) && (
                  <div className="mt-5 theme-surface-strong rounded-2xl border border-[var(--app-border-soft)] p-4">
                    <div className="mb-3 text-xs uppercase tracking-[0.25em] text-[var(--app-accent)]">Preview Before Save</div>
                    <div className="space-y-4">
                      {newNote.trim() && (
                        <div className="rounded-xl border border-[var(--app-border-soft)] px-4 py-3">
                          <div className="mb-1 text-sm font-medium">Pending note</div>
                          <div className="theme-muted text-sm whitespace-pre-wrap">{newNote}</div>
                        </div>
                      )}
                      {pendingPhoto && (
                        <div className="rounded-xl border border-[var(--app-border-soft)] p-3">
                          <div className="mb-2 text-sm font-medium">Pending image</div>
                          <img src={pendingPhotoPreview} alt="Pending upload preview" className="h-32 w-full rounded-xl object-cover" />
                        </div>
                      )}
                      {pendingAudio && (
                        <div className="rounded-xl border border-[var(--app-border-soft)] px-4 py-3">
                          <div className="mb-2 text-sm font-medium">Pending {pendingAudioKind === "song" ? "song" : "voice note"}</div>
                          <div className="mb-2 text-sm theme-muted">{pendingAudio.name}</div>
                          <audio controls className="w-full">
                            <source src={pendingAudioPreview} type={pendingAudio.type} />
                          </audio>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!canViewContent ? (
              <div className="theme-surface border rounded-3xl p-12 text-center">
                <Lock className="w-12 h-12 text-[var(--app-accent)] mx-auto mb-5" />
                <h1 className="text-4xl font-serif mb-4">Capsule Locked</h1>
                <p className="theme-muted max-w-xl mx-auto">{hiddenMessage}</p>
                <div className="mt-6 text-sm theme-subtle">
                  Unlock date: {capsule?.unlockDate ? new Date(capsule.unlockDate).toLocaleString() : "Unknown"}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-12 flex justify-center">
                  {photoItems.length > 0 ? (
                    <div className="grid w-full max-w-5xl grid-cols-1 justify-items-center gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {photoItems.map((item: CapsuleMemoryItem, index) => {
                        const src = buildAssetUrl(item.preview);
                        return (
                          <div
                            key={`${src}-${index}`}
                            className="relative h-56 w-full max-w-xs overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl group"
                          >
                            {src ? (
                              <img src={src} alt={item.content || "Capsule memory"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center theme-muted">
                                <ImageIcon className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-full max-w-3xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-12 text-center theme-muted">
                      No photos added in this capsule.
                    </div>
                  )}
                </div>

                <div className="text-center mb-12">
                  <div className="theme-surface-strong backdrop-blur-md border rounded-2xl p-8 inline-block shadow-lg max-w-3xl">
                    <p className="text-[var(--app-accent-2)] text-2xl italic font-serif leading-relaxed px-8">
                      {capsule?.message || "No message saved in this capsule."}
                    </p>
                  </div>
                </div>

                {textItems.length > 0 && (
                  <div className="mb-10 space-y-3">
                    {textItems.map((item, index) => (
                      <div key={`${item.content}-${index}`} className="theme-surface border rounded-xl p-6 shadow-md">
                        {item.content}
                      </div>
                    ))}
                  </div>
                )}

                {audioItems.length > 0 && (
                  <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {audioItems.map((item, index) => {
                      const src = buildAssetUrl(item.preview);
                      const isSong = item.mediaKind === "song";
                      return (
                        <div
                          key={`${src}-${index}`}
                          className="theme-surface border rounded-2xl p-6 flex h-full flex-col gap-4 shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--app-accent)]/20 flex items-center justify-center shrink-0">
                              {isSong ? <Music className="w-5 h-5 text-[var(--app-accent)]" /> : <Mic className="w-5 h-5 text-[var(--app-accent)]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-medium block">{isSong ? `Song ${index + 1}` : `Recorded Audio Memory ${index + 1}`}</span>
                              <span className="text-sm theme-muted break-all">{item.content}</span>
                            </div>
                          </div>
                          <div className="mt-auto space-y-4">
                            <button
                              type="button"
                              onClick={() => src && toggleAudio(src)}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] px-4 py-3 text-sm font-semibold tracking-wider uppercase text-[var(--app-accent)] transition-all hover:bg-[var(--app-accent)] hover:text-white"
                            >
                              {activeAudio === src && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              {activeAudio === src && isPlaying ? "Pause" : "Play"}
                            </button>
                            <audio controls preload="metadata" className="w-full">
                              <source src={src} />
                            </audio>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            <div className="text-center mb-16 mt-20">
              <div className="mb-6">
                <div className="text-sm theme-muted mb-2 italic">
                  Unlock date: {capsule?.unlockDate ? new Date(capsule.unlockDate).toLocaleString() : "Unknown"}
                </div>
                <h1 className="text-5xl md:text-6xl font-serif mb-5 tracking-widest">
                  {canViewContent ? "CAPSULE RELEASED" : "CAPSULE LOCKED"}
                </h1>
                <div className="text-[var(--app-accent)] text-sm font-bold tracking-widest uppercase">
                  {capsule?.title || "VAULT"} • {capsule?.mood || "No mood"}
                </div>
              </div>
              <p className="theme-muted italic text-lg">
                {canViewContent ? "A promise for the future." : "This capsule is still sealed."}
              </p>
            </div>

            {canLock && (
              <div className="flex justify-center mb-10">
                <button
                  onClick={handleLockCapsule}
                  disabled={isLocking}
                  className="px-6 py-3 bg-[var(--app-accent)] hover:bg-[#6a15cc] rounded-xl text-white"
                >
                  {isLocking ? "Locking..." : "Lock Capsule"}
                </button>
              </div>
            )}

            <div className="flex items-center justify-center mb-12">
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center gap-3 theme-surface-strong backdrop-blur-md border hover:border-[var(--app-accent)] rounded-full px-8 py-4 transition-all"
              >
                <span className="font-medium">Close Vault</span>
                <ChevronDown className="w-5 h-5 group-hover:rotate-180 transition-transform" />
              </button>
            </div>
          </div>

          <aside className="theme-surface border rounded-3xl p-6 backdrop-blur-md xl:sticky xl:top-28">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-[var(--app-accent)]" />
              <h3 className="text-xl font-semibold">Collaborators</h3>
            </div>

            <div className="space-y-3">
              {collaboratorList.map((person) => (
                <div key={person.key} className="theme-surface-strong rounded-2xl border border-[var(--app-border-soft)] px-4 py-3">
                  <div className="font-medium break-all">{person.label}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.22em] theme-muted">
                    {person.role} • {person.status}
                  </div>
                </div>
              ))}
            </div>

            {!!capsule?.invites?.length && (
              <div className="mt-6 pt-6 border-t border-[var(--app-border-soft)]">
                <div className="mb-3 text-xs uppercase tracking-[0.24em] theme-muted">Pending Invites</div>
                <div className="space-y-3">
                  {capsule.invites.map((invite, index) => (
                    <div key={`${invite.email}-${index}`} className="theme-surface-strong rounded-2xl border border-[var(--app-border-soft)] px-4 py-3">
                      <div className="font-medium break-all">{invite.email}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.22em] theme-muted">{invite.role} • pending</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {audioItems.length > 0 && canViewContent && (
        <div className="fixed bottom-0 left-0 right-0 theme-header border-t border-[var(--app-border-soft)] p-6 z-20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[#1e102e] to-[#2d1b45] border border-[var(--app-border)] flex items-center justify-center">
                <Music className="w-6 h-6 text-[#d7b8ff]" />
              </div>
              <div>
                <div className="font-semibold truncate max-w-xs">{capsule?.title || "Audio Experience"}</div>
                <div className="theme-muted text-sm tracking-wide">{capsule?.mood || "Ambient Resonance"}</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="theme-muted hover:text-[var(--app-text)] transition-colors">
                <SkipBack className="w-5 h-5" fill="currentColor" />
              </button>
              <button
                onClick={handleBottomPlayToggle}
                className="w-12 h-12 rounded-full bg-[var(--app-accent)] hover:bg-[#6a15cc] flex items-center justify-center transition-all hover:scale-105 shadow-[0_0_15px_rgba(121,25,230,0.4)] text-white"
              >
                {isPlaying ? <Pause className="w-5 h-5" fill="white" /> : <Play className="w-5 h-5" fill="white" />}
              </button>
              <button className="theme-muted hover:text-[var(--app-text)] transition-colors">
                <SkipForward className="w-5 h-5" fill="currentColor" />
              </button>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-xs theme-muted tracking-widest uppercase font-bold">Playback Engine</span>
              <span className="text-sm font-semibold text-[var(--app-accent-2)]">Media Stream Engaged</span>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} className="hidden" />
    </div>
  );
};
