# WhatsApp Chat Viewer

A lightweight, offline web application that allows users to view and analyze their WhatsApp chat exports. Built with Next.js and TypeScript, this application processes WhatsApp chat exports locally without sending any data to external servers.

## Features

- 🔒 **Completely Offline**: All data processing happens in your browser
- 📱 **Mobile Responsive**: Works seamlessly across all device sizes
- 🔍 **Search Functionality**: Search through your chat messages
- 📅 **Date Navigation**: Jump to specific dates in the chat
- 💬 **Message Threading**: Messages are organized by date with clear sender identification
- 🎨 **WhatsApp-like UI**: Familiar interface matching WhatsApp's design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/abishekvenkat/whatsapp-export-reader.git
```

2. Install dependencies:

```bash
cd whatsapp-export-reader
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:5678](http://localhost:5678) in your browser

## Usage

1. Export your WhatsApp chat:
   - Open WhatsApp
   - Go to the chat you want to export
   - Click on More options (⋮)
   - Select "Export chat"
   - Choose "Without media"
   - Save the ZIP file

2. Upload the chat:
   - Click the "Upload WhatsApp Chat" button
   - Select your exported ZIP file
   - The chat will be displayed automatically

3. Navigate the chat:
   - Use the search bar to find specific messages
   - Use the date picker to jump to specific dates
   - Scroll through messages chronologically

## Project Structure

```
├── app/
│ ├── page.tsx # Main chat viewer page
│ ├── layout.tsx # Root layout
│ └── globals.css # Global styles
├── components/
│ ├── chat-header.tsx # Search and date navigation
│ ├── chat-message.tsx # Individual message component
│ └── ui/ # Reusable UI components
├── lib/
│ ├── chat-parser.ts # WhatsApp chat parsing logic
│ ├── types.ts # TypeScript interfaces
│ └── utils.ts # Utility functions
```

## Upcoming Features

### 1. Display Attachments
- Support for images, videos, and documents from chat exports
- Thumbnail previews for media files
- Modal view for full-size media
- Download functionality for attachments

### 2. Multiple Chat Support
- Upload and store multiple chat exports
- Switch between different chats
- Persistent storage using localStorage or IndexedDB
- Chat list management (rename, delete, etc.)

### 3. Enhanced Chat Header
- Participant information display
- Chat statistics (message count, date range, etc.)
- Export options for filtered/searched messages
- Theme customization options

---

**Note**: This app functions completely offline and all data is parsed locally in your browser.