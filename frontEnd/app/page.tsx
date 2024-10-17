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
  const [isChatURLModalOpen, setIsChatURLModalOpen] = useState(false); // Add state for ChatURL modal
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
    console.log("Chatting with URL: ", url); // You can implement any logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
      <Card className="w-full max-w-3xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-9">
        <CardBody>
          <h1 className="text-center text-6xl font-extrabold tracking-wider text-white mb-6">
            {text}
          </h1>
          <h1 className="text-center text-xl text-white mb-8">
            Unlock the power of your PDFs with AI-driven insights and analysis.
          </h1>
          <div>
            {session ? (
              <div className="flex justify-center space-x-4">
                <Button 
                  color="success" 
                  endContent={<MdOutlineFileUpload />}
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  Upload File     
                </Button>
                
                {/* Link Browse History to the /chat route */}
                <Link href="/chat">
                  <Button color="danger" startContent={<HiDocumentSearch />}>
                    Browse History
                  </Button>
                </Link>

                {/* Chat with Link button */}
                <Button 
                  color="primary" 
                  onClick={() => setIsChatURLModalOpen(true)} // Open the chat URL modal
                >
                  Chat with Link
                </Button>
              </div>
            ) : (
              <div className="flex justify-center space-x-4">
                <Button
                  color="primary"
                  className="px-8 py-6 text-lg font-bold"
                  onClick={handleLoginClick} 
                >
                  Login
                </Button>
                <Button
                  color="secondary"
                  className="px-8 py-6 text-lg font-bold"
                  onClick={handleSignUpClick} 
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
        fileName={fileName} 
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
