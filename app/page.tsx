'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatHeader } from '@/components/chat-header';
import { ChatMessage } from '@/components/chat-message';
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
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      console.log('Files in zip:', Object.keys(zipContent.files));

      const chatFile = zipContent.file("_chat.txt");
      if (!chatFile) {
        console.error("No _chat.txt file found in the zip");
        return;
      }

      const text = await chatFile.async("string");
      const parsedChat = parseWhatsAppChat(text);
      setChatData(parsedChat);
    } catch (error) {
      console.error("Error processing zip file:", error);
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
    <div className="min-h-screen bg-[#111B21]">
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
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload WhatsApp Chat
              </Button>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm pb-4">
            This app functions offline and the data is parsed locally.
          </div>
        </div>
      ) : (
        <>
          <ChatHeader onSearch={handleSearch} onDateSelect={handleDateSelect} />
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