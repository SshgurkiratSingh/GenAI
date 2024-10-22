# Dark Knight Risers - AI-Powered PDF Reader and Chat Application

The frontend is hosted as http not https

## Overview

GenAI is a full-stack web application that combines the power of AI with document analysis and chat functionality. It allows users to upload PDF files, chat with AI about the content, and even interact with web pages through a chat interface.

## Features

- PDF upload and analysis
- AI-powered chat interface for document interaction
- Web page content analysis through URL submission
- User authentication (login and registration)
- Chat history browsing
- Responsive design with a modern UI

## Tech Stack

### Frontend

- Next.js (v14.2.15)
- React (v18.3.1)
- NextUI components
- Tailwind CSS
- TypeScript

### Backend

- Node.js
- Express.js
- MongoDB (via Prisma ORM)
- OpenAI API

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB instance

### Frontend Setup

1. Navigate to the `frontEnd` directory
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
3. store the shell with necessary environment variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:2500
   ```
4. Run the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

## Backend

### Technologies Used

- Node.js
- Express.js
- Supabase (for vector storage)
- OpenAI API
- PDF parsing (pdf-parse)
- Natural language processing (natural)
- File handling (multer)
- CORS for cross-origin resource sharing
- Morgan for HTTP request logging

### Environment Variables

The backend requires the following environment variables:

- `SUPABASE_API_KEY`: API key for Supabase
- `SUPABASE_URL`: URL for Supabase instance
- `OPENAI_API_KEY`: API key for OpenAI
- `PORT`: (Optional) Port number for the server (default: 2500)

### Available Routes

1. File Upload and Context Creation

   - Path: `/upload`
   - Method: POST
   - Description: Uploads a PDF file and creates a context for chat

2. Chat with AI

   - Path: `/chat`
   - Method: POST
   - Description: Sends a message to chat with the AI based on uploaded context

3. Get Chat History

   - Path: `/files`
   - Method: GET
   - Description: Retrieves the list of chat files for a user

4. Get Specific Chat File

   - Path: `/chat-files`
   - Method: POST
   - Description: Retrieves a specific chat file for a user

5. Update Chat File

   - Path: `/chat-files`
   - Method: PUT
   - Description: Updates a specific chat file for a user

6. Clear Chat File

   - Path: `/chat-files/clear`
   - Method: POST
   - Description: Clears the content of a specific chat file

7. Delete Chat File

   - Path: `/chat-files`
   - Method: DELETE
   - Description: Deletes a specific chat file for a user

8. Chat with URL

   - Path: `/url/ask-from-url`
   - Method: POST
   - Description: Allows querying based on content from a provided URL

9. List Files for User

   - Path: `/list-files/:email`
   - Method: GET
   - Description: Lists all files associated with a specific user email

10. Delete File
    - Path: `/file/delete/:email/:fileName`
    - Method: DELETE
    - Description: Deletes a specific file for a user

### Setup Instructions

1. Navigate to the `backEnd` directory
2. Install dependencies:
   ```
   npm install
   ```
3. store the shell with necessary environment variables for the `backEnd` directory with the following content:
   ```
   SUPABASE_API_KEY=your_supabase_api_key
   SUPABASE_URL=your_supabase_url
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the server:
   ```
   npm start
   ```

The server will start on the default port 2500 or the port specified in the `PORT` environment variable.

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

## Available Scripts

### Frontend

- `dev`: Runs the development server
- `build`: Builds the production application
- `start`: Starts the production server
- `lint`: Lints the codebase

### Backend

- `start`: Starts the server
- `test`: Runs tests (currently not implemented)

## Key Dependencies

### Frontend

- `@nextui-org/react`: UI component library
- `next-auth`: Authentication library
- `axios`: HTTP client
- `react-hook-form`: Form handling
- `zustand`: State management

### Backend

- `express`: Web framework
- `@prisma/client`: Database ORM
- `openai`: OpenAI API client
- `multer`: File upload handling
- `cors`: Cross-Origin Resource Sharing

## Usage

1. Register for an account or log in
2. Upload a PDF file or provide a URL to analyze
3. Interact with the AI chatbot to ask questions about the document or web page content
4. Browse your chat history to review previous interactions

## Contributing

We welcome contributions to GenAI! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the ISC License.
