'use client';

import { Message } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const formattedTime = (() => {
    try {
      const date = new Date(message.timestamp);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return format(date, 'h:mm a');
    } catch (error) {
      return '(unknown time)';
    }
  })();

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <Card className={`max-w-[70%] p-3 ${
        isCurrentUser ? 'bg-[#005C4B] text-white' : 'bg-[#202C33] text-white'
      }`}>
        <div className="text-xs text-gray-400 mb-1">{message.sender}</div>
        <div className="text-sm">{message.content}</div>
        <div className="text-xs text-gray-400 text-right mt-1">
          {formattedTime}
        </div>
      </Card>
    </div>
  );
}