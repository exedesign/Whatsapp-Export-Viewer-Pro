export interface Message {
  timestamp: Date;
  sender: string;
  content: string;
}

export interface ChatData {
  messages: Message[];
  currentUser: string;
  participant: string;
}