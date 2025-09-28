export interface Attachment {
  type: 'image' | 'video' | 'audio' | 'document' | 'sticker';
  url?: string;
  thumbnailUrl?: string;
  fileName?: string;
}

export interface Message {
  timestamp: Date;
  sender: string;
  content: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document' | 'sticker';
  mediaUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  attachments?: Attachment[];
}

export interface ChatData {
  messages: Message[];
  currentUser: string;
  participant: string;
}