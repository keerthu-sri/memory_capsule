import { AxiosError } from "axios";
import { Loader2, Plus } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMember } from "../../services/member";
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

const requiredFields: (keyof FormValues)[] = ["name", "role", "email", "registerNumber", "year", "degree", "project"];

const optionalFields: (keyof FormValues)[] = ["hobbies", "certificates", "internship", "aim"];

const getFieldLabel = (field: keyof FormValues) => {
  if (field === "registerNumber") return "Register Number";
  return field.charAt(0).toUpperCase() + field.slice(1);
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || "Unable to add member";
  }

  return "Unable to add member";
};

export const AddMemberPage = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: keyof FormValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProfilePicture(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const missingTextField = requiredFields.some((field) => !formValues[field].trim());
    if (missingTextField || !profilePicture) {
      setError("Please complete all required fields and upload a profile image.");
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
      navigate("/team");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicTeamLayout>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#a855f7]">Add Member</p>
        <h1 className="mt-2 text-4xl font-black text-white">Create Team Member Profile</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100/65">
          Fill the form, upload a profile image, and submit the details to MongoDB through the backend.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
        <div className="grid gap-5 md:grid-cols-2">
          {requiredFields.map((field) => (
            <label key={field} className="space-y-2 text-sm font-semibold text-white">
              <span>{getFieldLabel(field)} *</span>
              <input
                value={formValues[field]}
                onChange={(event) => handleInputChange(field, event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0b0717]/70 px-4 py-3 text-sm text-white outline-none placeholder:text-violet-100/35 focus:border-[#a855f7]"
                required
              />
            </label>
          ))}

          {optionalFields.map((field) => (
            <label key={field} className="space-y-2 text-sm font-semibold text-white">
              <span>{getFieldLabel(field)}</span>
              <textarea
                value={formValues[field]}
                onChange={(event) => handleInputChange(field, event.target.value)}
                className="min-h-28 w-full rounded-xl border border-white/10 bg-[#0b0717]/70 px-4 py-3 text-sm text-white outline-none placeholder:text-violet-100/35 focus:border-[#a855f7]"
              />
            </label>
          ))}

          <label className="space-y-2 text-sm font-semibold text-white md:col-span-2">
            <span>Profile Image *</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-xl border border-white/10 bg-[#0b0717]/70 px-4 py-3 text-sm text-violet-100/80 file:mr-4 file:rounded-lg file:border-0 file:bg-[#7919e6] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              required
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-violet-100/75 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7919e6] to-[#a855f7] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {submitting ? "Adding..." : "Add Member"}
          </button>
        </div>
      </form>
    </PublicTeamLayout>
  );
};
