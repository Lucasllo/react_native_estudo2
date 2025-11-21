import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui2/tabs';
import { useUnread } from '@/contexts/UnreadContext';
// import { useDeviceClass } from '@/hooks/use-device-class';
import { MessageList } from '@/features/home/MessageList';
import { messageService } from '@/services/messageService';
import type { Mensagem } from '@/services/types';
import { trackPageView } from '@/utils/analytics';
import { Inbox, RotateCw } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

export function HomePage() {

//   const { isIPad } = useDeviceClass();
  const [messages, setMessages] = useState<Mensagem[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Mensagem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUnreadCount } = useUnread();

  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [pageLoaded, setPageLoaded] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);
  const [filters, setFilters] = useState<{tipo: string}>({tipo: ''});
  const [availableTypes, setvailableTypes] = useState<{nome: string, codigo: string}[]>([{nome: 'Todos', codigo: ''}, {nome: 'Lido', codigo: 'S'}, {nome: 'Não Lido', codigo: 'N'}]);

  const threshold = 100;
  const handle = () => { };

//   useEffect(() => {

//     const handleRefresh = () => {
//       setPageLoaded(false);
//       loadMessages();
//     };
//     const handleTouchStart = (e) => {
//       setStartY(e.touches[0].clientY);
//       setIsPulling(false);
//       setPullDistance(0);
//     };

//     const handleTouchMove = (e) => {
//       const currentY = e.touches[0].clientY;
//       const distance = currentY - startY;

//       if (distance > 0 && document.getElementById("mensagens").scrollTop === 0) {
//         setIsPulling(true);
//         setPullDistance(distance >= 80 ? 80 : distance);
//       } else {
//         setIsPulling(false);
//         setPullDistance(0);
//       }
//     };

//     const handleTouchEnd = () => {
//       if (isPulling && (pullDistance + 40) > threshold) {
//         handleRefresh();
//       }
//       setIsPulling(false);
//       setPullDistance(0);
//     };

//     if (document.getElementById("mensagens")) {
//       setLoaded(false);
//       document.getElementById("mensagens").addEventListener('touchstart', handleTouchStart);
//       document.getElementById("mensagens").addEventListener('touchmove', handleTouchMove, { passive: false });
//       document.getElementById("mensagens").addEventListener('touchend', handleTouchEnd);
//     }

