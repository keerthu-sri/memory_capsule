import { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "../../components/layout/Layout";
import { MiniNotice } from "../../components/ui/MiniNotice";
import {
  User,
  Mail,
  ShieldCheck,
  Key,
  Camera,
  Check,
  X,
  Phone,
  Cake,
  Sparkles,
  Heart,
  Settings,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { getProfile, type ProfileData, updateProfile } from "../../services/auth";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  hobbies: "",
  interests: "",
  avatar: "",
};

export const Profile = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [editForm, setEditForm] = useState(emptyProfile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    void fetchProfile();
  }, []);

  const syncLocalProfile = (data: ProfileData) => {
    localStorage.setItem("userEmail", data.email || "");
    localStorage.setItem("userName", data.name || "");
    localStorage.setItem("userAvatar", data.avatar || "");
  };

  const hydrateForm = (data: ProfileData) => {
    setEditForm({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      age: data.age ? String(data.age) : "",
      gender: data.gender || "",
      hobbies: (data.hobbies || []).join(", "),
      interests: (data.interests || []).join(", "),
      avatar: data.avatar || "",
    });
  };

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data);
      hydrateForm(data);
      syncLocalProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  const avatarPreview = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    return editForm.avatar || profile?.avatar || "https://i.pravatar.cc/300?img=33";
  }, [avatarFile, editForm.avatar, profile?.avatar]);

  useEffect(() => {
    return () => {
      if (avatarFile) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarFile, avatarPreview]);

  const detailChips = [
    profile?.gender || "Private",
    profile?.phone || "No phone added",
    profile?.age ? `${profile.age} years` : "Age not shared",
  ];

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = new FormData();
      payload.append("name", editForm.name);
      payload.append("email", editForm.email);
      payload.append("phone", editForm.phone);
      payload.append("age", editForm.age);
      payload.append("gender", editForm.gender);
      payload.append("hobbies", JSON.stringify(editForm.hobbies.split(",").map((item) => item.trim()).filter(Boolean)));
      payload.append("interests", JSON.stringify(editForm.interests.split(",").map((item) => item.trim()).filter(Boolean)));
      if (avatarFile) payload.append("avatar", avatarFile);

      const { data } = await updateProfile(payload);
      setProfile(data);
      hydrateForm(data);
      syncLocalProfile(data);
      setAvatarFile(null);
      setIsEditing(true);
      setNotice({ message: "Profile updated successfully.", variant: "success" });
    } catch (err: any) {
      setNotice({ message: err?.response?.data?.message || "Failed to update profile", variant: "error" });
    } finally {
      setIsSaving(false);
      window.setTimeout(() => setNotice(null), 2600);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    hydrateForm(profile);
    setAvatarFile(null);
    setIsEditing(true);
  };

  return (
    <Layout>
      <MiniNotice open={Boolean(notice)} message={notice?.message || ""} variant={notice?.variant || "success"} />
      <div className="mx-auto max-w-6xl space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-white">Vault Identity</h1>

        {profile ? (
          <>
            <div className="grid gap-8 rounded-[34px] border border-[#ffffff10] bg-[#ffffff05] p-8 shadow-2xl backdrop-blur-md lg:grid-cols-[1.4fr_280px]">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="relative shrink-0">
                  <div className="h-36 w-36 overflow-hidden rounded-[32px] border-4 border-[#7919e6] shadow-[0_0_35px_rgba(121,25,230,0.5)]">
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-4 -right-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#0a0a1a] bg-[#7919e6] text-white transition-transform hover:scale-105"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setAvatarFile(file);
                    }}
                  />
                </div>

                <div className="flex-1">
                  <h2 className="flex items-center gap-2 text-4xl font-bold text-white">
                    {profile.name}
                    <ShieldCheck className="h-7 w-7 text-[#a855f7]" />
                  </h2>
                  <div className="mt-4 flex flex-col gap-3 text-slate-400">
                    <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> {profile.email}</span>
                    <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Member since {memberSince}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {detailChips.map((chip) => (
                      <span key={chip} className="rounded-full border border-[#ffffff10] bg-[#0f172a80] px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#d7b8ff]">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-3xl border border-[#33415540] bg-[#0a0a1a] p-6 text-center">
                <span className="mb-2 text-xs font-bold uppercase tracking-widest text-[#a855f7]">Vault Level</span>
                <span className="text-5xl font-black text-white">4</span>
                <span className="mt-2 text-xs text-slate-500">Master<br />Archivist</span>
              </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[30px] border border-[#ffffff10] bg-[#ffffff05] p-8 backdrop-blur-md">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold uppercase tracking-wider text-white">
                    <User className="text-[#a855f7]" /> Personal Details
                  </h3>
                  {isEditing ? (
                    <button onClick={handleCancel} className="text-red-400 transition-colors hover:text-red-300">
                      <X className="h-5 w-5" />
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-[#33415580] bg-[#0f172a80] px-4 py-3 text-white outline-none transition-all disabled:opacity-90"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-[#33415580] bg-[#0f172a80] px-4 py-3 text-white outline-none transition-all disabled:opacity-90"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-[#33415580] bg-[#0f172a80] px-4 py-3 text-white outline-none transition-all disabled:opacity-90"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500">Age</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-[#33415580] bg-[#0f172a80] px-4 py-3 text-white outline-none transition-all disabled:opacity-90"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-[#33415580] bg-[#0f172a80] px-4 py-3 text-white outline-none transition-all disabled:opacity-90"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500">Hobbies</label>
                    <input
                      type="text"
                      value={editForm.hobbies}
                      onChange={(e) => setEditForm({ ...editForm, hobbies: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Photography, journaling, music"
                      className="w-full rounded-xl border border-[#33415580] bg-[#0f172a80] px-4 py-3 text-white outline-none transition-all disabled:opacity-90"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500">Interests</label>
                    <input
                      type="text"
                      value={editForm.interests}
                      onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Travel, cinema, memory keeping"
                      className="w-full rounded-xl border border-[#33415580] bg-[#0f172a80] px-4 py-3 text-white outline-none transition-all disabled:opacity-90"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-[#7919e6] text-white hover:bg-[#8b5cf6]">
                        {isSaving ? "Saving..." : <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Save Identity</span>}
                      </Button>
                      <Button onClick={handleCancel} className="flex-1 border border-[#7919e6] bg-transparent text-[#d7b8ff] hover:bg-[#7919e6] hover:text-white">
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="w-full border border-[#7919e6] bg-transparent text-[#d7b8ff] hover:bg-[#7919e6] hover:text-white">
                      Update Identity
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="rounded-[30px] border border-[#ffffff10] bg-[#ffffff05] p-8 backdrop-blur-md">
                  <h3 className="mb-6 flex items-center gap-2 text-lg font-bold uppercase tracking-wider text-white">
                    <Key className="text-[#a855f7]" /> Security & Access
                  </h3>
                  <p className="mb-6 text-sm leading-7 text-slate-300">
                    Your digital sanctuary is protected by end-to-end encryption. Profile identity details stay attached to your account so your vault feels truly yours.
                  </p>
                  <div className="space-y-4">
                    <Button className="flex w-full items-center justify-between rounded-xl border border-[#33415580] bg-[#0f172a80] px-4 py-6 text-white hover:border-[#7919e6]">
                      Change Access Key <Settings className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button className="flex w-full items-center justify-between rounded-xl border border-[#33415580] bg-[#0f172a80] px-4 py-6 text-white hover:border-[#7919e6]">
                      Two-Factor Authentication <ShieldCheck className="h-4 w-4 text-green-400" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-[30px] border border-[#ffffff10] bg-[#ffffff05] p-8 backdrop-blur-md">
                  <h3 className="mb-6 flex items-center gap-2 text-lg font-bold uppercase tracking-wider text-white">
                    <Heart className="text-[#a855f7]" /> Passions Snapshot
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <div className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500">Hobbies</div>
                      <div className="flex flex-wrap gap-2">
                        {(profile.hobbies?.length ? profile.hobbies : ["Add your hobbies in edit mode"]).map((item) => (
                          <span key={item} className="rounded-full border border-[#7919e6]/30 bg-[#7919e6]/10 px-3 py-2 text-sm text-[#d7b8ff]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500">Interests</div>
                      <div className="flex flex-wrap gap-2">
                        {(profile.interests?.length ? profile.interests : ["Add your interests in edit mode"]).map((item) => (
                          <span key={item} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-[#ffffff10] bg-[#0f172a80] p-4">
                        <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">Phone</div>
                        <div className="flex items-center gap-2 text-white"><Phone className="h-4 w-4 text-[#a855f7]" /> {profile.phone || "Not added"}</div>
                      </div>
                      <div className="rounded-2xl border border-[#ffffff10] bg-[#0f172a80] p-4">
                        <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">Age</div>
                        <div className="flex items-center gap-2 text-white"><Cake className="h-4 w-4 text-[#a855f7]" /> {profile.age || "Unknown"}</div>
                      </div>
                      <div className="rounded-2xl border border-[#ffffff10] bg-[#0f172a80] p-4">
                        <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">Gender</div>
                        <div className="flex items-center gap-2 text-white"><User className="h-4 w-4 text-[#a855f7]" /> {profile.gender || "Private"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-48 items-center justify-center text-white">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#7919e6]"></div>
          </div>
        )}
      </div>
    </Layout>
  );
};
