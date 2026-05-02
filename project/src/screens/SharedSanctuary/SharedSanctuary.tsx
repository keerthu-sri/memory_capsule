import { Clock, Mail, Plus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "../../components/layout/Layout";
import { PageHeader } from "../../components/layout/PageHeader";
import { MiniModal } from "../../components/ui/MiniModal";
import { MiniNotice } from "../../components/ui/MiniNotice";
import {
  acceptInvite,
  getCapsules,
  getMyInvites,
  inviteCollaborator,
  rejectInvite,
  type Capsule,
  type InviteItem,
} from "../../services/capsule";

const getUserIdValue = (value?: string | { _id?: string; id?: string }) => {
  if (!value) return "";
  return typeof value === "string" ? value : value._id || value.id || "";
};

const getOwnerName = (capsule: Capsule) =>
  typeof capsule.userId === "string" ? "You" : capsule.userId?.name || "Capsule User";

const buildAssetUrl = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${import.meta.env.VITE_API_URL}/${value.replace(/\\/g, "/")}`;
};

const getCapsulePreviewImage = (capsule: Capsule) => {
  if (capsule.images?.[0]) return buildAssetUrl(capsule.images[0]);
  const firstPhoto = capsule.memories?.find((memory) => memory.type === "photo" && memory.preview);
  return firstPhoto?.preview ? buildAssetUrl(firstPhoto.preview) : "";
};

const getLastActivity = (createdAt?: string) => {
  if (!createdAt) return "recently";
  const diff = Date.now() - new Date(createdAt).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const isCapsuleUnlocked = (capsule: Capsule) =>
  Boolean(capsule.isReadyToView || capsule.canViewContent || capsule.isUnlocked) ||
  new Date() >= new Date(capsule.unlockDate);

const VaultCard = ({
  capsule,
  onOpen,
  onInvite,
  showInviteAction,
}: {
  capsule: Capsule;
  onOpen: () => void;
  onInvite?: () => void;
  showInviteAction?: boolean;
}) => {
  const isUnlocked = isCapsuleUnlocked(capsule);
  const previewImage = isUnlocked ? getCapsulePreviewImage(capsule) : "";

  return (
    <div
      onClick={onOpen}
      className="theme-surface group rounded-2xl overflow-hidden border backdrop-blur-md hover:border-[var(--app-accent)] transition-all cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden bg-[#120f22]">
        {previewImage ? (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_55%)] p-4">
            <img
              src={previewImage}
              alt={capsule.title}
              className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7919e6]/40 to-[#a855f7]/20 group-hover:scale-110 transition-transform duration-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />

        <div className="absolute top-4 right-4 bg-[#0a0a1a]/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 border border-[#7919e6]/30">
          <Users className="w-4 h-4 text-[#7919e6]" />
          <span className="text-xs font-medium">{(capsule.members?.length ?? 0) + 1} MEMBERS</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-semibold text-xl">{capsule.title}</h3>
          {!isUnlocked && (
            <span className="text-[10px] uppercase tracking-widest text-[#d7b8ff] border border-[#7919e6]/40 rounded-full px-2 py-1">
              Locked
            </span>
          )}
        </div>

        <p className="theme-muted text-sm mb-4 line-clamp-2">{capsule.message || "Shared memory capsule"}</p>

        <div className="space-y-2 text-sm theme-muted">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Last activity {getLastActivity(capsule.createdAt)}</span>
          </div>
          <div>Owner: {getOwnerName(capsule)}</div>
          <div>{isUnlocked ? "Unlocked" : "Unlock"}: {new Date(capsule.unlockDate).toLocaleDateString()}</div>
        </div>

        {showInviteAction && (
          <div className="mt-4 pt-4 border-t border-[#33415580] flex justify-end">
            <button
              onClick={(event) => {
                event.stopPropagation();
                onInvite?.();
              }}
              className="text-xs px-3 py-1.5 border border-[#7919e6]/50 rounded-lg text-[#d7b8ff]"
            >
              Invite
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const SharedSanctuary = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const userId = localStorage.getItem("userId") || "";
  const [inviteModal, setInviteModal] = useState<{ capsuleId: string; email: string; role: "viewer" | "editor" } | null>(null);
  const [notice, setNotice] = useState<{ message: string; variant: "info" | "success" | "error" } | null>(null);
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const matchesQuery = (capsule: Capsule) =>
    !query ||
    capsule.title?.toLowerCase().includes(query) ||
    capsule.message?.toLowerCase().includes(query) ||
    capsule.mood?.toLowerCase().includes(query) ||
    getOwnerName(capsule).toLowerCase().includes(query);

  const showNotice = (message: string, variant: "info" | "success" | "error" = "info") => {
    setNotice({ message, variant });
    window.setTimeout(() => setNotice((current) => (current?.message === message ? null : current)), 2600);
  };

  const refreshCapsules = async () => {
    try {
      const response = await getCapsules();
      setCapsules(response.data ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshInvites = async () => {
    try {
      const response = await getMyInvites();
      setInvites(response.data ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void refreshCapsules();
    void refreshInvites();
  }, []);

  const sharedByMe = useMemo(
    () =>
      capsules.filter(
        (capsule) =>
          !capsule.isPrivate && getUserIdValue(capsule.userId) === userId && capsule.currentUserRole === "owner"
          && matchesQuery(capsule)
      ),
    [capsules, userId, query]
  );

  const sharedWithMe = useMemo(
    () =>
      capsules.filter(
        (capsule) =>
          !capsule.isPrivate &&
          getUserIdValue(capsule.userId) !== userId &&
          (capsule.currentUserRole === "viewer" || capsule.currentUserRole === "editor") &&
          matchesQuery(capsule)
      ),
    [capsules, userId, query]
  );

  const handleInvite = async () => {
    if (!inviteModal?.capsuleId || !inviteModal.email.trim()) {
      showNotice("Add the collaborator email first.", "error");
      return;
    }
    try {
      await inviteCollaborator(inviteModal.capsuleId, inviteModal.email.trim(), inviteModal.role);
      showNotice("Invite sent.", "success");
      setInviteModal(null);
      await refreshCapsules();
      await refreshInvites();
    } catch (error) {
      console.error(error);
      showNotice("Failed to send invite.", "error");
    }
  };

  const handleAccept = async (capsuleId: string) => {
    try {
      await acceptInvite(capsuleId);
      await refreshInvites();
      await refreshCapsules();
    } catch (error) {
      console.error(error);
      showNotice("Unable to accept invite.", "error");
    }
  };

  const handleReject = async (capsuleId: string) => {
    try {
      await rejectInvite(capsuleId);
      await refreshInvites();
    } catch (error) {
      console.error(error);
      showNotice("Unable to reject invite.", "error");
    }
  };

  return (
    <Layout>
      <MiniNotice open={Boolean(notice)} message={notice?.message || ""} variant={notice?.variant || "info"} />
      <PageHeader
        title="Shared Sanctuary"
        subtitle="Capsules you created together or were invited into"
        searchPlaceholder="Search shared vaults..."
      />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-8 mb-12">
        <div className="theme-surface rounded-3xl p-8 border">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-xs theme-muted uppercase tracking-[0.3em] mb-2">Pending Invites</div>
              <h2 className="text-2xl font-bold">Review Invitations</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#7919e6]/20 border border-[#7919e6]/40 flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#d7b8ff]" />
            </div>
          </div>

          {invites.length === 0 ? (
            <p className="theme-muted">No pending invites right now.</p>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => (
                <div key={invite.capsuleId} className="theme-surface-strong rounded-2xl p-5 border border-[var(--app-border-soft)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-lg">{invite.title}</div>
                      <div className="text-sm theme-muted mt-1">
                        {invite.invitedBy} invited you as a {invite.role}.
                      </div>
                    </div>
                    <div className="text-xs theme-subtle">{new Date(invite.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleAccept(invite.capsuleId)}
                      className="px-4 py-2 bg-green-500/90 hover:bg-green-500 rounded-xl text-white text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(invite.capsuleId)}
                      className="px-4 py-2 bg-red-500/90 hover:bg-red-500 rounded-xl text-white text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/createcapsule", { state: { collaborative: true } })}
          className="bg-gradient-to-br from-[#7919e6] to-[#a855f7] rounded-3xl p-8 shadow-2xl text-left min-h-[220px] flex flex-col justify-between"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-white/70 mb-2">Create</div>
            <div className="text-3xl font-bold text-white mb-3">Start a shared vault</div>
            <p className="text-white/90">Invite editors or viewers and keep control of when the capsule gets locked.</p>
          </div>
        </button>
      </div>

      <div className="space-y-14">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-8 bg-[#a855f7] rounded-full" />
            <div>
              <h2 className="text-2xl font-bold">Shared by Me</h2>
              <p className="theme-muted">Collaborative vaults you created and manage.</p>
            </div>
          </div>

          {sharedByMe.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--app-border-soft)] bg-[var(--app-surface)] p-8 theme-muted">
              No collaborative capsules created by you yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sharedByMe.map((vault) => (
                <VaultCard
                  key={vault._id}
                  capsule={vault}
                  onOpen={() => navigate(`/capsule/${vault._id}`)}
                  onInvite={() => setInviteModal({ capsuleId: vault._id, email: "", role: "viewer" })}
                  showInviteAction
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-8 bg-orange-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold">Shared with Me</h2>
              <p className="theme-muted">Capsules where you joined as an editor or viewer.</p>
            </div>
          </div>

          {sharedWithMe.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--app-border-soft)] bg-[var(--app-surface)] p-8 theme-muted">
              No accepted shared capsules yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sharedWithMe.map((vault) => (
                <VaultCard key={vault._id} capsule={vault} onOpen={() => navigate(`/capsule/${vault._id}`)} />
              ))}
            </div>
          )}
        </section>

        <div className="bg-gradient-to-r from-[#7919e6] to-[#a855f7] rounded-3xl p-8 shadow-2xl">
          <div className="text-xs text-white/80 uppercase mb-2">Collaboration</div>
          <div className="text-3xl font-bold text-white mb-3">Share Your Journey</div>
          <p className="text-white/90 text-lg">Editors can build the capsule with you, while viewers wait for the reveal.</p>
        </div>
      </div>

      <MiniModal
        open={Boolean(inviteModal)}
        title="Invite Collaborator"
        description="Add the email and choose whether they can edit or only view the capsule."
        confirmLabel="Send Invite"
        cancelLabel="Cancel"
        onConfirm={handleInvite}
        onCancel={() => setInviteModal(null)}
        confirmDisabled={!inviteModal?.email.trim()}
      >
        <div className="space-y-4">
          <input
            type="email"
            value={inviteModal?.email || ""}
            onChange={(event) =>
              setInviteModal((current) => (current ? { ...current, email: event.target.value } : current))
            }
            placeholder="Email address"
            className="theme-input w-full rounded-2xl px-4 py-3 focus:outline-none focus:border-[var(--app-accent)]"
          />
          <select
            value={inviteModal?.role || "viewer"}
            onChange={(event) =>
              setInviteModal((current) =>
                current ? { ...current, role: event.target.value as "viewer" | "editor" } : current
              )
            }
            className="theme-input w-full rounded-2xl px-4 py-3 focus:outline-none focus:border-[var(--app-accent)]"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
        </div>
      </MiniModal>
    </Layout>
  );
};
