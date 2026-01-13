import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminState {
  isAdmin: boolean;
  adminEmail: string | null;
  login: (email: string) => boolean;
  logout: () => void;
}

// Configure allowed admin emails here
const ADMIN_EMAILS = [
  'admin@collectif.nyc',
  'connect@collectif.nyc',
  // Add more admin emails as needed
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdmin: false,
      adminEmail: null,
      login: (email: string) => {
        const isAuthorized = ADMIN_EMAILS.some(
          (adminEmail) => adminEmail.toLowerCase() === email.toLowerCase()
        );
        if (isAuthorized) {
          set({ isAdmin: true, adminEmail: email });
          return true;
        }
        return false;
      },
      logout: () => set({ isAdmin: false, adminEmail: null }),
    }),
    {
      name: 'admin-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
