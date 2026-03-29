import { Layout } from "../../components/layout/Layout";
import { PageHeader } from "../../components/layout/PageHeader";
import { Users, Lock, Clock, Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getCapsules, inviteCollaborator, type Capsule } from "../../services/capsule";

export const SharedSanctuary = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [capsules, setCapsules] = useState<Capsule[]>([]);

  useEffect(() => {
    void refreshCapsules();
  }, []);

  const refreshCapsules = async () => {
    try {
      const res = await getCapsules();
      setCapsules(res.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const sharedVaults = useMemo(
    () =>
      capsules
        .filter((capsule) => !capsule.isPrivate || (capsule.members?.length ?? 0) > 0)
        .filter((capsule) => {
          const q = (searchParams.get("q") || "").toLowerCase();
          if (!q) return true;
          return (
            capsule.title.toLowerCase().includes(q) ||
            (capsule.message || "").toLowerCase().includes(q) ||
            (capsule.members || []).some((m) => m.email.toLowerCase().includes(q))
          );
        }),
    [capsules, searchParams]
  );

  const getLastActivity = (createdAt?: string) => {
    if (!createdAt) return "recently";
    const diff = Date.now() - new Date(createdAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const handleInvite = async (capsuleId: string) => {
    const email = window.prompt("Enter collaborator email");
    if (!email || !email.trim()) return;
    const roleInput = window.prompt("Enter role (viewer/editor)", "viewer");
    const role = roleInput === "editor" ? "editor" : "viewer";

    try {
      const res = await inviteCollaborator(capsuleId, email.trim(), role);
      const status = res.data?.deliveryStatus;
      if (status === "sent") {
        alert("Invitation email sent");
      } else if (status === "saved_email_failed") {
        alert("Invite saved, but email delivery failed. Configure SMTP to send email.");
      } else {
        alert("Invite saved successfully");
      }
      await refreshCapsules();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to invite collaborator");
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Shared Sanctuary"
        subtitle="Collaborative memory vaults with friends and family"
        searchPlaceholder="Search shared vaults..."
      />

      <div className="grid grid-cols-3 gap-8 mb-12">
        {sharedVaults.map((vault, idx) => (
          <div
            key={vault._id}
            onClick={() => navigate(`/capsule/${vault._id}`)}
            className="group bg-[#ffffff08] rounded-2xl overflow-hidden border border-[#7919e633] backdrop-blur-md hover:border-[#7919e6] transition-all cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#7919e6]/40 to-[#a855f7]/20 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />

              <div className="absolute top-4 right-4 bg-[#0a0a1a]/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 border border-[#7919e6]/30">
                <Users className="w-4 h-4 text-[#7919e6]" />
                <span className="text-xs text-white font-medium">{(vault.members?.length ?? 0) + 1} MEMBERS</span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-white font-semibold text-xl mb-4">{vault.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{vault.message || "Shared memory capsule"}</p>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {(vault.members ?? []).slice(0, 3).map((member, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-[#0a0a1a] relative group"
                      title={`${member.email} - ${member.role} (${member.status || 'pending'})`}
                    >
                      <img src={`https://i.pravatar.cc/150?img=${(idx * 7 + index) % 70}`} alt={member.email} className="w-full h-full object-cover rounded-full" />
                      
                      {(!member.status || member.status === 'pending') && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border border-[#0a0a1a]" />
                      )}
                      {member.status === 'accepted' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#0a0a1a]" />
                      )}
                    </div>
                  ))}
                </div>
                {((vault.members?.length ?? 0) + 1) > 3 && (
                  <div className="w-8 h-8 rounded-full bg-[#7919e6] flex items-center justify-center text-xs text-white font-bold">
                    +{(vault.members?.length ?? 0) - 2}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#ffffff08] rounded-xl p-3 border border-[#7919e633]">
                  <div className="text-2xl font-bold text-white mb-1">1</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Capsule</div>
                </div>
                <div className="bg-[#ffffff08] rounded-xl p-3 border border-[#7919e633]">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#7919e6]" />
                    <div className="text-2xl font-bold text-white">{new Date() < new Date(vault.unlockDate) ? 1 : 0}</div>
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Locked</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Last activity {getLastActivity(vault.createdAt)}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#33415580] flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Unlock: {new Date(vault.unlockDate).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleInvite(vault._id);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#7919e6]/50 text-[#d7b8ff] hover:bg-[#7919e6]/20"
                >
                  Invite Member
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => navigate("/createcapsule", { state: { collaborative: true } })}
          className="bg-[#ffffff08] rounded-2xl border-2 border-dashed border-[#33415580] hover:border-[#7919e6] transition-all flex flex-col items-center justify-center gap-4 group hover:bg-[#ffffff12] min-h-[400px]"
        >
          <div className="w-20 h-20 rounded-2xl bg-[#7919e6] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <div className="text-center">
            <div className="text-white font-medium text-lg mb-1">Create Shared Vault</div>
            <div className="text-slate-500 text-sm">Invite friends to collaborate</div>
          </div>
        </button>
      </div>

      <div className="bg-gradient-to-r from-[#7919e6] to-[#a855f7] rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/80 uppercase tracking-wider mb-2">Collaboration</div>
            <div className="text-3xl font-bold text-white mb-3">Share Your Journey</div>
            <p className="text-white/90 text-lg max-w-2xl">
              Invite loved ones to create memories together. Every shared vault is encrypted and secure.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!sharedVaults.length) {
                navigate("/createcapsule", { state: { collaborative: true } });
                return;
              }
              void handleInvite(sharedVaults[0]._id);
            }}
            className="px-8 py-4 bg-white text-[#7919e6] rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg"
          >
            Invite Members
          </button>
        </div>
      </div>
    </Layout>
  );
};
