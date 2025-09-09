import { api } from "@/lib/core/api";
import type { LMSUser } from "@/types/lms";

export const authService = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    school?: string;
    department?: string;
    phone?: string;
    location?: string;
  }) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get<LMSUser>("/auth/profile"),
  updateProfile: (data: Partial<LMSUser>) => api.put("/auth/profile", data),
};
