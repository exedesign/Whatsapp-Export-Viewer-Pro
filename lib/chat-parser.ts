import { Message, ChatData } from './types';

export function parseWhatsAppChat(chatContent: string, mediaFiles?: Map<string, string>): ChatData {
  const lines = chatContent.split('\n');
  const messages: Message[] = [];
  let currentUser = '';
  let participant = '';

  // Find current user from encryption message
  const encryptionLine = lines.find(line => line.includes('Messages and calls are end-to-end encrypted'));
  if (encryptionLine) {
    const match = encryptionLine.match(/\] (.*?):/);
    if (match) participant = match[1];
  }

  for (const line of lines) {
    const messageMatch = line.match(/\[(.*?)\] (.*?): (.*)/);
    if (messageMatch) {
      const [, timestamp, sender, content] = messageMatch;
      
      if (!currentUser && sender !== participant) {
        currentUser = sender;
      }

      const message: Message = {
        timestamp: parseWhatsAppTimestamp(timestamp),
        sender,
        content,
      };

      // Check if message contains media
      const mediaInfo = parseMediaContent(content, mediaFiles);
      if (mediaInfo) {
        message.mediaType = mediaInfo.mediaType;
        message.mediaUrl = mediaInfo.mediaUrl;
        message.fileName = mediaInfo.fileName;
      }

      messages.push(message);
    }
  }

  return { messages, currentUser, participant };
}

