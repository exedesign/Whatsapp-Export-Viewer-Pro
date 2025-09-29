'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatHeader } from '@/components/chat-header';
import { ChatMessage } from '@/components/chat-message';
import { LoadingProgress } from '@/components/loading-progress';
import { ChatStatistics } from '@/components/chat-statistics';
import { Message, ChatData } from '@/lib/types';
import { parseWhatsAppChat } from '@/lib/chat-parser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import JSZip from 'jszip';

export default function Home() {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Map<string, Blob>>(new Map());
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'reading' | 'extracting' | 'parsing' | 'processing' | 'complete'>('reading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<string>('');
  
  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      mediaUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mediaUrls]);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processZipFile(file);
  };

  const processZipFile = async (file: File) => {
    setIsLoading(true);
    setCurrentFileName(file.name);
    
    try {
      // Stage 1: Reading ZIP file
      setLoadingStage('reading');
      setLoadingProgress(10);
      setCurrentStep('ZIP dosyası okunuyor...');
      
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
      setCurrentStep('Medya dosyaları çıkarılıyor...');

      // Cleanup previous URLs
      mediaUrls.forEach(url => URL.revokeObjectURL(url));
      const newMediaUrls: string[] = [];

      // Extract media files
      const mediaFiles = new Map<string, string>();
      const mediaExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.avi', '.mov', '.3gp', '.mp3', '.aac', '.ogg', '.opus', '.pdf', '.doc', '.docx', '.txt'];
      
      const mediaFileEntries = Object.entries(zipContent.files).filter(([fileName, zipEntry]) => 
        !zipEntry.dir && mediaExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
      );
      
      const totalMediaFiles = mediaFileEntries.length;
      let processedFiles = 0;
      
      for (const [fileName, zipEntry] of mediaFileEntries) {
        try {
          setCurrentStep(`Medya dosyası işleniyor: ${fileName}`);
          const blob = await zipEntry.async('blob');
          const url = URL.createObjectURL(blob);
          mediaFiles.set(fileName, url);
          newMediaUrls.push(url);
          
          processedFiles++;
          const progress = 30 + (processedFiles / totalMediaFiles) * 40; // 30-70% range
          setLoadingProgress(progress);
        } catch (error) {
          console.error('Medya dosyası yüklenemedi:', fileName, error);
        }
      }

      // Stage 3: Parsing chat data
      setLoadingStage('parsing');
      setLoadingProgress(75);
      setCurrentStep('Sohbet verileri ayrıştırılıyor...');

      const text = await chatFile.async("string");
      setLoadingProgress(85);
      
      // Stage 4: Processing
      setLoadingStage('processing');
      setCurrentStep('Mesajlar işleniyor...');
      
      const parsedChat = parseWhatsAppChat(text, mediaFiles);
      setLoadingProgress(95);
      
      // Complete
      setLoadingStage('complete');
      setLoadingProgress(100);
      setCurrentStep('Tamamlandı!');
      
      setChatData(parsedChat);
      setMediaUrls(newMediaUrls);
      
      // Store media files for cleanup later
      setAttachments(new Map(Array.from(mediaFiles.entries()).map(([key, value]) => [key, new Blob()])));
      
      // Hide loading after a short delay
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error("ZIP dosyası işlenirken hata:", error);
      alert("ZIP dosyası işlenirken hata oluştu. Lütfen geçerli bir WhatsApp export dosyası seçin.");
      setIsLoading(false);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.zip')) {
        await processZipFile(file);
      } else {
        alert('Lütfen bir ZIP dosyası seçin.');
      }
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    const element = document.querySelector(`[data-date="${date.toISOString().split('T')[0]}"]`);
    element?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const filteredMessages = chatData?.messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery)
  );

  return (
    <div 
      className="min-h-screen bg-[#111B21] relative"
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
        />
      )}

      {/* Drag & Drop Overlay */}
      {dragActive && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center pointer-events-none select-none">
          <div className="bg-[#00A884] rounded-xl p-8 text-white text-center shadow-2xl border-4 border-dashed border-white">
            <Upload className="mx-auto h-16 w-16 mb-4" />
            <h3 className="text-2xl font-bold mb-2">WhatsApp ZIP Dosyasını Bırakın</h3>
            <p className="text-lg opacity-90">Sohbet verileri otomatik olarak yüklenecek</p>
          </div>
        </div>
      )}

      {!chatData ? (
        <div className="h-screen flex flex-col">
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <Input
                type="file"
                accept=".zip"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#00A884] hover:bg-[#00806A] text-white"
                disabled={isLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                WhatsApp Sohbeti Yükle
              </Button>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm pb-4">
            Bu uygulama çevrimdışı çalışır ve verileriniz yerel olarak işlenir.
            <br />
            <span className="text-xs">Yaratıcı: Fatih Eke © 2025</span>
          </div>
        </div>
      ) : (
        <>
          <ChatHeader onSearch={handleSearch} onDateSelect={handleDateSelect} />
          
          {/* Chat Statistics */}
          <div className="container mx-auto max-w-4xl px-4 pt-4">
            <ChatStatistics chatData={chatData} />
          </div>
          
          {/* Drag & Drop hint for existing chat */}
          <div className="bg-[#202C33] border-b border-[#313D45] px-4 py-2 text-center">
            <p className="text-xs text-gray-400">
              💡 İpucu: Başka bir WhatsApp ZIP dosyasını ekrana sürükleyip bırakarak değiştirebilirsiniz
            </p>
          </div>
          
          <div className="container mx-auto max-w-4xl p-4">
            <div className="space-y-4">
              {filteredMessages?.map((message, index) => {
                let messageDate;
                try {
                  messageDate = message.timestamp.toISOString().split('T')[0];
                } catch (error) {
                  console.error('Invalid date:', message.timestamp);
                  messageDate = 'Invalid Date';
                }
                
                const prevMessage = index > 0 ? filteredMessages[index - 1] : null;
                let prevMessageDate;
                try {
                  prevMessageDate = prevMessage?.timestamp.toISOString().split('T')[0];
                } catch (error) {
                  prevMessageDate = 'Invalid Date';
                }
                
                return (
                  <div key={index}>
                    {(!prevMessage || messageDate !== prevMessageDate) && (
                      <div
                        data-date={messageDate}
                        className="text-center text-sm text-gray-400 my-4"
                      >
                        {messageDate !== 'Invalid Date' 
                          ? new Date(messageDate).toLocaleDateString()
                          : 'Unknown Date'}
                      </div>
                    )}
                    <ChatMessage
                      message={message}
                      isCurrentUser={message.sender === chatData.currentUser}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}