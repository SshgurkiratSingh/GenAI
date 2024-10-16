"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UploadModal from "@/components/upload";
import ChatModal from "@/components/ChatModal";

const HomePage = () => {
  const { data: session } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedQuestions, setUploadedQuestions] = useState<string[]>([]);
  const [uploadedTitle, setUploadedTitle] = useState<string>("");
  const [text, setText] = useState("");

  useEffect(() => {
    const username = session?.user?.name || "Login";
    const fullText = session ? `Hello, ${username}` : `${username}`;
    let index = 0;

    setText(""); // Reset text to avoid concatenation issues

    const typingEffect = setInterval(() => {
      if (index < fullText.length) {
        setText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(typingEffect);
      }
    }, 100);

    return () => clearInterval(typingEffect);
  }, [session]);

  const handleUploadSuccess = (questions: string[], title: string) => {
    setUploadedQuestions(questions);
    setUploadedTitle(title);
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <div className="text-center">
        <h1
          className="text-5xl font-bold tracking-wider bg-clip-text text-transparent animate-gradient-flow"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #3a41c6, #3d3bbb, #4634a7, #4c2c96, #512888)",
            backgroundSize: "200% 200%",
            lineHeight: "1.2",
            paddingBottom: "0.25em",
          }}
        >
          {text}
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
        onClose={() => {
          setUploadedQuestions([]);
          setUploadedTitle("");
        }}
        initialSuggestedQueries={uploadedQuestions}
        title={uploadedTitle}
      />
    </div>
  );
};

export default HomePage;
