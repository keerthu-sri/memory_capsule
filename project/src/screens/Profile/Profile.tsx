import { useEffect, useState } from "react";
import { Layout } from "../../components/layout/Layout";
import { User, Mail, ShieldCheck, Key, Settings, Sparkles, Edit2, Check, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { getProfile, updateProfile } from "../../services/auth";

export const Profile = () => {
  const [profile, setProfile] = useState<{name: string, email: string, createdAt: string} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setProfile({ name: data.name, email: data.email, createdAt: data.createdAt });
      setEditForm({ name: data.name, email: data.email });
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data } = await updateProfile({ name: editForm.name, email: editForm.email });
      setProfile({ name: data.name, email: data.email, createdAt: data.createdAt });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-8 text-white tracking-tight">Vault Identity</h1>
        
        {profile ? (
          <>
            <div className="bg-[#ffffff05] border border-[#ffffff10] rounded-3xl p-8 backdrop-blur-md shadow-2xl flex items-center gap-8">
               <div className="relative">
                 <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#7919e6] shadow-[0_0_30px_rgba(121,25,230,0.5)]">
                   <img src="https://i.pravatar.cc/150?img=33" alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 <button className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#7919e6] rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-4 border-[#0a0a1a]">
                    <Settings className="w-5 h-5 text-white" />
                 </button>
               </div>
               
               <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                     {profile.name} <ShieldCheck className="text-[#a855f7] w-6 h-6" />
                  </h2>
                  <div className="flex flex-col gap-2 mt-4 text-slate-400">
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {profile.email}</span>
                    <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Member since {memberSince}</span>
                  </div>
               </div>
               
               <div className="flex flex-col items-center justify-center bg-[#0a0a1a] p-6 rounded-2xl border border-[#33415540]">
                  <span className="text-xs uppercase tracking-widest text-[#a855f7] font-bold mb-2">Vault Level</span>
                  <span className="text-4xl font-black text-white">4</span>
                  <span className="text-xs text-slate-500 mt-2 text-center">Master<br/>Archivist</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8">
               <div className="bg-[#ffffff05] border border-[#ffffff10] rounded-3xl p-8 backdrop-blur-md">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                     <User className="text-[#a855f7]" /> Personal Details
                   </h3>
                   {!isEditing ? (
                     <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-white transition-colors">
                       <Edit2 className="w-4 h-4" />
                     </button>
                   ) : (
                     <button onClick={() => { setIsEditing(false); setEditForm({ name: profile.name, email: profile.email }); }} className="text-red-400 hover:text-red-300 transition-colors">
                       <X className="w-5 h-5" />
                     </button>
                   )}
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-xs text-slate-500 uppercase tracking-widest">Full Name</label>
                       {isEditing ? (
                         <input 
                           type="text" 
                           value={editForm.name} 
                           onChange={e => setEditForm({...editForm, name: e.target.value})} 
                           className="w-full bg-[#0f172a80] rounded-xl px-4 py-3 border border-[#7919e6] focus:outline-none text-white focus:shadow-[0_0_10px_#7919e6] transition-all"
                         />
                       ) : (
                         <div className="bg-[#0f172a80] rounded-xl px-4 py-3 border border-[#33415580] text-white">{profile.name}</div>
                       )}
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs text-slate-500 uppercase tracking-widest">Email Address</label>
                       {isEditing ? (
                         <input 
                           type="email" 
                           value={editForm.email} 
                           onChange={e => setEditForm({...editForm, email: e.target.value})} 
                           className="w-full bg-[#0f172a80] rounded-xl px-4 py-3 border border-[#7919e6] focus:outline-none text-white focus:shadow-[0_0_10px_#7919e6] transition-all"
                         />
                       ) : (
                         <div className="bg-[#0f172a80] rounded-xl px-4 py-3 border border-[#33415580] text-white">{profile.email}</div>
                       )}
                    </div>
                    {isEditing ? (
                      <Button onClick={handleSave} disabled={isSaving} className="w-full mt-4 bg-[#7919e6] text-white hover:bg-[#a855f7] transition-colors flex items-center justify-center gap-2">
                        {isSaving ? "Saving..." : <><Check className="w-4 h-4" /> Save Identity</>}
                      </Button>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} className="w-full mt-4 bg-transparent border border-[#7919e6] text-[#7919e6] hover:bg-[#7919e6] hover:text-white transition-colors">
                        Update Identity
                      </Button>
                    )}
                 </div>
               </div>
               
               <div className="bg-[#ffffff05] border border-[#ffffff10] rounded-3xl p-8 backdrop-blur-md">
                 <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                   <Key className="text-[#a855f7]" /> Security & Access
                 </h3>
                 <div className="space-y-6">
                    <div>
                       <p className="text-sm text-slate-300 mb-4">Your digital sanctuary is protected by end-to-end encryption. Only you have the access keys.</p>
                    </div>
                    <div className="space-y-4">
                       <Button className="w-full justify-between items-center bg-[#0f172a80] border border-[#33415580] rounded-xl px-4 py-6 text-white hover:border-[#7919e6]">
                          Change Access Key <Settings className="w-4 h-4 text-slate-400" />
                       </Button>
                       <Button className="w-full justify-between items-center bg-[#0f172a80] border border-[#33415580] rounded-xl px-4 py-6 text-white hover:border-[#7919e6]">
                          Two-Factor Authentication <ShieldCheck className="w-4 h-4 text-green-400" />
                       </Button>
                    </div>
                 </div>
               </div>
            </div>
          </>
        ) : (
          <div className="text-white flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7919e6]"></div>
          </div>
        )}
      </div>
    </Layout>
  );
};
