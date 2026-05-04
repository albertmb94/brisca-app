import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Settings {
  defaultPricePerRound: number;
  defaultPricePerGame: number;
  defaultPricePerReentry: number;
  defaultTargetScore: number;
  defaultPlayerNames: string[];
}

interface SettingsStore extends Settings {
  setDefaults: (settings: Partial<Settings>) => void;
  resetDefaults: () => void;
}

const defaultSettings: Settings = {
  defaultPricePerRound: 0,
  defaultPricePerGame: 0,
  defaultPricePerReentry: 0,
  defaultTargetScore: 150,
  defaultPlayerNames: [],
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setDefaults: (newSettings) =>
        set((state) => ({ ...state, ...newSettings })),
      resetDefaults: () => set(defaultSettings),
    }),
    {
      name: "brisca-app-settings",
    }
  )
);
