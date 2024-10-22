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
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import { Spinner } from "@nextui-org/spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { toast } from "react-toastify";
import { API_Point } from "@/APIConfig";
import { Button } from "@nextui-org/button";

// Type Definitions
type MessageSender = "ai" | "user";

interface ChatHistoryMessage {
  text: string;
  sender: MessageSender;
}

interface ChatHistoryData {
  chatHistory: ChatHistoryMessage[];
  fileName: string;
  title: string;
  contextWindow: number;
  llmModel: string;
}

interface ChatFile {
  file: string;
}

const ChatHistoryTable: React.FC = () => {
  // State declarations
  const [chatFiles, setChatFiles] = useState<ChatFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedChatHistory, setSelectedChatHistory] = useState<
    ChatHistoryMessage[]
  >([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  // Pagination states
  const [currentPageChat, setCurrentPageChat] = useState<number>(0);
  const [currentPageUploaded, setCurrentPageUploaded] = useState<number>(0);
  const filesPerPage = 5;

  const { data: session, status } = useSession();

  // Helper Functions
  const transformChatHistory = (rawData: any): ChatHistoryMessage[] => {
    try {
      let parsedData: ChatHistoryData;

      if (typeof rawData === "string") {
        parsedData = JSON.parse(rawData);
      } else if (rawData.data && typeof rawData.data === "string") {
        parsedData = JSON.parse(rawData.data);
      } else if (rawData.chatHistory) {
        parsedData = rawData;
      } else {
        throw new Error("Invalid chat history format");
      }

      if (!parsedData.chatHistory || !Array.isArray(parsedData.chatHistory)) {
        throw new Error("Invalid chat history structure");
      }

      return parsedData.chatHistory.map((message) => ({
        text: message.text,
        sender: message.sender,
      }));
    } catch (error) {
      console.error("Error transforming chat history:", error);
      return [];
    }
  };

  // API Calls
  const fetchUploadedFiles = async (): Promise<void> => {
    if (session?.user?.email) {
      try {
        setIsLoading(true);
        const response = await axios.get<string[]>(
          `${API_Point}/list-files/${session.user.email}`
        );
        setUploadedFiles(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
        setError("Failed to fetch uploaded files. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchChatHistory = async (): Promise<void> => {
    if (session?.user?.email) {
      try {
        setIsLoading(true);
        const response = await axios.post<{ message: string; files: string[] }>(
          `${API_Point}/files/history`,
          {
            email: session.user.email,
          }
        );
        const files = response.data.files.map((file) => ({
          file: file.slice(0, -5), // Remove .json extension
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

  // Event Handlers
  const openModal = async (file: string) => {
    setSelectedFile(file);
    try {
      const response = await axios.post<{ message: string; data: any }>(
        `${API_Point}/files/chat`,
        {
          email: session?.user?.email,
          fname: file,
        }
      );

      const formattedChatHistory = transformChatHistory(
        response.data.data ? response.data.data : response.data
      );
      setSelectedChatHistory(formattedChatHistory);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("Failed to fetch chat history. Please try again.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setSelectedChatHistory([]); // Clear chat history when modal closes
  };

  const openDeleteModal = (file: string) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      try {
        let response;
        if (chatFiles.some(file => file.file === fileToDelete)) {
          // Delete chat file
          response = await axios.post(`${API_Point}/files/deleteFile`, {
            email: session?.user?.email,
            fname: fileToDelete,
          });
        } else {
          // Delete uploaded file
          response = await axios.delete(`${API_Point}/file/delete/${session?.user?.email}/${fileToDelete}`);
        }

        if (response.status === 200) {
          toast.success(
            "File deleted successfully! Refreshing file lists..."
          );
          fetchChatHistory();
          fetchUploadedFiles();
        } else {
          toast.error("Failed to delete the file.");
        }
      } catch (error) {
        console.error("Error during file deletion:", error);
        toast.error("An error occurred while deleting the file.");
      } finally {
        closeDeleteModal();
      }
    }
  };

  // Effects
  useEffect(() => {
    if (status === "authenticated") {
      fetchChatHistory();
      fetchUploadedFiles();
    }
  }, [session, status]);

  // Pagination Handlers for Chat Files
  const nextPageChat = () => {
    if ((currentPageChat + 1) * filesPerPage < chatFiles.length) {
      setCurrentPageChat(currentPageChat + 1);
    }
  };

  const prevPageChat = () => {
    if (currentPageChat > 0) {
      setCurrentPageChat(currentPageChat - 1);
    }
  };

  // Pagination Handlers for Uploaded Files
  const nextPageUploaded = () => {
    if ((currentPageUploaded + 1) * filesPerPage < uploadedFiles.length) {
      setCurrentPageUploaded(currentPageUploaded + 1);
    }
  };

  const prevPageUploaded = () => {
    if (currentPageUploaded > 0) {
      setCurrentPageUploaded(currentPageUploaded - 1);
    }
  };

  // Conditional Renders
  if (status === "loading") {
    return <Spinner label="Loading chat history..." />;
  }

  if (status === "unauthenticated") {
    return (
      <div>
        <p>Please log in to view your chat history.</p>
        <Button
          onClick={() => signIn()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Log In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <Spinner label="Loading chat history..." />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Sliced Data for Pagination
  const currentChatFiles = chatFiles.slice(
    currentPageChat * filesPerPage,
    (currentPageChat + 1) * filesPerPage
  );

  const currentUploadedFiles = uploadedFiles.slice(
    currentPageUploaded * filesPerPage,
    (currentPageUploaded + 1) * filesPerPage
  );

  return (
    <div className="flex flex-col space-y-4">
      {/* Chat History Table */}
      <div className="flex-1">
        {chatFiles.length === 0 ? (
          <div>No chat files found.</div>
        ) : (
          <Table aria-label="Chat History Table">
            <TableHeader>
              <TableColumn>Chat Title</TableColumn>
              <TableColumn>View Chat</TableColumn>
              <TableColumn>Delete Chat</TableColumn>
            </TableHeader>
            <TableBody>
              {currentChatFiles.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>{file.file}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => openModal(file.file)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => openDeleteModal(file.file)}
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
      </div>

      {/* Pagination Controls for Chat Files */}
      <div className="flex justify-between">
        <Button
          onClick={prevPageChat}
          disabled={currentPageChat === 0}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Previous
        </Button>
        <Button
          onClick={nextPageChat}
          disabled={(currentPageChat + 1) * filesPerPage >= chatFiles.length}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Next
        </Button>
      </div>

      {/* Modal for Chat History */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>{selectedFile || "Chat History"}</ModalHeader>
          <ModalBody>
            {selectedChatHistory.length === 0 ? (
              <div>No chat history available.</div>
            ) : (
              <div>
                {selectedChatHistory.map((message, index) => (
                  <div key={index} className={`message ${message.sender}`}>
                    <strong>{message.sender === "ai" ? "AI" : "You"}:</strong>{" "}
                    {message.text}
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={closeModal}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Uploaded Files Section */}
      <div className="flex-1">
        <h2>Uploaded Files</h2>
        {uploadedFiles.length === 0 ? (
          <div>No uploaded files found.</div>
        ) : (
          <Table aria-label="Uploaded Files Table">
            <TableHeader>
              <TableColumn>File Name</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {currentUploadedFiles.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>{file}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => openDeleteModal(file)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Delete File
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination Controls for Uploaded Files */}
      <div className="flex justify-between">
        <Button
          onClick={prevPageUploaded}
          disabled={currentPageUploaded === 0}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Previous
        </Button>
        <Button
          onClick={nextPageUploaded}
          disabled={
            (currentPageUploaded + 1) * filesPerPage >= uploadedFiles.length
          }
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Next
        </Button>
      </div>

      {/* Modal for Delete Confirmation */}
      {fileToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          size="sm"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalBody>
              Are you sure you want to delete the chat file:{" "}
              <strong>{fileToDelete}</strong>?
            </ModalBody>
            <ModalFooter>
              <button
                onClick={closeDeleteModal}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default ChatHistoryTable;
