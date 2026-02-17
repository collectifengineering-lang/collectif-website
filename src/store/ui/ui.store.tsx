import { create } from 'zustand';
import { Portfolio } from '@/interfaces';

interface State {
    isSideMenuOpen: boolean;
    openSideMenu: () => void;
    closeSideMenu: () => void;
    portfolioData: Portfolio | null;
    setPortfolioData: (data: Portfolio) => void;
    selectedWorkCategory: string | null;
    setSelectedWorkCategory: (category: string | null) => void;
}

export const useUIStore = create<State>((set) => ({
    isSideMenuOpen: false,
    openSideMenu: () => set({ isSideMenuOpen: true }),
    closeSideMenu: () => set({ isSideMenuOpen: false }),
    portfolioData: null,
    setPortfolioData: (data: Portfolio) => set({ portfolioData: data }),
    selectedWorkCategory: null,
    setSelectedWorkCategory: (category: string | null) => set({ selectedWorkCategory: category }),
}));
