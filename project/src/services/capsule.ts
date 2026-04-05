import API from "../api";

export type Capsule = {
  _id: string;
  title: string;
  message: string;
  userId?: string | { _id?: string; id?: string; name?: string; email?: string };
  unlockDate: string;
  mood?: string;
  isUnlocked?: boolean;
  isPrivate?: boolean;
  isCollaborative?: boolean;
  isLocked?: boolean;
  canEdit?: boolean;
  canLock?: boolean;
  canViewContent?: boolean;
  isReadyToView?: boolean;
  currentUserRole?: "owner" | "viewer" | "editor" | null;
  members?: {
    user: string | { _id?: string; id?: string; name?: string; email?: string };
    role: "viewer" | "editor";
    status?: "pending" | "accepted" | "rejected";
  }[];
  invites?: {
    email: string;
    role: "viewer" | "editor";
    invitedBy?: { _id?: string; id?: string; name?: string; email?: string };
    createdAt?: string;
  }[];
  createdAt?: string;
  memories?: CapsuleMemoryItem[];
  images?: string[];
};

export type CapsuleMemoryItem = {
  type: "photo" | "text" | "audio";
  content: string;
  preview?: string;
  mediaKind?: "voice" | "song";
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

export type InviteItem = {
  capsuleId: string;
  title: string;
  role: "viewer" | "editor";
  invitedBy: string;
  createdAt: string;
};

export const createCapsule = (data: FormData) =>
  API.post<Capsule>("/capsules", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getCapsules = () => API.get<Capsule[]>("/capsules");
export const getCapsule = (capsuleId: string) => API.get<Capsule>(`/capsules/${capsuleId}`);
export const getMyInvites = () => API.get<InviteItem[]>("/capsules/invites/me");

export const inviteCollaborator = (capsuleId: string, email: string, role?: string) =>
  API.post<{ message: string; capsule: Capsule }>(`/capsules/${capsuleId}/invite`, { email, role });

export const acceptInvite = (capsuleId: string) =>
  API.post<{ message: string; capsule: Capsule }>(`/capsules/${capsuleId}/invite/accept`);

export const rejectInvite = (capsuleId: string) =>
  API.post<{ message: string }>(`/capsules/${capsuleId}/invite/reject`);

export const addCapsuleMemories = (capsuleId: string, data: FormData) =>
  API.post<Capsule>(`/capsules/${capsuleId}/memories`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const lockCapsule = (capsuleId: string) =>
  API.post<Capsule>(`/capsules/${capsuleId}/lock`);
