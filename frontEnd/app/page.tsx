"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardBody } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { MdOutlineFileUpload } from "react-icons/md";
import { HiDocumentSearch } from "react-icons/hi";
import UploadModal from "@/components/upload";
import ChatModal from "@/components/ChatModal";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import ChatURLModal from "@/components/ChatWithLink"; // Import the new ChatURLModal
import Link from "next/link"; // Import Next.js Link

const HomePage = () => {
  const { data: session } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isChatURLModalOpen, setIsChatURLModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false); // Add state for Chat modal
  const [uploadedQuestions, setUploadedQuestions] = useState<string[]>([]);
  const [uploadedTitle, setUploadedTitle] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [processingTime, setProcessingTime] = useState<string>("");
  const [text, setText] = useState("");
  const [chatUrl, setChatUrl] = useState<string>(""); // Store the submitted URL

  useEffect(() => {
    const username = session?.user?.name || "Guest";
    const fullText = session
      ? `Welcome, ${username}!`
      : "Welcome to PDF Reader!";

    setText(fullText);
  }, [session]);

  const handleUploadSuccess = (
    questions: string[],
    title: string,
    uploadedFileName: string,
    uploadedProcessingTime: string
  ) => {
    setUploadedQuestions(questions);
    setUploadedTitle(title);
    setFileName(uploadedFileName);
    setProcessingTime(uploadedProcessingTime);
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleSignUpClick = () => {
    setIsRegisterModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleChatWithLink = (url: string) => {
    setChatUrl(url); // Store the URL
    setIsChatURLModalOpen(true); // Open the chat URL modal
  };

  const handleNewChat = () => {
    setIsChatModalOpen(true); // Open the chat modal
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-6 lg:p-12">
        <CardBody>
          {/* Heading */}
          <h1 className="text-center text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-wider text-white mb-4 sm:mb-6">
            {text}
          </h1>

          {/* Subheading */}
          <h2 className="text-center text-lg sm:text-xl lg:text-2xl text-white mb-6 sm:mb-8">
            Unlock the power of your PDFs with AI-driven insights and analysis.
          </h2>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {session ? (
              <>
                <Button
                  color="danger"
                  className="w-full sm:w-auto"
                  onClick={handleNewChat} // Open the chat modal
                >
                  New Chat
                </Button>
                <Button
                  color="success"
                  className="w-full sm:w-auto"
                  endContent={<MdOutlineFileUpload />}
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  Upload File
                </Button>

                {/* Link Browse History to the /chat route */}
                <Link href="/chat">
                  <Button
                    color="danger"
                    className="w-full sm:w-auto"
                    startContent={<HiDocumentSearch />}
                  >
                    Browse History
                  </Button>
                </Link>

                {/* Chat with Link button */}
                <Button
                  color="primary"
                  className="w-full sm:w-auto"
                  onClick={() => setIsChatURLModalOpen(true)} // Open the chat URL modal
                >
                  Chat with Link
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="primary"
                  className="w-full sm:w-auto px-8 py-6 text-lg font-bold"
                  onClick={handleLoginClick}
                >
                  Login
                </Button>
                <Button
                  color="secondary"
                  className="w-full sm:w-auto px-8 py-6 text-lg font-bold"
                  onClick={handleSignUpClick}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <ChatModal
        isOpen={uploadedQuestions.length > 0 || isChatModalOpen}
        onClose={() => {
          setUploadedQuestions([]);
          setUploadedTitle("");
          setFileName("");
          setIsChatModalOpen(false);
        }}
        initialSuggestedQueries={uploadedQuestions}
        title={uploadedTitle}
        fileName={fileName}
        isNewChat={isChatModalOpen}
      />

      {/* Login Modal */}
      <LoginModal
        visible={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onRegisterClick={handleSignUpClick}
      />

      {/* Register Modal */}
      <RegisterModal
        visible={isRegisterModalOpen}
        onClose={handleCloseRegisterModal}
        onLoginClick={handleLoginClick}
      />

      {/* Chat URL Modal */}
      <ChatURLModal
        isOpen={isChatURLModalOpen}
        onClose={() => setIsChatURLModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
