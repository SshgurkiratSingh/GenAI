"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardBody } from "@nextui-org/card";
import { Button } from "@nextui-org/button";

import UploadModal from "@/components/upload";
import ChatModal from "@/components/ChatModal";
import LoginModal from "@/components/LoginModal"; // Import the LoginModal component
import RegisterModal from "@/components/RegisterModal"; // Import the RegisterModal component

const HomePage = () => {
  const { data: session } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State for login modal visibility
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false); // State for register modal visibility
  const [uploadedQuestions, setUploadedQuestions] = useState<string[]>([]);
  const [uploadedTitle, setUploadedTitle] = useState<string>("");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string>(""); // Capture file name here
  const [processingTime, setProcessingTime] = useState<string>("");

  useEffect(() => {
    const username = session?.user?.name || "Guest";
    const fullText = session
      ? `Welcome, ${username}!`
      : "Welcome to PDF Reader!";

    setText(fullText); // Set the text without typing effect
  }, [session]);

  const handleUploadSuccess = (
    questions: string[],
    title: string,
    uploadedFileName: string,
    uploadedProcessingTime: string
  ) => {
    setUploadedQuestions(questions);
    setUploadedTitle(title);
    setFileName(uploadedFileName); // Set the file name
    setProcessingTime(uploadedProcessingTime); // Optionally track processing time
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true); // Open the login modal when the login button is clicked
  };

  const handleSignUpClick = () => {
    setIsRegisterModalOpen(true); // Open the register modal when the sign-up button is clicked
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false); // Close the login modal
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false); // Close the register modal
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
      <Card className="w-full max-w-3xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg">
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
                  onClick={handleLoginClick} // Open login modal on click
                >
                  Login
                </Button>
                <Button
                  color="secondary"
                  className="px-8 py-6 text-lg font-bold"
                  onClick={handleSignUpClick} // Open register modal on click
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
        title={uploadedTitle} // This is correct
        fileName={fileName} // Fix this line to pass the actual fileName
      />

      {/* Login Modal */}
      <LoginModal
        visible={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onRegisterClick={handleSignUpClick} // Open register modal when user clicks on "Sign Up" in login modal
      />
      {/* Register Modal */}
      <RegisterModal
        visible={isRegisterModalOpen}
        onClose={handleCloseRegisterModal}
        onLoginClick={handleLoginClick} // Open login modal when user clicks on "Login" in register modal
      />
    </div>
  );
};

export default HomePage;
