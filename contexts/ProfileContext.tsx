import { profileService } from '@/services/profileService';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ProfileContextData {
  photoUrl: string | null;
  setPhotoProfileUrl: React.Dispatch<React.SetStateAction<string>>,
  userName: string;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextData | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [photoUrl, setPhotoProfileUrl] = useState<string>('');
  const [userName, setUserName] = useState('Usuário');
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const perfil = await profileService.fetchProfile();
        setUserName(perfil.nome);
        
        try {
          const blob = await profileService.fetchPhoto();
          setPhotoProfileUrl(URL.createObjectURL(blob));
        } catch {
          // Photo is optional, silently fail
          setPhotoProfileUrl('');
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ photoUrl, setPhotoProfileUrl, userName, isLoading, refreshProfile: loadProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}