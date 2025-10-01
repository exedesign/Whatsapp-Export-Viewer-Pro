'use client';

import { Message } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Download, FileText, Image, Music, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaViewer } from '@/components/media-viewer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Utility function to make links and emails clickable
const renderContentWithLinks = (content: string) => {
  // Combined regex for URLs and emails
  const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[^\s]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
  
  const parts = content.split(linkRegex);
  
  return parts.map((part, index) => {
    if (linkRegex.test(part)) {
      let url = part;
      let isEmail = false;
      
      // Check if it's an email
      if (part.includes('@') && !part.includes('://')) {
        url = 'mailto:' + part;
        isEmail = true;
      }
      // Add protocol if missing for URLs
      else if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline break-all hover:bg-blue-50 hover:bg-opacity-20 px-1 rounded transition-colors"
          onClick={(e) => e.stopPropagation()}
          title={isEmail ? `Email gönder: ${part}` : `Aç: ${part}`}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const [mediaViewer, setMediaViewer] = useState<{
    isOpen: boolean;
    url: string;
    type: 'image' | 'video' | 'audio';
    fileName?: string;
  }>({ isOpen: false, url: '', type: 'image' });
  const { t } = useTranslation('common');

  const formattedTime = (() => {
    try {
      const date = new Date(message.timestamp);
      if (isNaN(date.getTime())) {
        // Fallback: try to parse timestamp as string
        const timeMatch = String(message.timestamp).match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          return `${timeMatch[1]}:${timeMatch[2]}`;
        }
        throw new Error('Invalid date');
      }
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Timestamp parsing error:', message.timestamp, error);
      return '(bilinmeyen saat)';
    }
  })();

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleMediaClick = (url: string, mediaType: string, fileName?: string) => {
    // Electron ortamında medya görüntüleyici kullan
    if (mediaType === 'image' || mediaType === 'sticker') {
      setMediaViewer({
        isOpen: true,
        url,
        type: 'image',
        fileName
      });
    } else if (mediaType === 'video') {
      setMediaViewer({
        isOpen: true,
        url,
        type: 'video',
        fileName
      });
    } else if (mediaType === 'audio') {
      setMediaViewer({
        isOpen: true,
        url,
        type: 'audio',
        fileName
      });
    } else {
      // Diğer dosya türleri için indirme
      handleDownload(url, fileName || 'dosya');
    }
  };

  return (
    <>
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
        <Card
          className={`max-w-[70%] p-3 shadow-sm transition-colors ${
            isCurrentUser
              ? 'bubble-out ml-auto'
              : 'bubble-in'
          }`}
          style={{
            background: isCurrentUser ? 'var(--wa-bubble-out)' : 'var(--wa-bubble-in)',
            color: isCurrentUser ? 'var(--wa-bubble-out-text)' : 'var(--wa-bubble-in-text)'
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] tracking-wide">
              <span className={`font-medium ${isCurrentUser ? 'opacity-80 text-[var(--wa-bubble-out-text)]' : 'bubble-meta'}`}>
                {message.sender}
              </span>
              <span className={`bubble-meta ml-3 ${isCurrentUser ? 'opacity-80 text-[var(--wa-bubble-out-text)]' : ''}`}>
                {formattedTime}
              </span>
            </div>

            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed [&_a]:text-[var(--wa-link)] [&_a]:hover:text-[var(--wa-accent-strong)]">
                {renderContentWithLinks(message.content)}
              </p>
            )}

            {message.mediaUrl && (
              <div className="mt-2">
                {message.mediaType === 'image' && (
                  <div className="space-y-2">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => handleMediaClick(message.mediaUrl!, message.mediaType!, message.fileName)}
                    >
                      <img
                        src={message.mediaUrl}
                        alt={message.fileName || 'Resim'}
                        className="max-w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow max-h-64 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <div class="text-gray-400">${getMediaIcon('image')}</div>
                                <span class="text-sm text-gray-600">${message.fileName || 'Resim yüklenemedi'}</span>
                              </div>
                            `;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                        <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMediaClick(message.mediaUrl!, message.mediaType!, message.fileName);
                        }}
                        className={`h-6 text-xs ${isCurrentUser ? 'hover:opacity-100 opacity-80 text-[var(--wa-bubble-out-text)] hover:bg-[var(--wa-accent)]/20' : 'text-[var(--wa-bubble-in-text)] hover:bg-[var(--wa-accent)]/10'}`}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('media.show')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(message.mediaUrl!, message.fileName || 'resim.jpg');
                        }}
                        className={`h-6 text-xs ${isCurrentUser ? 'hover:opacity-100 opacity-80 text-[var(--wa-bubble-out-text)] hover:bg-[var(--wa-accent)]/20' : 'text-[var(--wa-bubble-in-text)] hover:bg-[var(--wa-accent)]/10'}`}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {t('media.download')}
                      </Button>
                    </div>
                  </div>
                )}

                {message.mediaType === 'video' && (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden bg-black">
                      <video
                        controls
                        className="w-full max-h-64 object-contain"
                        preload="metadata"
                        onError={(e) => {
                          // Video yüklenemezse placeholder göster
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="bg-gray-900 rounded-lg p-4 text-center cursor-pointer" onclick="handleMediaClick('${message.mediaUrl}', '${message.mediaType}', '${message.fileName}')">
                                <div class="h-12 w-12 text-white mx-auto mb-2 flex items-center justify-center">
                                  <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                                <p class="text-white text-sm">${message.fileName || 'Video Dosyası'}</p>
                              </div>
                            `;
                          }
                        }}
                      >
                        <source src={message.mediaUrl} type="video/mp4" />
                        <source src={message.mediaUrl} type="video/webm" />
                        <source src={message.mediaUrl} type="video/ogg" />
                        Video oynatılamıyor. Tarayıcınız bu formatı desteklemiyor.
                      </video>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMediaClick(message.mediaUrl!, message.mediaType!, message.fileName);
                        }}
                        className={`h-6 text-xs ${isCurrentUser ? 'hover:opacity-100 opacity-80 text-[var(--wa-bubble-out-text)] hover:bg-[var(--wa-accent)]/20' : 'text-[var(--wa-bubble-in-text)] hover:bg-[var(--wa-accent)]/10'}`}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('media.fullscreen')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(message.mediaUrl!, message.fileName || 'video.mp4');
                        }}
                        className={`h-6 text-xs ${isCurrentUser ? 'hover:opacity-100 opacity-80 text-[var(--wa-bubble-out-text)] hover:bg-[var(--wa-accent)]/20' : 'text-[var(--wa-bubble-in-text)] hover:bg-[var(--wa-accent)]/10'}`}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {t('media.download')}
                      </Button>
                    </div>
                  </div>
                )}

                {message.mediaType === 'audio' && (
                  <div className="space-y-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <Music className="h-6 w-6 text-white flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {message.fileName || t('media.audioFile')}
                          </p>
                        </div>
                      </div>
                      <audio
                        controls
                        className="w-full h-8"
                        preload="metadata"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          console.error('Audio loading error:', e);
                          // Hata durumunda placeholder göster
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'text-white text-xs text-center py-2';
                            errorDiv.textContent = 'Ses dosyası yüklenemedi';
                            parent.appendChild(errorDiv);
                          }
                        }}
                      >
                        <source src={message.mediaUrl} type="audio/mpeg" />
                        <source src={message.mediaUrl} type="audio/wav" />
                        <source src={message.mediaUrl} type="audio/ogg" />
                        Tarayıcınız bu ses formatını desteklemiyor.
                      </audio>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMediaClick(message.mediaUrl!, message.mediaType!, message.fileName);
                        }}
                        className={`h-6 text-xs ${isCurrentUser ? 'hover:opacity-100 opacity-80 text-[var(--wa-bubble-out-text)] hover:bg-[var(--wa-accent)]/20' : 'text-[var(--wa-bubble-in-text)] hover:bg-[var(--wa-accent)]/10'}`}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('media.fullscreen')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(message.mediaUrl!, message.fileName || 'ses.mp3');
                        }}
                        className={`h-6 text-xs ${isCurrentUser ? 'hover:opacity-100 opacity-80 text-[var(--wa-bubble-out-text)] hover:bg-[var(--wa-accent)]/20' : 'text-[var(--wa-bubble-in-text)] hover:bg-[var(--wa-accent)]/10'}`}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {t('media.download')}
                      </Button>
                    </div>
                  </div>
                )}

                {message.mediaType === 'document' && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {message.fileName || t('media.file')}
                      </p>
                      <p className="text-xs text-gray-500">{t('media.file')}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(message.mediaUrl!, message.fileName || 'belge');
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {message.mediaType === 'sticker' && (
                  <div className="space-y-2">
                    <div 
                      className="relative group cursor-pointer inline-block"
                      onClick={() => handleMediaClick(message.mediaUrl!, message.mediaType!, message.fileName)}
                    >
                      <img
                        src={message.mediaUrl}
                        alt="Sticker"
                        className="w-32 h-32 object-contain rounded-lg hover:shadow-lg transition-shadow"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-32 h-32 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <span class="text-gray-400 text-xs">Sticker</span>
                              </div>
                            `;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                        <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMediaClick(message.mediaUrl!, message.mediaType!, message.fileName);
                        }}
                        className={`h-6 text-xs ${isCurrentUser ? 'text-blue-100 hover:text-white hover:bg-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('media.show')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(message.mediaUrl!, message.fileName || 'sticker.webp');
                        }}
                        className={`h-6 text-xs ${isCurrentUser ? 'text-blue-100 hover:text-white hover:bg-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {t('media.download')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      <MediaViewer
        isOpen={mediaViewer.isOpen}
        onClose={() => setMediaViewer(prev => ({ ...prev, isOpen: false }))}
        mediaUrl={mediaViewer.url}
        mediaType={mediaViewer.type}
        fileName={mediaViewer.fileName}
      />
    </>
  );
}