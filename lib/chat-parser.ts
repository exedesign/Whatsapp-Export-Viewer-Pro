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
        mediaUrl = mediaFiles.get(fileName);
      }
      
      return {
        mediaType: type,
        fileName,
        mediaUrl
      };
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