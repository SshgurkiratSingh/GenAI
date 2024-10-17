"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import Link from "next/link";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Spinner } from "@nextui-org/spinner";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import ContinueChat from "@/components/continueChat";

// Define the structure of chat files
interface ChatFile {
  file: string;
}

const ChatHistoryTable: React.FC = () => {
  const [chatFiles, setChatFiles] = useState<ChatFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const fetchChatHistory = async (): Promise<void> => {
    if (session?.user?.email) {
      try {
        setIsLoading(true);
        const response = await axios.post<{ message: string; files: string[] }>(
          "http://192.168.100.113:2500/files/history",
          {
            email: session.user.email,
          }
        );
        const files = response.data.files.map((file) => ({
          file: file.slice(0, -5), // Remove last 5 characters
        }));
        setChatFiles(files);
        setError(null);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setError("Failed to fetch chat history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [session]);

  const handleDelete = async (fileName: string): Promise<void> => {
    try {
      await axios.post("http://192.168.100.113:2500/files/deleteChatFile", {
        email: session?.user?.email,
        fname: fileName,
      });
      // Refresh the chat history after deletion
      fetchChatHistory();
    } catch (error) {
      console.error("Error deleting chat file:", error);
      setError("Failed to delete chat file. Please try again.");
    }
  };

  const openModal = (file: string) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  if (isLoading) {
    return <Spinner label="Loading chat history..." />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      {chatFiles.length === 0 ? (
        <div>No chat files found.</div>
      ) : (
        <Table aria-label="Chat History Table">
          <TableHeader>
            <TableColumn>File name</TableColumn>
            <TableColumn>Continue Chat</TableColumn>
            <TableColumn>Delete Chat</TableColumn>
          </TableHeader>
          <TableBody>
            {chatFiles.map((file, index) => (
              <TableRow key={index}>
                <TableCell>{file.file}</TableCell>
                <TableCell>
                  <button
                    onClick={() => openModal(file.file)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Continue
                  </button>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleDelete(file.file)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal for Continue Chat */}
      {selectedFile && (
        <Modal isOpen={isModalOpen} onClose={closeModal} size="xl">
          <ModalContent>
            <ModalHeader>Continue Chat for {selectedFile}</ModalHeader>
            <ModalBody>
              <ContinueChat
                isOpen={isModalOpen}
                onClose={closeModal}
                email={session?.user?.email || ""}
                fileName={selectedFile}
              />
            </ModalBody>
            <ModalFooter>
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default ChatHistoryTable;
