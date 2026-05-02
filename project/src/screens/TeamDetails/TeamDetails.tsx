import { AxiosError } from "axios";
import { Eye, Loader2, Plus, Trash2, UserRound, UsersRound } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMember, deleteMember, getMemberImageUrl, getMembers, type Member } from "../../services/member";
import { PublicTeamLayout } from "./PublicTeamLayout";

type FormValues = {
  name: string;
  email: string;
  registerNumber: string;
  role: string;
  year: string;
  degree: string;
  project: string;
  hobbies: string;
  certificates: string;
  internship: string;
  aim: string;
};

const initialFormValues: FormValues = {
  name: "",
  email: "",
  registerNumber: "",
  role: "",
  year: "",
  degree: "",
  project: "",
  hobbies: "",
  certificates: "",
  internship: "",
  aim: "",
};

const requiredFields: (keyof FormValues)[] = ["name", "email", "registerNumber", "role", "year", "degree", "project"];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

export const TeamDetails = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"list" | "add">("list");
  const [members, setMembers] = useState<Member[]>([]);
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMembers = async () => {
    setLoadingMembers(true);
    setError("");

    try {
      const response = await getMembers();
      setMembers(response.data ?? []);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Unable to load team members"));
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (mode === "list") {
      void fetchMembers();
    }
  }, [mode]);

  const handleInputChange = (field: keyof FormValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProfilePicture(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const missingTextField = requiredFields.some((field) => !formValues[field].trim());
    if (missingTextField || !profilePicture) {
      setError("Please complete all required fields and choose a profile picture.");
      return;
    }

    const data = new FormData();
    Object.entries(formValues).forEach(([key, value]) => {
      data.append(key, value);
    });
    data.append("profilePicture", profilePicture);

    setSubmitting(true);

    try {
      await createMember(data);
      setFormValues(initialFormValues);
      setProfilePicture(null);
      setSuccess("Member added successfully.");
      setMode("list");
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to add member"));
    } finally {
      setSubmitting(false);
    }
  };

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
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#a855f7]">
            Team 10
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">Team Members</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100/65">
            Manage the people behind this Memory Capsule build and keep their project profile details together.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setMode("list");
              setSuccess("");
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
              mode === "list" ? "bg-[#7919e6] text-white" : "border border-white/10 bg-white/5 text-violet-100/70"
            }`}
          >
            <UsersRound className="h-4 w-4" />
            View Members
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("add");
              setError("");
              setSuccess("");
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
              mode === "add" ? "bg-[#7919e6] text-white" : "border border-white/10 bg-white/5 text-violet-100/70"
            }`}
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        </div>
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

      {mode === "add" && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
          <div className="grid gap-5 md:grid-cols-2">
            {requiredFields.map((field) => (
              <label key={field} className="space-y-2 text-sm font-semibold text-white">
                <span>{field === "registerNumber" ? "Register Number" : field.charAt(0).toUpperCase() + field.slice(1)} *</span>
                <input
                  value={formValues[field]}
                  onChange={(event) => handleInputChange(field, event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0b0717]/70 px-4 py-3 text-sm text-white outline-none placeholder:text-violet-100/35 focus:border-[#a855f7]"
                  required
                />
              </label>
            ))}
            {(["hobbies", "certificates", "internship", "aim"] as (keyof FormValues)[]).map((field) => (
              <label key={field} className="space-y-2 text-sm font-semibold text-white">
                <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                <textarea
                  value={formValues[field]}
                  onChange={(event) => handleInputChange(field, event.target.value)}
                  className="min-h-28 w-full rounded-xl border border-white/10 bg-[#0b0717]/70 px-4 py-3 text-sm text-white outline-none placeholder:text-violet-100/35 focus:border-[#a855f7]"
                />
              </label>
            ))}
            <label className="space-y-2 text-sm font-semibold text-white md:col-span-2">
              <span>Profile Picture *</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-xl border border-white/10 bg-[#0b0717]/70 px-4 py-3 text-sm text-violet-100/80 file:mr-4 file:rounded-lg file:border-0 file:bg-[#7919e6] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                required
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7919e6] to-[#a855f7] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitting ? "Adding..." : "Submit Member"}
            </button>
          </div>
        </form>
      )}

      {mode === "list" && (
        <section>
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
                      <p className="truncate text-sm text-violet-100/65">{member.email}</p>
                      <p className="mt-1 text-sm font-semibold text-[#a855f7]">{member.role}</p>
                      <p className="mt-1 truncate text-xs font-medium text-violet-100/50">{member.degree}</p>
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
        </section>
      )}
    </PublicTeamLayout>
  );
};
