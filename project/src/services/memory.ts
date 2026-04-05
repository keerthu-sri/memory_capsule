import API from "../api";

export type Memory = {
  _id: string;
  text: string;
  mood?: string;
  date?: string;
  createdAt?: string;
};

export type MemoryData = {
  text: string;
  mood?: string;
};

export const createMemory = (data: MemoryData) =>
  API.post<Memory>("/memories", data);

export const getMemories = () => API.get<Memory[]>("/memories");