function parseMediaContent(content: string, mediaFiles?: Map<string, string>) {
  // Normalize carriage returns and trim once
  if (content.includes('\r')) {
    content = content.replace(/\r/g, '');
  }
  // (Trim edilmis hali bazı fallback kontrollerde kullanılıyor; ancak orijinal content yapısını büyük ölçüde bozmadığı için inline güncelliyoruz)
  content = content.trim();
  // Common WhatsApp media patterns - updated to match Turkish format
  const mediaPatterns = [
    // Turkish WhatsApp format: <filename eklendi>
    { pattern: /<(\d+-PHOTO-[^>]+\.(?:jpg|jpeg|png|webp)) eklendi>/, type: 'image' as const },
    { pattern: /<(\d+-VIDEO-[^>]+\.(?:mp4|avi|mov|3gp)) eklendi>/, type: 'video' as const },
    { pattern: /<(\d+-AUDIO-[^>]+\.(?:mp3|aac|ogg|opus)) eklendi>/, type: 'audio' as const },
    { pattern: /<(\d+-DOC-[^>]+\.(?:pdf|doc|docx|txt)) eklendi>/, type: 'document' as const },
    
    // Generic Turkish format for any file type
    { pattern: /<([^>]+\.(?:jpg|jpeg|png|webp)) eklendi>/, type: 'image' as const },
    { pattern: /<([^>]+\.(?:mp4|avi|mov|3gp)) eklendi>/, type: 'video' as const },
    { pattern: /<([^>]+\.(?:mp3|aac|ogg|opus)) eklendi>/, type: 'audio' as const },
    { pattern: /<([^>]+\.(?:pdf|doc|docx|txt)) eklendi>/, type: 'document' as const },
    
    // Turkish without angle brackets (bazı exportlarda <> gelmiyor)
    { pattern: /(\d+-PHOTO-[A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp))/, type: 'image' as const },
    { pattern: /(\d+-VIDEO-[A-Za-z0-9_-]+\.(?:mp4|avi|mov|3gp))/, type: 'video' as const },
    { pattern: /(\d+-AUDIO-[A-Za-z0-9_-]+\.(?:mp3|aac|ogg|opus))/, type: 'audio' as const },
    { pattern: /(\d+-DOC-[A-Za-z0-9_-]+\.(?:pdf|doc|docx|txt))/, type: 'document' as const },

    // English format variants
    { pattern: /\<attached: (.+\.jpg|.+\.jpeg|.+\.png|.+\.webp)\>/, type: 'image' as const },
    { pattern: /\<attached: (.+\.mp4|.+\.avi|.+\.mov|.+\.3gp)\>/, type: 'video' as const },
    { pattern: /\<attached: (.+\.mp3|.+\.aac|.+\.ogg|.+\.opus)\>/, type: 'audio' as const },
    { pattern: /\<attached: (.+\.pdf|.+\.doc|.+\.docx|.+\.txt)\>/, type: 'document' as const },
    
    // Old format variants
    { pattern: /(.+\.jpg|.+\.jpeg|.+\.png|.+\.webp) \(file attached\)/, type: 'image' as const },
    { pattern: /(.+\.mp4|.+\.avi|.+\.mov|.+\.3gp) \(file attached\)/, type: 'video' as const },
    { pattern: /(.+\.mp3|.+\.aac|.+\.ogg|.+\.opus) \(file attached\)/, type: 'audio' as const },
    { pattern: /(.+\.pdf|.+\.doc|.+\.docx|.+\.txt) \(file attached\)/, type: 'document' as const },
    
    // Standard WhatsApp naming patterns
    { pattern: /IMG-\d+-WA\d+\.jpg/, type: 'image' as const },
    { pattern: /VID-\d+-WA\d+\.mp4/, type: 'video' as const },
    { pattern: /AUD-\d+-WA\d+\.opus/, type: 'audio' as const },
  ];

  for (const { pattern, type } of mediaPatterns) {
    const match = content.match(pattern);
    if (match) {
      const fileName = match[1] || match[0];
      let mediaUrl = undefined;
      
      if (mediaFiles && fileName) {
        // Doğrudan eşleşme
        mediaUrl = mediaFiles.get(fileName);
        if (!mediaUrl) {
          // Case-insensitive dene
            const lower = fileName.toLowerCase();
            for (const [k, v] of Array.from(mediaFiles.entries())) {
              if (k.toLowerCase() === lower) { mediaUrl = v; break; }
            }
        }
        if (!mediaUrl) {
          // Alt klasör içeren kayıtlarda sadece basename veya suffix eşleşmesi
          const parts = fileName.split(/[/\\]/);
          const base = parts[parts.length - 1];
          const lowerBase = base.toLowerCase();
          for (const [k, v] of Array.from(mediaFiles.entries())) {
            const kBase = k.split(/[/\\]/).pop() || k;
            if (kBase.toLowerCase() === lowerBase) { mediaUrl = v; break; }
          }
        }
        if (!mediaUrl) {
          // Son çare: dosya adı sonu eşleşmesi (örn: hashed path içinde)
          const lower = fileName.toLowerCase();
          for (const [k, v] of Array.from(mediaFiles.entries())) {
            if (k.toLowerCase().endsWith(lower)) { mediaUrl = v; break; }
          }
        }
      }
      
      return {
        mediaType: type,
        fileName,
        mediaUrl
      };
    }
  }

  // Fallback: satır tamamen (veya neredeyse) sadece bir dosya adı ise ve mediaFiles'ta varsa uzantıya göre sınıflandır.
  const trimmed = content.trim();
  // Örn: 00000014-PHOTO-2024-07-20-14-57-09.jpg
  const bareFileMatch = trimmed.match(/^([A-Za-z0-9_\-]+-(?:PHOTO|VIDEO|AUDIO|DOC)-[A-Za-z0-9_\-]+\.(jpg|jpeg|png|webp|mp4|avi|mov|3gp|mp3|aac|ogg|opus|pdf|doc|docx|txt))$/i);
  if (bareFileMatch) {
    const fileName = bareFileMatch[1];
    let mediaType: 'image' | 'video' | 'audio' | 'document' | undefined;
    const lower = fileName.toLowerCase();
    if (/(jpg|jpeg|png|webp)$/.test(lower)) mediaType = 'image';
    else if (/(mp4|avi|mov|3gp)$/.test(lower)) mediaType = 'video';
    else if (/(mp3|aac|ogg|opus)$/.test(lower)) mediaType = 'audio';
    else if (/(pdf|doc|docx|txt)$/.test(lower)) mediaType = 'document';
    if (mediaType) {
      let mediaUrl = mediaFiles?.get(fileName);
      if (!mediaUrl && mediaFiles) {
        const lower = fileName.toLowerCase();
  for (const [k, v] of Array.from(mediaFiles.entries())) {
          if (k.toLowerCase().endsWith(lower)) { mediaUrl = v; break; }
        }
      }
      return { mediaType, fileName, mediaUrl };
    }
  }

  // Ek fallback: içerikte geçen ilk bilinen uzantılı dosya adı tokenını ara
  const tokenMatch = content.match(/([A-Za-z0-9_\-]+\.(?:jpg|jpeg|png|webp|mp4|avi|mov|3gp|mp3|aac|ogg|opus|pdf|doc|docx|txt))/i);
  if (tokenMatch) {
    const fileName = tokenMatch[1];
    let mediaUrl = mediaFiles?.get(fileName);
    if (!mediaUrl && mediaFiles) {
      const lower = fileName.toLowerCase();
  for (const [k, v] of Array.from(mediaFiles.entries())) {
        if (k.toLowerCase().endsWith(lower)) { mediaUrl = v; break; }
      }
    }
    if (mediaUrl) {
      const lower = fileName.toLowerCase();
      let mediaType: 'image' | 'video' | 'audio' | 'document' = 'document';
      if (/(jpg|jpeg|png|webp)$/.test(lower)) mediaType = 'image';
      else if (/(mp4|avi|mov|3gp)$/.test(lower)) mediaType = 'video';
      else if (/(mp3|aac|ogg|opus)$/.test(lower)) mediaType = 'audio';
      return { mediaType, fileName, mediaUrl };
    }
  }

  return null;
}

