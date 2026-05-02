import { AxiosError } from "axios";
import { Eye, Loader2, Plus, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteMember, getMemberImageUrl, getMembers, type Member } from "../../services/member";
import { PublicTeamLayout } from "./PublicTeamLayout";

const getErrorMessage = (error: unknown, fallback = "Unable to load team members") => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

export const ViewMembersPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await getMembers();
        setMembers(response.data ?? []);
      } catch (fetchError) {
        setError(getErrorMessage(fetchError));
      } finally {
        setLoadingMembers(false);
      }
    };

    void fetchMembers();
  }, []);

  const handleDeleteMember = async (member: Member) => {
    const confirmed = window.confirm(`Delete ${member.name} from team members? This will remove the member from MongoDB.`);
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingMemberId(member._id);

    try {
      await deleteMember(member._id);
      setMembers((current) => current.filter((item) => item._id !== member._id));
      setSuccess("Member deleted successfully.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Unable to delete member"));
    } finally {
      setDeletingMemberId(null);
    }
  };

  return (
    <PublicTeamLayout>
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#a855f7]">View Members</p>
          <h1 className="mt-2 text-4xl font-black text-white">All Team Members</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100/65">
            These profiles are fetched from MongoDB and show each member name, role, and uploaded profile image.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/team/add")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7919e6] px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {success}
        </div>
      )}

      {loadingMembers ? (
        <div className="flex min-h-64 items-center justify-center text-violet-100/65">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading members...
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-10 text-center backdrop-blur-xl">
          <UserRound className="mx-auto h-10 w-10 text-[#a855f7]" />
          <h2 className="mt-4 text-xl font-bold text-white">No members yet</h2>
          <p className="mt-2 text-sm text-violet-100/65">Add your first team member to begin the directory.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <article key={member._id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <img
                  src={getMemberImageUrl(member.profilePicture)}
                  alt={member.name}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-white">{member.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-[#a855f7]">{member.role}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/members/${member._id}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:border-[#a855f7]"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteMember(member)}
                  disabled={deletingMemberId === member._id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/30 px-4 py-3 text-sm font-semibold text-red-100 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {deletingMemberId === member._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </PublicTeamLayout>
  );
};
