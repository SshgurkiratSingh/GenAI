# Frontend Components and Features

This document provides an overview of the frontend components and features implemented in our application.

## Components

### 1. ChatModal (ChatModal.tsx)
- Implements a full-screen chat interface
- Supports real-time chat with AI
- Features:
  - Multi-file selection and management for chat context
  - Context window adjustment (3-15 messages)
  - LLM model selection (GPT-4o and GPT-4o-mini)
  - Message editing and deletion
  - Reference display and interaction
  - Auto-save functionality
  - Chat export
  - Suggested queries
  - PDF viewing modal for references
  - Generative Glance feature
  - Real-time typing indicator

### 2. Navbar (navbar.tsx)
- Provides navigation and user authentication interface
- Features:
  - Responsive design
  - User authentication status display
  - Theme switching (light/dark mode)
  - Dynamic menu items based on user authentication

### 3. HomePage (page.tsx in app directory)
- Main landing page of the application
- Features:
  - User authentication integration
  - File upload functionality
  - New chat initiation
  - Chat history browsing
  - Chat with URL feature
  - Welcome message with dynamic text based on user session

### 4. ChatHistoryTable (page.tsx in app/chat directory)
- Displays user's chat history and uploaded files
- Features:
  - Pagination for chat files and uploaded files
  - View, delete, and manage chat histories
  - File management (view, delete)
  - Separate tables for chat files and uploaded files

### 5. Config Portal (page.tsx in app/config directory)
- Configuration interface for the application
- Features:
  - ESP Master Node Control
  - Edit configuration
  - Identity check
  - History logs display with UUID generation

### 6. AIReferenceModal (AIReferenceModal.tsx)
- Modal for generating AI references
- Features:
  - Displays question and answer
  - Generates references based on user files

### 7. LoginModal and RegisterModal
- User authentication interfaces
- Features:
  - Form validation
  - Error handling
  - Switching between login and registration

### 8. UploadModal (upload.tsx)
- Interface for file uploading
- Features:
  - File selection
  - Progress tracking
  - Error handling

### 9. CollaborativePage (page.tsx in app/Collaborative directory)
- Interface for collaborative features
- Features:
  - Chat with AI Assistant
  - Refresh data functionality

### 10. PDFModal (pdfModal.tsx)
- Modal for viewing PDF files
- Features:
  - Display specific pages of PDF documents
  - Integration with chat references

## Key Features

1. **AI-Powered Chat**: Integrates with AI models for intelligent conversations
2. **File Management**: Allows users to upload, select, and manage multiple files for chat context
3. **User Authentication**: Implements secure login, registration, and session management
4. **Responsive Design**: Ensures a seamless experience across different devices
5. **Theme Switching**: Supports light and dark mode with persistent user preference
6. **Chat History**: Maintains and displays user's chat histories with pagination
7. **Export Functionality**: Allows users to export their chat conversations
8. **Reference System**: Provides clickable references to specific parts of documents with PDF viewing
9. **Customizable AI Interaction**: Allows users to adjust context window and select LLM models
10. **Real-time Updates**: Implements auto-save functionality for chat sessions
11. **Collaborative Features**: Includes a collaborative page for potential multi-user interactions
12. **Security**: Implements identity checks in the configuration portal
13. **Dynamic UI Components**: Utilizes NextUI components for a modern and consistent user interface
14. **Icon Integration**: Uses react-icons for a rich set of icons throughout the application

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started): React framework for building the application
- [NextUI v2](https://nextui.org/): UI component library for a consistent and modern design
- [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework for styling
- [TypeScript](https://www.typescriptlang.org/): Typed superset of JavaScript for improved development experience
- [next-auth](https://next-auth.js.org/): Authentication solution for Next.js applications
- [axios](https://axios-http.com/): Promise-based HTTP client for making API requests
- [react-toastify](https://fkhadra.github.io/react-toastify/): Toast notifications for user feedback
- [react-icons](https://react-icons.github.io/react-icons/): Icon library for React applications

This README provides an overview of the main components and features. For more detailed information, please refer to the individual component files.
