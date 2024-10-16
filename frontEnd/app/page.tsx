"use client";

<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Modal } from "@nextui-org/modal";

const UploadPdfDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}> = ({ open, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      alert("Please upload a valid PDF file.");
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      onClose();
    } else {
      alert("No PDF selected.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} closeButton>
      <Modal.Header>
        <h1>Upload PDF Document</h1>
      </Modal.Header>
      <Modal.Body>
        <h1>Select a PDF document to upload</h1>
        <Input type="file" onChange={handleFileChange} accept="application/pdf" />
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat onClick={onClose} color="error">
          Cancel
        </Button>
        <Button auto onClick={handleUpload}>
          Upload
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const HomePage: React.FC = () => {
  const [text, setText] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
=======
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import UploadModal from '@/components/upload';
import ChatModal from '@/components/ChatModal';

const HomePage = () => {
  const { data: session } = useSession();
  const [text, setText] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedQuestions, setUploadedQuestions] = useState<string[]>([]);

  useEffect(() => {
    const username = session?.user?.name || "Login";
    const fullText = session ? `Hello, ${username}` : `${username}`;
    let index = 0;

    setText('');
    index = 0;

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

  const handleUploadSuccess = (questions: string[]) => {
    setUploadedQuestions(questions);
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-wider bg-gradient-to-r from-purple-600 via-pink-500 to-blue-400 bg-clip-text text-transparent border-r-4 border-white whitespace-nowrap overflow-hidden inline-block">
          {text}
        </h1>
      </div>
<<<<<<< HEAD
      <div className="mt-5">
        <button
          className="px-6 py-3 text-lg font-bold text-white bg-green-500 rounded transition-transform transform hover:bg-green-600 hover:scale-105"
          onClick={() => setDialogOpen(true)}
        >
          Upload
        </button>
      </div>

      {/* Popup Dialog for PDF Upload */}
      <UploadPdfDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onUpload={handleUpload}
      />
=======
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