//     return () => {
//       if (document.getElementById("mensagens")) {
//         document.getElementById("mensagens").removeEventListener('touchstart', handleTouchStart);
//         document.getElementById("mensagens").removeEventListener('touchmove', handleTouchMove);
//         document.getElementById("mensagens").removeEventListener('touchend', handleTouchEnd);
//       }
//     };
//   }, [handle]);

  // Filter logic
  useMemo(() => {
    setFilteredMessages(messages.filter(m => filters.tipo == '' ? m.lida : m.lida == filters.tipo))
    // loadMateriaisByTipo(availableTypes.filter(t => t.descricao === filters.tipo)[0].codigo, filters.keyword);
  }, [filters]);

  useEffect(() => {
    trackPageView('home');
    setIsLoading(true);
    loadMessages();
  }, []);

  useEffect(() => {
    if (pageLoaded == false && loaded) {
      setPageLoaded(true);
    }
  }, [loaded]);

  const loadMessages = async () => {
    setError(null);

    try {
      const data = await messageService.fetchMessages();
      // Sort by date DESC (most recent first)
      const sorted = data.sort((a:any, b:any) =>
        new Date(b.data).getTime() - new Date(a.data).getTime()
      );
      setMessages(sorted);
      setFilteredMessages(sorted);

      // Update unread count
      const unreadCount = sorted.filter((m: any) => m.lida != 'S').length;
      setUnreadCount(unreadCount);
    //   await pushNotificationService.syncBadgeWithUnreadCount(unreadCount);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar avisos');
    } finally {
      setIsLoading(false);
      setLoaded(true);
    }
  };

  const handleMarkAsRead = async (codigo: string) => {
    try {
      await messageService.markAsRead(codigo);
      setFilteredMessages(prev => {
        const updated = prev.map(msg => msg.codigo === codigo ? { ...msg, lida: 'S' } : msg);
        // Update unread count
        const unreadCount = updated.filter(m => m.lida != 'S').length;
        setUnreadCount(unreadCount);
        // pushNotificationService.syncBadgeWithUnreadCount(unreadCount);
        return updated;
      });
    } catch (err: any) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAsUnread = async (codigo: string) => {
    try {
      await messageService.onMarkAsUnread(codigo);
      setFilteredMessages(prev => {
        const updated = prev.map(msg => msg.codigo === codigo ? { ...msg, lida: 'N' } : msg);
        const unreadCount = updated.filter(m => m.lida !== 'S').length;
        setUnreadCount(unreadCount);
        // pushNotificationService.syncBadgeWithUnreadCount(unreadCount);
        return updated;
      });
    } catch (err: any) {
      console.error('Error marking as unread:', err);
    }
  };

  return (


    <>
      {error && (
        <>
          <AppHeader />
          <div className="safe-area-top">
            <div className="pt-20">
              <ErrorState description={error} onRetry={loadMessages} />
            </div>
          </div>
        </>
      )}
      {isLoading && (
        <>
          <AppHeader />
          <div className="safe-area-top">
            <div className="pt-20">
              <LoadingState count={5} type="card" />
            </div>
          </div>
        </>
      )}

      {messages.length === 0 && !isLoading && !error && (
        <>
          <AppHeader />
          <div className="safe-area-top">
            <div
              id="mensagens"
              className="pt-20 pb-[calc(20px+env(safe-area-inset-bottom))] h-[calc(100vh-5rem-env(safe-area-inset-bottom))] overflow-y-auto overscroll-none"
            >
              <EmptyState
                title="Nenhum aviso novo"
                description="Quando houver avisos da escola, eles aparecerão aqui."
                icon={<Inbox className="w-8 h-8 text-muted-foreground" />}
              />
            </div>
          </div>
        </>
      )}
      {!isLoading && messages.length > 0 && (
        <>
          <AppHeader />
          <div className={`pt-15 safe-area-top`}>
            <div
              id="mensagens"
              className="pt-20 pb-[calc(6rem+env(safe-area-inset-bottom))] h-[calc(100vh-env(safe-area-inset-bottom))] overflow-y-auto overscroll-none"
            >

              {<div style={{ height: 0, transform: `translateY(${(pullDistance + 80) - threshold}px)`, transition: 'transform 0.1s ease-out', width: '100%', display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
                {isPulling ? (
                  <RotateCw className="bg-card dark:bg-card-dark"  />
                ) :
                  pageLoaded == false ? (<div style={{ height: 0, transform: `translateY(20px)`, transition: 'transform 0.1s ease-out', width: '100%', display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
                    {<RotateCw className="bg-card dark:bg-card-dark" style={{ borderRadius: '100px', padding: '6px', width: '2.5rem', height: '2.5rem', animation: 'spin 1s linear infinite' }} />}
                  </div>) : ''}
              </div>
              }
              <div className="px-4 pt-6 pb-4">
                <h1 style={{
                color: '#071D49'
              }} className="text-[1.125rem] font-semibold">Mensagens</h1>
              </div>
              <Tabs value={filters.tipo} onValueChange={(value:any) => setFilters(prev => ({ ...prev, tipo: value }))} className="px-4 mb-4">
                <TabsList  className="w-full grid grid-cols-3">
                  {availableTypes.map(tipo => (
                    <TabsTrigger 
                      key={tipo.nome} 
                      value={tipo.codigo}
                    >
                      {tipo.nome}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <MessageList messages={filteredMessages} onMarkAsRead={handleMarkAsRead} onMarkAsUnread={handleMarkAsUnread} />
            </div>
          </div>
          {/* <MaterialsIntroDialog /> */}
        </>
      )
      }
    </>
  );
}