"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@nextui-org/card";

import UploadModal from "@/components/upload";
import ChatModal from "@/components/ChatModal";
import { Button } from "@nextui-org/button";

const HomePage = () => {
  const { data: session } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedQuestions, setUploadedQuestions] = useState<string[]>([]);
  const [uploadedTitle, setUploadedTitle] = useState<string>("");
  const [text, setText] = useState("");

  useEffect(() => {
    const username = session?.user?.name || "Guest";
    const fullText = session
      ? `Welcome, ${username}!`
      : "Welcome to PDF Reader!";
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
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x flex items-center justify-center">
      <Card className="w-full max-w-3xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg">
        <CardBody>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-center text-6xl font-extrabold tracking-wider text-white mb-6 animate-pulse">
              {text}
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-center text-xl text-white mb-8">
              Unlock the power of your PDFs with AI-driven insights and
              analysis.
            </h1>
          </motion.div>
          <div>
            {session ? (
              <div className="flex justify-center space-x-4">
                <Button
                  color="success"
                  className="px-8 py-6 text-lg font-bold"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  Upload PDF
                </Button>
                <Button
                  color="primary"
                  className="px-8 py-6 text-lg font-bold"
                  onClick={() => {
                    /* Add functionality */
                  }}
                >
                  Browse History
                </Button>
              </div>
            ) : (
              <div className="flex justify-center space-x-4">
                <Button
                  color="primary"
                  className="px-8 py-6 text-lg font-bold"
                  onClick={() => {
                    /* Add login functionality */
                  }}
                >
                  Login
                </Button>
                <Button
                  color="secondary"
                  className="px-8 py-6 text-lg font-bold"
                  onClick={() => {
                    /* Add signup functionality */
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
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
