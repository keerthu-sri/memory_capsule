import API from "../api";

type AuthData = {
  name?: string;
  email: string;
  password?: string;
};

export type ProfileData = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  createdAt: string;
  phone?: string;
  age?: number | null;
  gender?: string;
  avatar?: string;
  hobbies?: string[];
  interests?: string[];
};

export const register = (data: AuthData) => API.post("/auth/register", data);

export const login = async (data: AuthData) => {
  const res = await API.post("/auth/login", data);

  const { token, user } = res.data;
  const storedUserId = user.id || user._id;

  localStorage.setItem("token", token);
  localStorage.setItem("userId", storedUserId);
  localStorage.setItem("userEmail", user.email);
  localStorage.setItem("userName", user.name || "");
  localStorage.setItem("userAvatar", user.avatar || "");

  return res;
};

export const getProfile = () => API.get("/auth/me");

export const updateProfile = (data: FormData | { name?: string; email?: string }) =>
  API.put("/auth/me", data, data instanceof FormData ? {
    headers: { "Content-Type": "multipart/form-data" },
  } : undefined);