function parseWhatsAppTimestamp(timestamp: string): Date {
  try {
    // Remove square brackets
    const cleanTimestamp = timestamp.replace(/[\[\]]/g, '').trim();
    
    // Try different formats
    // Format 1: DD/MM/YY, HH:MM:SS
    let match = cleanTimestamp.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2}):(\d{2})$/);
    if (match) {
      const [, day, month, year, hours, minutes, seconds] = match;
      const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
      return new Date(fullYear, parseInt(month) - 1, parseInt(day), 
                     parseInt(hours), parseInt(minutes), parseInt(seconds));
    }
    
    // Format 2: DD/MM/YY, HH:MM
    match = cleanTimestamp.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})$/);
    if (match) {
      const [, day, month, year, hours, minutes] = match;
      const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
      return new Date(fullYear, parseInt(month) - 1, parseInt(day), 
                     parseInt(hours), parseInt(minutes), 0);
    }
    
    // Format 3: Try to parse as ISO string
    const isoDate = new Date(cleanTimestamp);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    
    // Format 4: Extract numbers and try to make sense
    const numbers = cleanTimestamp.match(/\d+/g);
    if (numbers && numbers.length >= 5) {
      const [day, month, year, hours, minutes] = numbers.map(n => parseInt(n));
      const fullYear = year < 100 ? 2000 + year : year;
      return new Date(fullYear, month - 1, day, hours, minutes, 0);
    }
    
    throw new Error(`Cannot parse timestamp: ${cleanTimestamp}`);
  } catch (error) {
    console.error('Error parsing timestamp:', timestamp, error);
    // Return a more reasonable fallback
    return new Date('2019-01-01T12:00:00');
  }
}

// Asenkron / chunked parser: Büyük dosyalarda UI bloklanmasını azaltır.
// options.chunkSize: her döngüde işlenecek satır sayısı (varsayılan 500)
// options.onProgress?: (processedLines, totalLines) => void
export async function parseWhatsAppChatAsync(
  chatContent: string,
  mediaFiles?: Map<string, string>,
  options?: { chunkSize?: number; onProgress?: (processed: number, total: number) => void }
): Promise<ChatData> {
  const lines = chatContent.split('\n');
  const total = lines.length;
  const messages: Message[] = [];
  let currentUser = '';
  let participant = '';

  // Encryption line üzerinden participant belirleme (senkron fonksiyonla aynı mantık)
  const encryptionLine = lines.find(line => line.includes('Messages and calls are end-to-end encrypted'));
  if (encryptionLine) {
    const match = encryptionLine.match(/\] (.*?):/);
    if (match) participant = match[1];
  }

  const chunkSize = options?.chunkSize ?? 500;
  let processed = 0;
  while (processed < total) {
    const slice = lines.slice(processed, processed + chunkSize);
    for (const line of slice) {
      const messageMatch = line.match(/\[(.*?)\] (.*?): (.*)/);
      if (messageMatch) {
        const [, timestamp, sender, content] = messageMatch;
        if (!currentUser && sender !== participant) {
          currentUser = sender;
        }
        const message: Message = {
          timestamp: parseWhatsAppTimestamp(timestamp),
          sender,
          content,
        };
        const mediaInfo = parseMediaContent(content, mediaFiles);
        if (mediaInfo) {
          message.mediaType = mediaInfo.mediaType;
          message.mediaUrl = mediaInfo.mediaUrl;
          message.fileName = mediaInfo.fileName;
        }
        messages.push(message);
      }
    }
    processed += slice.length;
    if (options?.onProgress) options.onProgress(processed, total);
    // Event loop'a nefes aldır: uzun işlerde UI donmasını azaltır
    await new Promise(res => setTimeout(res, 0));
  }

  return { messages, currentUser, participant };
}