import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface OnboardingContextData {
  hasSeenMaterialsIntro: boolean;
  markMaterialsIntroAsSeen: () => void;
}

const OnboardingContext = createContext<OnboardingContextData | undefined>(undefined);

const STORAGE_KEY = 'christus_onboarding';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasSeenMaterialsIntro, setHasSeenMaterialsIntro] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setHasSeenMaterialsIntro(data.materialsIntro === true);
      } catch {
        setHasSeenMaterialsIntro(false);
      }
    } else {
      setHasSeenMaterialsIntro(false);
    }
  }, []);

  const markMaterialsIntroAsSeen = () => {
    const data = { materialsIntro: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setHasSeenMaterialsIntro(true);
  };

  return (
    <OnboardingContext.Provider value={{ hasSeenMaterialsIntro, markMaterialsIntroAsSeen }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}