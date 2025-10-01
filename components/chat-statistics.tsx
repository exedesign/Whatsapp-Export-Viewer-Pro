'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ChatData } from '@/lib/types';
import { formatDate, DATE_PATTERNS } from '@/lib/date-format';
import { MessageCircle, Calendar, Users, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatStatisticsProps {
  chatData: ChatData;
}

export function ChatStatistics({ chatData }: ChatStatisticsProps) {
  const totalMessages = chatData.messages.length;
  const { t, i18n } = useTranslation('common');
  const firstMessage = chatData.messages[0];
  const lastMessage = chatData.messages[totalMessages - 1];
  
  // Unique participants count
  const participants = new Set(chatData.messages.map(m => m.sender)).size;
  
  // Media counts
  const mediaStats = chatData.messages.reduce((acc, message) => {
    if (message.mediaType) {
      if (message.mediaType === 'image') acc.images++;
      else if (message.mediaType === 'video') acc.videos++;
      else if (message.mediaType === 'audio') acc.audios++;
      else acc.files++;
    }
    return acc;
  }, { images: 0, videos: 0, audios: 0, files: 0 });
  
  // Date range
  const lang = i18n.language;
  const firstDate = firstMessage ? formatDate(firstMessage.timestamp, DATE_PATTERNS.full, lang) : '';
  const lastDate = lastMessage ? formatDate(lastMessage.timestamp, DATE_PATTERNS.full, lang) : '';
  
  return (
  <Card className="p-4 mb-4 bg-[var(--wa-stat-card-bg)] border-[var(--wa-stat-card-border)] text-[var(--wa-bubble-in-text)] transition-colors">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Messages */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[color:var(--wa-accent)]/10">
            <MessageCircle className="h-5 w-5 text-[var(--wa-accent)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--wa-bubble-meta)]">{t('stats.totalMessages')}</p>
            <p className="text-lg font-semibold text-[var(--wa-bubble-in-text)]">{new Intl.NumberFormat(i18n.language).format(totalMessages)}</p>
          </div>
        </div>
        
        {/* Participants */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-[var(--wa-bubble-meta)]">{t('stats.participants')}</p>
            <p className="text-lg font-semibold text-[var(--wa-bubble-in-text)]">{participants}</p>
          </div>
        </div>
        
        {/* Date Range */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Calendar className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-[var(--wa-bubble-meta)]">{t('stats.dateRange')}</p>
            <p className="text-sm font-medium text-[var(--wa-bubble-in-text)]">{firstDate}</p>
            <p className="text-xs text-[var(--wa-bubble-meta)]">- {lastDate}</p>
          </div>
        </div>
        
        {/* Media Count */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Image className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-[var(--wa-bubble-meta)]">{t('stats.mediaFiles')}</p>
            <div className="flex gap-2 text-xs">
              {mediaStats.images > 0 && (
                <span className="text-green-400">📷 {mediaStats.images}</span>
              )}
              {mediaStats.videos > 0 && (
                <span className="text-red-400">🎥 {mediaStats.videos}</span>
              )}
              {mediaStats.audios > 0 && (
                <span className="text-blue-400">🎵 {mediaStats.audios}</span>
              )}
              {mediaStats.files > 0 && (
                <span className="text-yellow-400">📄 {mediaStats.files}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Stats Row */}
      <div className="mt-4 pt-4 border-t border-[var(--wa-stat-card-border)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-[var(--wa-bubble-meta)]">{t('stats.firstMessage')}</p>
            <p className="text-[var(--wa-bubble-in-text)] font-medium">
              {firstMessage ? formatDate(firstMessage.timestamp, DATE_PATTERNS.dateTime, lang) : 'N/A'}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-[var(--wa-bubble-meta)]">{t('stats.lastMessage')}</p>
            <p className="text-[var(--wa-bubble-in-text)] font-medium">
              {lastMessage ? formatDate(lastMessage.timestamp, DATE_PATTERNS.dateTime, lang) : 'N/A'}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-[var(--wa-bubble-meta)]">{t('stats.chatDuration')}</p>
            <p className="text-[var(--wa-bubble-in-text)] font-medium">
              {firstMessage && lastMessage ? 
                Math.ceil((lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime()) / (1000 * 60 * 60 * 24)) + ' ' + t('stats.daysSuffix')
                : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}