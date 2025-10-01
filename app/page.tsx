'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatHeader } from '@/components/chat-header';
import { ChatMessage } from '@/components/chat-message';
import { LoadingProgress } from '@/components/loading-progress';
import { ChatStatistics } from '@/components/chat-statistics';
import { Message, ChatData } from '@/lib/types';
import { parseWhatsAppChat, parseWhatsAppChatAsync } from '@/lib/chat-parser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, DATE_PATTERNS } from '@/lib/date-format';
import JSZip from 'jszip';

export default function Home() {
  interface ChatSession {
    id: string;
    fileName: string;
    chatData: ChatData;
    mediaFiles: Map<string, string>; // fileName -> objectURL
    mediaUrls: string[]; // revoke için list
    addedAt: number;
    originalZip?: File; // Yedekleme için orijinal ZIP referansı
  }

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const activeChat = chats.find(c => c.id === selectedChatId) || null;
  const { t, i18n } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Map<string, Blob>>(new Map()); // TODO: Çoklu chat bazlı ayrıştırılabilir
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'reading' | 'extracting' | 'parsing' | 'processing' | 'complete'>('reading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [batchTotal, setBatchTotal] = useState<number | null>(null);
  const [batchIndex, setBatchIndex] = useState<number | null>(null);
  const [mediaProcessed, setMediaProcessed] = useState<number>(0);
  const [mediaTotal, setMediaTotal] = useState<number>(0);
  const [lineProcessed, setLineProcessed] = useState<number>(0);
  const [lineTotal, setLineTotal] = useState<number>(0);
  const [progressMinimized, setProgressMinimized] = useState<boolean>(false);
  // Scroll to bottom görünürlüğü
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  
  // Cleanup blob URLs when component unmounts
  // Component unmount -> tüm chat object URL temizliği
  useEffect(() => {
    return () => {
      chats.forEach(chat => chat.mediaUrls.forEach(url => URL.revokeObjectURL(url)));
    };
  }, [chats]);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const zipList = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.zip'));
    if (zipList.length === 0) return;
    setBatchTotal(zipList.length);
    for (let i = 0; i < zipList.length; i++) {
      setBatchIndex(i + 1);
      const isLast = i === zipList.length - 1;
      await processZipFile(zipList[i], isLast);
    }
    // batch tamamlandı
    setTimeout(() => { setBatchIndex(null); setBatchTotal(null); }, 800);
  };

  const processZipFile = async (file: File, isLast: boolean) => {
    setIsLoading(true);
    setCurrentFileName(file.name);
    setMediaProcessed(0); setMediaTotal(0); setLineProcessed(0); setLineTotal(0);
    
    try {
      // Stage 1: Reading ZIP file
      setLoadingStage('reading');
      setLoadingProgress(10);
  setCurrentStep(t('loading.reading'));
      
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      setLoadingProgress(25);

      const chatFile = zipContent.file("_chat.txt");
      if (!chatFile) {
        console.error("ZIP dosyasında _chat.txt dosyası bulunamadı");
        alert("ZIP dosyasında _chat.txt dosyası bulunamadı. Lütfen doğru WhatsApp export dosyasını seçin.");
        setIsLoading(false);
        return;
      }

      // Stage 2: Extracting media files
      setLoadingStage('extracting');
      setLoadingProgress(30);
  setCurrentStep(t('loading.extracting'));

  const newMediaUrls: string[] = [];

      // Extract media files
      const mediaFiles = new Map<string, string>();
      const mediaExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.avi', '.mov', '.3gp', '.mp3', '.aac', '.ogg', '.opus', '.pdf', '.doc', '.docx', '.txt'];
      
      const mediaFileEntries = Object.entries(zipContent.files).filter(([fileName, zipEntry]) => 
        !zipEntry.dir && mediaExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
      );
      const totalMediaFiles = mediaFileEntries.length;
      setMediaTotal(totalMediaFiles);
      let processedFiles = 0;
      
      for (const [fileName, zipEntry] of mediaFileEntries) {
        try {
          setCurrentStep(t('loading.mediaFile', { file: fileName }));
          const blob = await zipEntry.async('blob');
          const url = URL.createObjectURL(blob);
          mediaFiles.set(fileName, url);
          newMediaUrls.push(url);
          
          processedFiles++;
          setMediaProcessed(processedFiles);
          const progress = 30 + (processedFiles / totalMediaFiles) * 40; // 30-70% range
          setLoadingProgress(progress);
        } catch (error) {
          console.error('Medya dosyası yüklenemedi:', fileName, error);
        }
      }

      // Stage 3: Parsing chat data
      setLoadingStage('parsing');
      setLoadingProgress(75);
  setCurrentStep(t('loading.parsing'));

      const text = await chatFile.async("string");
      setLoadingProgress(85);
      
      // Stage 4: Processing
      setLoadingStage('processing');
  setCurrentStep(t('loading.processing'));
      
  const totalLines = text.split('\n').length;
  setLineTotal(totalLines);
      setLoadingStage('parsing');
      setLoadingProgress(75);
  setCurrentStep(t('loading.parsingLines'));
      const startParseTs = performance.now();
      const parsedChat = await parseWhatsAppChatAsync(text, mediaFiles, {
        chunkSize: 800,
        onProgress: (processed, total) => {
          const ratio = processed / total;
            const p = 75 + ratio * 20; // 75-95
            setLoadingProgress(p);
            // Her ~800 satırda bir güncelle
            if (processed % 800 === 0 || processed === total) {
              const elapsed = (performance.now() - startParseTs) / 1000; // s
              const speed = processed / elapsed; // satır/sn
              const remaining = total - processed;
              const etaSec = speed > 0 ? Math.ceil(remaining / speed) : 0;
              const etaTxt = etaSec > 0 ? ` ~${etaSec}s kaldı` : '';
              setCurrentStep(t('loading.parsingProgress', { processed, total, eta: etaTxt }));
            }
            setLineProcessed(processed);
        }
      });
      setLoadingProgress(95);
      
      // Complete
      setLoadingStage('complete');
      setLoadingProgress(100);
  setCurrentStep(t('loading.completed'));
      
      // Yeni chat oturumu oluştur
      const newChat: ChatSession = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        fileName: file.name,
        chatData: parsedChat,
        mediaFiles,
        mediaUrls: newMediaUrls,
        addedAt: Date.now(),
        originalZip: file
      };

      setChats(prev => {
        const next = [...prev, newChat];
        return next.sort((a,b) => a.addedAt - b.addedAt); // ekleme sırası
      });
      setSelectedChatId(newChat.id);
      // attachments state'i güncel (geri uyum) - tüm medya isimleri için placeholder
      setAttachments(new Map(Array.from(mediaFiles.entries()).map(([key]) => [key, new Blob()])));
      
      // Hide loading after a short delay
      if (isLast) {
        setTimeout(() => { setIsLoading(false); }, 400);
        setTimeout(() => { setBatchIndex(null); setBatchTotal(null); }, 600);
      }
      
    } catch (error) {
      console.error("ZIP dosyası işlenirken hata:", error);
      alert("ZIP dosyası işlenirken hata oluştu. Lütfen geçerli bir WhatsApp export dosyası seçin.");
  if (isLast) setIsLoading(false);
    }
  };

  // Drag & Drop handlers (flicker önleme için dragCounter kullan)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Sadece dosya sürüklemede overlay göster (metin sürükleme vb. hariç)
    const hasFiles = Array.from(e.dataTransfer?.types || []).includes('Files');

    if (e.type === 'dragenter') {
      if (hasFiles) {
        dragCounter.current += 1;
        setDragActive(true);
      }
    } else if (e.type === 'dragover') {
      if (hasFiles) {
        // dragover spam; sadece aktif kalmasını sağla
        if (!dragActive) setDragActive(true);
      }
    } else if (e.type === 'dragleave') {
      // relatedTarget null ise pencere dışına çıkılmış olabilir
      dragCounter.current = Math.max(0, dragCounter.current - 1);
      if (dragCounter.current === 0) {
        setDragActive(false);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragActive(false);
    const list = e.dataTransfer.files;
    if (!list || list.length === 0) return;
    const zipFiles = Array.from(list).filter(f => f.name.toLowerCase().endsWith('.zip'));
    if (zipFiles.length === 0) {
      alert('Lütfen ZIP dosyaları bırakın.');
      return;
    }
    // Çoklu dosya desteği: Birden fazla ZIP aynı anda sürüklenip bırakıldığında
    // hepsini sırayla (await ile) işliyoruz. Böylece UI ilerleme göstergesi
    // her dosya için ayrı ayrı güncelleniyor ve bellek kullanımını kontrol altında
    // tutuyoruz (aynı anda parallel decompress yapmıyoruz).
    setBatchTotal(zipFiles.length);
    for (let i = 0; i < zipFiles.length; i++) {
      setBatchIndex(i + 1);
      const isLast = i === zipFiles.length - 1;
      await processZipFile(zipFiles[i], isLast);
    }
    setTimeout(() => { setBatchIndex(null); setBatchTotal(null); }, 800);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    const element = document.querySelector(`[data-date="${date.toISOString().split('T')[0]}"]`);
    element?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const filteredMessages = activeChat?.chatData.messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery)
  );

  const handleSelectChat = (id: string) => setSelectedChatId(id);
  const handleRemoveChat = (id: string) => {
    setChats(prev => {
      const toRemove = prev.find(c => c.id === id);
      if (toRemove) {
        // URL revoke
        toRemove.mediaUrls.forEach(u => URL.revokeObjectURL(u));
      }
      const next = prev.filter(c => c.id !== id);
      if (next.length === 0) {
        setSelectedChatId(null);
      } else if (toRemove && toRemove.id === selectedChatId) {
        setSelectedChatId(next[next.length - 1].id);
      }
      return next;
    });
  };

  // Scroll izleme: belirli eşiği aşınca buton göster
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const handler = () => {
      // Kullanıcı en alta yakınsa gizle, değilse göster
      const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
      setShowScrollBottom(distanceFromBottom > 600); // ~600px eşiği
    };
    el.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => el.removeEventListener('scroll', handler);
  }, [messagesContainerRef, activeChat]);

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div 
      className="min-h-screen bg-[var(--wa-bg-secondary)] relative"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Loading Progress Modal */}
      {isLoading && (
        <LoadingProgress
          stage={loadingStage}
          progress={loadingProgress}
          fileName={currentFileName}
          currentStep={currentStep}
          batchIndex={batchIndex ?? undefined}
          batchTotal={batchTotal ?? undefined}
          mediaProcessed={mediaProcessed}
          mediaTotal={mediaTotal}
          lineProcessed={lineProcessed}
          lineTotal={lineTotal}
          minimized={progressMinimized}
          onToggleMinimize={() => setProgressMinimized(m => !m)}
        />
      )}

      {/* Drag & Drop Overlay */}
      {dragActive && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center pointer-events-none select-none">
          <div className="bg-[var(--wa-accent)] rounded-xl p-8 text-white text-center shadow-2xl border-4 border-dashed border-white">
            <Upload className="mx-auto h-16 w-16 mb-4" />
            <h3 className="text-2xl font-bold mb-2">{t('drop.title')}</h3>
            <p className="text-lg opacity-90">{t('drop.subtitle')}</p>
          </div>
        </div>
      )}

      {chats.length === 0 ? (
        <div className="h-screen flex flex-col">
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <Input
                type="file"
                accept=".zip"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[var(--wa-accent)] hover:bg-[var(--wa-accent-strong)] text-white"
                disabled={isLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {t('actions.loadChats')}
              </Button>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm pb-4">
            {t('empty.hint')}
            <br />
            <span className="text-xs">{t('app.creator')}</span>
          </div>
        </div>
      ) : (
        <div className="flex h-screen relative">
          {/* Sidebar (toggleable) */}
          {showSidebar && (
            <aside className="w-72 bg-[var(--wa-panel)] border-r border-[var(--wa-panel-border)] flex flex-col animate-in fade-in slide-in-from-left duration-200">
              <div className="p-3 border-b border-[var(--wa-panel-border)] flex items-center gap-2">
                <span className="text-sm text-[var(--wa-bubble-meta)] font-semibold flex-1">{t('sidebar.chats')} ({chats.length})</span>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>{t('actions.add')}</Button>
                <Button size="sm" variant="ghost" className="text-xs text-[var(--wa-bubble-meta)] hover:text-[var(--wa-accent)]" title={t('actions.hide')} onClick={() => setShowSidebar(false)}>⟨</Button>
                <Input
                  type="file"
                  accept=".zip"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {chats.map(chat => {
                  const msgCount = chat.chatData.messages.length;
                  const first = chat.chatData.messages[0];
                  const last = chat.chatData.messages[chat.chatData.messages.length - 1];
                  const dateRange = first && last ? `${first.timestamp.toLocaleDateString()} - ${last.timestamp.toLocaleDateString()}` : '';
                  const active = chat.id === selectedChatId;
                  const displayName = chat.chatData.participant || chat.fileName.replace(/^WhatsApp Chat -\s*/i, '').replace(/\.zip$/i, '');
                  return (
                    <div key={chat.id} className={`px-3 py-2 text-xs border-b border-[var(--wa-panel-border)]/40 cursor-pointer group ${active ? 'bg-[var(--wa-hover-strong)]' : 'hover:bg-[var(--wa-hover)]'}`}
                      onClick={() => handleSelectChat(chat.id)}
                    >
                      <div className="flex items-center justify-between text-[var(--wa-bubble-meta)]">
                        <span className="truncate max-w-[140px] text-[var(--wa-bubble-in-text)]" title={displayName}>{displayName}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveChat(chat.id); }}
                          className="opacity-0 group-hover:opacity-100 transition text-[var(--wa-bubble-meta)] hover:text-red-400"
                          title="Kaldır"
                        >✕</button>
                      </div>
                      <div className="text-[10px] text-[var(--wa-bubble-meta)] mt-1 flex justify-between">
                        <span>{msgCount} {t('sidebar.messages')}</span>
                      </div>
                      {dateRange && <div className="text-[10px] text-[var(--wa-bubble-meta)] mt-0.5">{dateRange}</div>}
                    </div>
                  );
                })}
                {chats.length === 0 && (
                  <div className="p-4 text-xs text-gray-500">Henüz sohbet yok</div>
                )}
              </div>
            </aside>
          )}
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="absolute top-3 left-3 z-20 bg-[var(--wa-panel)] text-[var(--wa-bubble-meta)] hover:text-[var(--wa-accent)] border border-[var(--wa-panel-border)] rounded px-2 py-1 text-xs shadow"
              title={t('actions.showChats')}
            >{t('actions.showChats')} ⟩</button>
          )}
          {/* Main panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeChat && (
              <>
                <ChatHeader onSearch={handleSearch} onDateSelect={handleDateSelect} chats={chats.map(c => ({ id: c.id, fileName: c.fileName, originalZip: c.originalZip }))} />
                <div className="px-4 pt-2 border-b border-[var(--wa-panel-border)] bg-[var(--wa-panel)] transition-colors">
                  <ChatStatistics chatData={activeChat.chatData} />
                </div>
                <div className="bg-[var(--wa-panel)] border-b border-[var(--wa-panel-border)] px-4 py-2 text-center text-xs text-[var(--wa-bubble-meta)]">
                  {t('hint.bulk')}
                </div>
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative">
                  {filteredMessages?.map((message, index) => {
                    let messageDate;
                    try { messageDate = message.timestamp.toISOString().split('T')[0]; } catch { messageDate = 'Invalid Date'; }
                    const prevMessage = index > 0 ? filteredMessages[index - 1] : null;
                    let prevMessageDate;
                    try { prevMessageDate = prevMessage?.timestamp.toISOString().split('T')[0]; } catch { prevMessageDate = 'Invalid Date'; }
                    return (
                      <div key={index}>
                        {(!prevMessage || messageDate !== prevMessageDate) && (
                          <div data-date={messageDate} className="flex justify-center my-6">
                            <span className="wa-date-pill px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                              {messageDate !== 'Invalid Date' ? formatDate(message.timestamp, DATE_PATTERNS.pill, i18n.language) : t('date.unknown')}
                            </span>
                          </div>
                        )}
                        <ChatMessage
                          message={message}
                          isCurrentUser={message.sender === activeChat.chatData.currentUser}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Scroll to bottom button */}
                {showScrollBottom && (
                  <button
                    onClick={scrollToBottom}
                    className="absolute bottom-5 right-5 z-30 p-3 rounded-full shadow-lg transition-colors bg-[var(--wa-accent)] hover:bg-[var(--wa-accent-strong)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--wa-focus-ring)] focus:ring-offset-2"
                    aria-label={t('actions.scrollToBottom')}
                    title={t('actions.scrollToBottom')}
                  >
                    ↓
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}