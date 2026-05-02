import { AxiosError } from "axios";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteMember, getMember, getMemberImageUrl, type Member } from "../../services/member";
import { PublicTeamLayout } from "./PublicTeamLayout";

const getErrorMessage = (error: unknown, fallback = "Unable to load member details") => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

const detailFields: { label: string; key: keyof Member }[] = [
  { label: "Email", key: "email" },
  { label: "Register Number", key: "registerNumber" },
  { label: "Role", key: "role" },
  { label: "Year", key: "year" },
  { label: "Degree", key: "degree" },
  { label: "Project", key: "project" },
  { label: "Hobbies", key: "hobbies" },
  { label: "Certificates", key: "certificates" },
  { label: "Internship", key: "internship" },
  { label: "Aim", key: "aim" },
];

export const MemberDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) {
        setError("Missing member id");
        setLoading(false);
        return;
      }

      try {
        const response = await getMember(id);
        setMember(response.data);
      } catch (fetchError) {
        setError(getErrorMessage(fetchError));
      } finally {
        setLoading(false);
      }
    };

    void fetchMember();
  }, [id]);

  const handleDeleteMember = async () => {
    if (!id || !member) return;

    const confirmed = window.confirm(`Delete ${member.name} from team members? This will remove the member from MongoDB.`);
    if (!confirmed) return;

    setError("");
    setDeleting(true);

    try {
      await deleteMember(id);
      navigate("/team", { replace: true });
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Unable to delete member"));
      setDeleting(false);
    }
  };

  return (
    <PublicTeamLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/team")}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-violet-100/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </button>

        {member && !loading && (
          <button
            type="button"
            onClick={() => void handleDeleteMember()}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? "Deleting..." : "Delete Member"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center text-violet-100/65">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading member details...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : member ? (
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
            <img
              src={getMemberImageUrl(member.profilePicture)}
              alt={member.name}
              className="h-72 w-full rounded-2xl object-cover"
            />
            <h1 className="mt-6 text-3xl font-black text-white">{member.name}</h1>
            <p className="mt-2 text-sm font-semibold text-[#a855f7]">{member.role}</p>
            <p className="mt-1 text-sm text-violet-100/60">{member.degree}</p>
          </aside>

          <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white">Full Member Details</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {detailFields.map(({ label, key }) => (
                <div key={key} className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-100/45">{label}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white">
                    {member[key] || "Not provided"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </PublicTeamLayout>
  );
};
