'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ChatData } from '@/lib/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MessageCircle, Calendar, Users, FileText, Image, Music, Video } from 'lucide-react';

interface ChatStatisticsProps {
  chatData: ChatData;
}

export function ChatStatistics({ chatData }: ChatStatisticsProps) {
  const totalMessages = chatData.messages.length;
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
  const firstDate = firstMessage ? format(firstMessage.timestamp, 'dd MMMM yyyy', { locale: tr }) : '';
  const lastDate = lastMessage ? format(lastMessage.timestamp, 'dd MMMM yyyy', { locale: tr }) : '';
  
  return (
    <Card className="bg-[#202C33] border-[#3B4A54] p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Messages */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00A884]/10 rounded-lg">
            <MessageCircle className="h-5 w-5 text-[#00A884]" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Toplam Mesaj</p>
            <p className="text-lg font-semibold text-white">{totalMessages.toLocaleString('tr-TR')}</p>
          </div>
        </div>
        
        {/* Participants */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Katılımcı</p>
            <p className="text-lg font-semibold text-white">{participants}</p>
          </div>
        </div>
        
        {/* Date Range */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Tarih Aralığı</p>
            <p className="text-sm font-medium text-white">{firstDate}</p>
            <p className="text-xs text-gray-400">- {lastDate}</p>
          </div>
        </div>
        
        {/* Media Count */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Image className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Medya Dosyası</p>
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
      <div className="mt-4 pt-4 border-t border-[#3B4A54]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-400">İlk Mesaj</p>
            <p className="text-white font-medium">
              {firstMessage ? format(firstMessage.timestamp, 'dd.MM.yyyy HH:mm', { locale: tr }) : 'N/A'}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400">Son Mesaj</p>
            <p className="text-white font-medium">
              {lastMessage ? format(lastMessage.timestamp, 'dd.MM.yyyy HH:mm', { locale: tr }) : 'N/A'}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400">Sohbet Süresi</p>
            <p className="text-white font-medium">
              {firstMessage && lastMessage ? 
                Math.ceil((lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime()) / (1000 * 60 * 60 * 24)) + ' gün'
                : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}