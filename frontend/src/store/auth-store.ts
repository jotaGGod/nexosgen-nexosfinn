import { create } from "zustand";

import type { User } from "@/types/api";

/**
 * Estado global do usuário autenticado.
 *
 * Guarda apenas o perfil — os tokens ficam em cookies httpOnly, fora do
 * alcance do JavaScript.
 */
interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
