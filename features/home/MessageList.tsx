// Message List Component

import type { Mensagem } from '@/services/types';
import { MessageCard } from './MessageCard';

interface MessageListProps {
  messages: Mensagem[];
  onMarkAsRead: (codigo: string) => void;
  onMarkAsUnread: (codigo: string) => void;
}

export function MessageList({ messages, onMarkAsRead , onMarkAsUnread}: MessageListProps) {
  return (
    <div className="px-4 space-y-3 mb-4">
      {messages.map(message => (
        <MessageCard
          key={message.codigo}
          message={message}
          onMarkAsRead={onMarkAsRead}
          onMarkAsUnread={onMarkAsUnread}
        />
      ))}
    </div>
  );
}