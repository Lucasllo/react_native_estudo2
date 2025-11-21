// Message Card Component

import { Button } from '@/components/ui2/button';
import { Card, CardContent } from '@/components/ui2/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui2/tooltip';
import { cn } from '@/lib/utils';
import { messageService } from '@/services/messageService';
import type { Mensagem } from '@/services/types';
import { trackEvent } from '@/utils/analytics';
import { formatDateTZ, formatRelativeDate } from '@/utils/date';
// import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';
// import { Directory, Filesystem } from '@capacitor/filesystem';
import { Download, Eye, Loader2, Mail, MailOpen, User } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner-native';

interface MessageCardProps {
  message: Mensagem;
  onMarkAsRead: (codigo: string) => void;
  onMarkAsUnread: (codigo: string) => void;
}

function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'doc':
    case 'docx': return 'application/msword';
    case 'xls':
    case 'xlsx': return 'application/vnd.ms-excel';
    default: return 'application/octet-stream';
  }
}


export function MessageCard({ message, onMarkAsRead , onMarkAsUnread}: MessageCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isView, setIsView] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showReadMore, setShowReadMore] = useState(false);
  const [isTitleOverflowing, setTitleOverflowing] = useState(false);
  
  useEffect(() => {
    const titleEl = titleRef.current;
    const contentEl = contentRef.current;
    if (!titleEl || !contentEl) return;
  
    const checkOverflow = () => {
      const titleLineHeight = parseFloat(getComputedStyle(titleEl).lineHeight);
      const titleMaxLines = 2;
      const titleMaxHeight = titleLineHeight * titleMaxLines;
      const titleOverflowing = titleEl.scrollHeight > titleMaxHeight + 1;
      setTitleOverflowing(titleOverflowing); 
  
      const contentLineHeight = parseFloat(getComputedStyle(contentEl).lineHeight);
      const contentMaxLines = 4;
      const contentMaxHeight = contentLineHeight * contentMaxLines;
      const contentOverflowing = contentEl.scrollHeight > contentMaxHeight + 1;
  
      const shouldShowReadMore = titleOverflowing || contentOverflowing;
      setShowReadMore(shouldShowReadMore);
  
      if (!shouldShowReadMore && isExpanded) {
        setIsExpanded(false);
      }
    };
  
    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(titleEl);
    resizeObserver.observe(contentEl);
  
    window.addEventListener("resize", checkOverflow);
  
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [message.descricao, message.conteudo, isExpanded]);


  const handleToggle = () => {
    if (!showReadMore) return;

    if (isExpanded && cardRef.current) {
      const cardTop = cardRef.current.getBoundingClientRect().top + window.scrollY;
      setTimeout(() => {
        window.scrollTo({ top: cardTop, behavior: "auto" });
      }, 0);
    }

    setIsExpanded(prev => !prev);

    if (!isExpanded) {
      trackEvent('notice_open', { codigo: message.codigo });
    }
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
    trackEvent('notice_open', { codigo: message.codigo });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };
		
  const handleViewAttachment = async () => {
    setIsView(true);
    try {
      const blob = await messageService.downloadAttachment(message.codigo, 'ver');
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async function(){
        let base64 = reader.result.toString();
        console.log("Message Nome :  "+ message.anexoNome);
        //let nome = 'anexo'+Date.now()+'.pdf'
        let nome = (message.anexoNome || `anexo_${Date.now()}.pdf`)
        .replace(/[\/\\:*?"<>|]/g, '_');
        await Filesystem.writeFile({
          path: nome,
          data: base64,
          directory: Directory.Cache
        }).then((res) =>{
          const openDocument = async () => {
            try {
              const fileOpenerOptions: FileOpenerOptions = {
                filePath: res.uri,
                contentType: getMimeType(nome),
                openWithDefault: true,
              };
              await FileOpener.open(fileOpenerOptions);
            } catch (e) {
              console.log('Error opening file', e);
            }
          };
          openDocument();
        })
      }

      trackEvent('attachment_download', { codigo: message.codigo });
    } catch (error) {
      toast.error('Erro ao baixar anexo');
    } finally {
      setIsView(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await messageService.downloadAttachment(message.codigo, 'baixar');
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async function(){
        let base64 = reader.result.toString();
        let nome = (message.anexoNome || `anexo_${Date.now()}.pdf`)
        .replace(/[\/\\:*?"<>|]/g, '_');
        await Filesystem.writeFile({
          path: nome,
          data: base64,
          directory: Directory.Documents
        }).then((res) =>{
          const openDocument = async () => {
            try {
              const fileOpenerOptions: FileOpenerOptions = {
                filePath: res.uri,
                contentType: getMimeType(nome),
                openWithDefault: false,
              };
              await FileOpener.open(fileOpenerOptions);
            } catch (e) {
              console.log('Error opening file', e);
            }
          };
          toast.success('Anexo baixado com sucesso', {
            action: {
              label: "Ver",
              onPress: () => {
                openDocument();
              }
            }
          });
        })
      }

      trackEvent('attachment_download', { codigo: message.codigo });
    } catch (error) {
      toast.error('Erro ao baixar anexo');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
      <Card
        ref={cardRef} 
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "transition-shadow shadow-lg hover:shadow-xl",
          message.lida === "S" && "opacity-70"
        )}
        aria-label={`Aviso: ${message.descricao}. ${message.lida === 'S' ? 'Lido' : 'Não lido'}. ${message.critico ? 'Crítico.' : ''}`}
      >
        <CardContent className="p-4 space-y-2">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-3 mb-2">
            <div
                className={cn(
                  "flex gap-3 flex-1 min-w-0 transition-all duration-300",
                  isTitleOverflowing ? "items-start" : "items-center"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center flex-shrink-0">
                  {message.lida === 'S' && <MailOpen className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />}
                  {message.lida === 'N' && <Mail className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
				  	ref={titleRef}
                    className={cn(
                      "leading-tight",
                      message.lida
                        ? "font-medium text-foreground/80"
                        : "font-semibold text-foreground",
                      !isExpanded && "line-clamp-2"
                    )}
                    title={message.descricao}
                  >
                    {message.descricao}
                  </h3>
                  {message.destinatario && (
                    <p className="flex items-center gap-2 mt-1 text-xs text-muted-foreground leading-none">
                    <User className="w-3.5 h-2.5 text-muted-foreground" />
                    <span className="text-[0.8rem] leading-none truncate">
                      {message.destinatario}
                    </span>
                  </p>
                  )}
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs font-medium text-[hsl(var(--tertiary))] whitespace-nowrap cursor-help flex-shrink-0">
                    {formatRelativeDate(message.data)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatDateTZ(message.data, 'dd/MM/yyyy HH:mm')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {/* 🔹 ALTERAÇÃO: Conteúdo com "Ler mais / Ler menos" */}
            <p
              ref={contentRef}
              className={cn(
                "text-sm text-muted-foreground whitespace-pre-wrap break-words overflow-hidden prose prose-sm max-w-none [&_a]:text-primary [&_a]:font-semibold [&_a]:underline hover:[&_a]:text-primary/80 transition-all duration-300",
                isExpanded ? "" : "line-clamp-4" // 🔹 linha truncada quando não expandido
              )}
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
              dangerouslySetInnerHTML={{ __html: message.conteudo }}
              onClick={(e:any) => {
                if ((e.target as HTMLElement).tagName === 'A') e.stopPropagation();
              }}
            />

            {showReadMore && (
              <Button
                onPress={(e) => {
                  e.stopPropagation();
                  handleToggle();
                  setIsExpanded(!isExpanded);
                  if (!isExpanded) trackEvent('notice_open', { codigo: message.codigo });
                }}
                variant="ghost"
                size="sm"
                className="px-0 py-0 h-auto text-[hsl(var(--tertiary))] hover:text-[hsl(var(--tertiary))]/80 hover:bg-transparent font-medium no-underline"
              >
                {isExpanded ? "Ler menos" : "Ler mais"}
              </Button>
            )}

            {/* <MessageBadge message={message} /> */}
          </div>
        
        <div className="flex flex-wrap justify-center gap-2">
        {message.lida === 'N' && (
              <Button
                onPress={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(message.codigo);
                  trackEvent('notice_marked_read', { codigo: message.codigo });
                }}
                variant="outline"
                size="sm"
                className="flex-[1_1_100%] order-1"
              >
                <>
                  <Mail className="mr-2 w-4 h-4" />
                  Marcar como lida
                </>
              </Button>
            )}

            {message.lida === 'S' && (
              <Button
                onPress={(e) => {
                  e.stopPropagation();
                  onMarkAsUnread(message.codigo);
                  trackEvent('notice_marked_unread', { codigo: message.codigo });
                }}
                variant="outline"
                size="sm"
                className="flex-[1_1_100%] order-1"
              >
                <>
                  <MailOpen className="mr-2 w-4 h-4" />
                  Marcar como não lida
                </>
              </Button>
            )}

            {message.anexo && message.anexo.trim().toUpperCase() !== 'N' && message.anexoNome && (
             <>
              <Button
                  onPress={(e) => {
                    e.stopPropagation();
                    handleViewAttachment();
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 order-2"
                  disabled={isView ||isDownloading}
              >
                  {isView ? (
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  ) : (
                    <>
                    <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </>
                  )}
             </Button>
             <Button
                onPress={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                variant="secondary"
                size="sm"
                className="flex-1 order-2"
                disabled={isDownloading || isView}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                ) : (
                  <Download className="mr-2 w-4 h-4" />
                )}
                Anexo
              </Button>
              </>
            )}
        </div>
      </CardContent>
    </Card>
  );
}