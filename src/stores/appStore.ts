import { create } from "zustand";

interface AppState {
    selectedStudentId: string | null;
    setSelectedStudentId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
    selectedStudentId: null,
    setSelectedStudentId: (id) => set({ selectedStudentId: id }),
}));
