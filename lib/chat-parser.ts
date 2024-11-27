import { Message, ChatData } from './types';

export function parseWhatsAppChat(chatContent: string): ChatData {
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

      messages.push(message);
    }
  }

  return { messages, currentUser, participant };
}

function parseWhatsAppTimestamp(timestamp: string): Date {
  try {
    // Remove square brackets and split date and time
    const cleanTimestamp = timestamp.replace(/[\[\]]/g, '');
    const [datePart, timePart] = cleanTimestamp.split(',').map(s => s.trim());
    
    // Parse date parts (DD/MM/YY)
    const [day, month, year] = datePart.split('/');
    
    // Parse time parts (H:MM:SS PM/AM)
    const [timeStr, period] = timePart.split(' ');
    const [hours, minutes, seconds] = timeStr.split(':');
    
    // Convert to 24-hour format
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    // Create date object (note: month is 0-based in JavaScript)
    const date = new Date(
      2000 + parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      hour,
      parseInt(minutes),
      parseInt(seconds)
    );

    return date;
  } catch (error) {
    console.error('Error parsing timestamp:', timestamp, error);
    return new Date(); // Fallback to current date
  }
}