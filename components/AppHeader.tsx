import { default as defaultAvatarImg, default as logoChristus } from '@/assets/images/icon.png';
import { MenuSheet } from '@/components/MenuSheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui2/avatar';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/hooks/hooks2/use-toast';
import { profileService } from '@/services/profileService';
import { useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
interface AppHeaderProps {
  showAvatar?: boolean;
  showLogo?: boolean;
  showMenu?: boolean;
}
export function AppHeader({
  showAvatar = true,
  showLogo = true,
  showMenu = true
}: AppHeaderProps) {
//   const navigate = useNavigate();
//   const location = useLocation();
  const { photoUrl, userName , setPhotoProfileUrl} = useProfile();
  const { toast } = useToast();
  
  useEffect(() => {
    loadPhoto();
  }, []);

  const handleAvatarClick = () => {
    if (location.pathname !== '/perfil') {
    //   navigate('/perfil');
    }
  };

  const loadPhoto = async () => {
    if(!photoUrl){
      try {
        const blob = await profileService.fetchPhoto();
        const url = URL.createObjectURL(blob);
        setPhotoProfileUrl(url);
      } catch (err) {
        // Photo is optional
      }
    }
  };

  const handleMenuClick = () => {
    toast({
      title: 'Em desenvolvimento',
      description: 'Menu em breve'
    });
  };
  const userInitials = userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return (<header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--nav-bar))] text-[hsl(var(--nav-item))] shadow-sm safe-area-top" role="banner">
      <div className="h-20 px-4 flex items-center justify-between w-full">
        {/* Avatar à Esquerda */}
        {showAvatar && (
          <button
            onClick={handleAvatarClick}
            className="w-12 h-12 rounded-full overflow-hidden focus:ring-2 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] ring-offset-2 transition-transform hover:scale-105 active:scale-95 flex-shrink-0 bg-white" aria-label="Ver perfil">
            <Avatar className="w-full h-full">
              <AvatarImage src={photoUrl || defaultAvatarImg} alt={userName} />
              <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </button>
        )}

        {/* Logo Centralizada */}
        {showLogo && <div className="absolute left-1/2 transform -translate-x-1/2">
            <img 
              src={logoChristus} 
              alt="Colégio Christus" 
              className="h-10 w-auto"
            />
          </div>}

        {/* Menu Hambúrguer à Direita */}
        {showMenu && <MenuSheet />}
      </div>
    </header>
  );
}