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
3. Create a `.env.local` file with necessary environment variables:
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

### Backend Setup
1. Navigate to the `backEnd` directory
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
3. Create a `.env` file with necessary environment variables:
   ```
   DATABASE_URL=your_mongodb_connection_string
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

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
