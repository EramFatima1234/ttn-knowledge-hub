import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthUser, RoleName } from "@knowledgehub/types";
import { encryptData, decryptData } from "@/lib/encryption";
import { demoAllowsAdminAccess } from "@/lib/demo-access";

export interface UserSession extends AuthUser {
  accessToken: string;
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;
  setSession: (session: UserSession) => void;
  updateAccessToken: (accessToken: string) => void;
  logout: () => void;
  hasRole: (role: RoleName) => boolean;
  isAdmin: () => boolean;
  isTeam: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      setHydrated: (value) => set({ isHydrated: value }),

      setSession: (session) =>
        set({ user: session, isAuthenticated: true }),

      updateAccessToken: (accessToken) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, accessToken } });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      hasRole: (role) => {
        const { user, isAuthenticated } = get();
        // TODO(demo): Restore strict role checks when DEMO_OPEN_ADMIN_ACCESS is false.
        if (demoAllowsAdminAccess(isAuthenticated) && role === RoleName.ADMIN) {
          return true;
        }
        return user?.roles?.includes(role) ?? false;
      },

      isAdmin: () => {
        const { isAuthenticated } = get();
        if (demoAllowsAdminAccess(isAuthenticated)) return true;
        return get().hasRole(RoleName.ADMIN);
      },

      isTeam: () => {
        const state = get();
        return state.hasRole(RoleName.TEAM) || state.isAdmin();
      },
    }),
    {
      name: "knowledgehub-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const item = localStorage.getItem(name);
          if (!item) return null;
          const decrypted = decryptData(item);
          return decrypted ? JSON.stringify(decrypted) : null;
        },
        setItem: (name, value) => {
          if (typeof window !== "undefined") {
            localStorage.setItem(name, encryptData(JSON.parse(value)));
          }
        },
        removeItem: (name) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem(name);
          }
        },
      })),
    },
  ),
);
