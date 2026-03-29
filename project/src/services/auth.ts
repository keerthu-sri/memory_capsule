import API from "../api";

type AuthData = {
  name?: string;
  email: string;
  password: string;
};

export const register = (data: AuthData) => API.post("/auth/register", data);

export const login = (data: AuthData) => API.post("/auth/login", data);