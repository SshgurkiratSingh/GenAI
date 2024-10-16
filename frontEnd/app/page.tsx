"use client";

import { useEffect, useState } from 'react'; // Import useState
import { useSession } from "next-auth/react";
import UploadModal from '@/components/upload';
import ChatModal from '@/components/ChatModal';

const HomePage = () => {
  const { data: session } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedQuestions, setUploadedQuestions] = useState<string[]>([]);

  // Directly set the text without animation
  const username = session?.user?.name || "Login";
  const fullText = session ? `Hello, ${username}` : `${username}`;

  const handleUploadSuccess = (questions: string[]) => {
    setUploadedQuestions(questions);
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <div className="text-center">
        <h1
          className="text-5xl font-bold tracking-wider bg-clip-text text-transparent animate-gradient-flow"
          style={{
            backgroundImage: "linear-gradient(90deg, #3a41c6, #3d3bbb, #4634a7, #4c2c96, #512888)", // Gradient combination
            backgroundSize: "200% 200%", // Make the background larger for the flow effect
            lineHeight: "1.2", // Ensure sufficient line height
            paddingBottom: "0.25em", // Add some padding to avoid cutting letters
          }}
        >
          {fullText}
        </h1>
      </div>
      {session && (
        <div className="mt-5">
          <button
            className="px-6 py-3 text-lg font-bold text-white bg-green-500 rounded transition-transform transform hover:bg-green-600 hover:scale-105"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload
          </button>
        </div>
      )}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
      <ChatModal
        isOpen={uploadedQuestions.length > 0}
        onClose={() => setUploadedQuestions([])}
        initialSuggestedQueries={uploadedQuestions}
      />
    </div>
  );
};

export default HomePage;