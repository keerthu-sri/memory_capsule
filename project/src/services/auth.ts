import API from "../api";

type AuthData = {
  name?: string;
  email: string;
  password?: string;
};

export const register = (data: AuthData) => API.post("/auth/register", data);

export const login = async (data: AuthData) => {
  const res = await API.post("/auth/login", data);

  const { token, user } = res.data;
  const storedUserId = user.id || user._id;

  localStorage.setItem("token", token);
  localStorage.setItem("userId", storedUserId);
  localStorage.setItem("userEmail", user.email);

  return res;
};

export const getProfile = () => API.get("/auth/me");

export const updateProfile = (data: { name?: string; email?: string }) => API.put("/auth/me", data);

