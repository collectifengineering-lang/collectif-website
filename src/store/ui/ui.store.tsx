import { create } from 'zustand';
import { Portfolio } from '@/interfaces';

interface State {
    isSideMenuOpen: boolean;
    openSideMenu: () => void;
    closeSideMenu: () => void;
    portfolioData: Portfolio | null; // Agregar el estado del portfolio
    setPortfolioData: (data: Portfolio) => void; // Función para actualizar los datos del portfolio
}

export const useUIStore = create<State>((set) => ({
    isSideMenuOpen: false,
    openSideMenu: () => set({ isSideMenuOpen: true }),
    closeSideMenu: () => set({ isSideMenuOpen: false }),
    portfolioData: null, // Inicializar el portfolioData
    setPortfolioData: (data: Portfolio) => set({ portfolioData: data }), // Función para establecer los datos del portfolio
}));
