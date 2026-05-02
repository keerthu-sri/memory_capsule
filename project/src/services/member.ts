import API from "../api";

export type Member = {
  _id: string;
  name: string;
  email: string;
  registerNumber: string;
  role: string;
  year: string;
  degree: string;
  project: string;
  hobbies?: string;
  certificates?: string;
  internship?: string;
  aim?: string;
  profilePicture: string;
  createdAt?: string;
};

export const getMemberImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  return `${import.meta.env.VITE_API_URL}/${path.replace(/\\/g, "/")}`;
};

export const createMember = (data: FormData) =>
  API.post<Member>("/members", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getMembers = () => API.get<Member[]>("/members");
export const getMember = (memberId: string) => API.get<Member>(`/members/${memberId}`);
export const updateMember = (memberId: string, data: FormData) =>
  API.put<Member>(`/members/${memberId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const deleteMember = (memberId: string) => API.delete<{ message: string }>(`/members/${memberId}`);
