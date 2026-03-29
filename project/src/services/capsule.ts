import API from "../api";

export type Capsule = {
  _id: string;
  title: string;
  message: string;
  unlockDate: string;
  mood?: string;
  isUnlocked?: boolean;
  isPrivate?: boolean;
  members?: { email: string; role: "viewer" | "editor"; status?: "pending" | "accepted" | "rejected" }[];
  createdAt?: string;
  memories?: CapsuleMemoryItem[];
  images?: string[];
};

export type CapsuleMemoryItem = {
  type: "photo" | "text" | "audio";
  content: string;
  preview?: string;
};

export type CreateCapsulePayload = {
  title: string;
  message: string;
  unlockDate: string;
  mood: string;
  isPrivate: boolean;
  members: { email: string; role: "viewer" | "editor" }[];
  memories?: CapsuleMemoryItem[];
};

export const createCapsule = (data: CreateCapsulePayload) =>
  API.post<Capsule>("/capsules", data);

export const getCapsules = () => API.get<Capsule[]>("/capsules");

export const inviteCollaborator = (capsuleId: string, email: string, role?: string) =>
  API.post(`/capsules/${capsuleId}/invite`, { email, role });
