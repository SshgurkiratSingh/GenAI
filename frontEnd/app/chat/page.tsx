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
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import ContinueChat from "@/components/continueChat";
import { toast } from "react-toastify";
import { API_Point } from "@/APIConfig";

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

  // New state for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

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

  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Open the modal for the given chat file.
   * @param {string} file The name of the chat file to open.
   */
  /******  9b256ab3-6901-4e18-b107-9e0fe2a5b37d  *******/
  const openModal = (file: string) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
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
        const response = await fetch(`${API_Point}/deleteFile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session?.user.email,
            fname: fileToDelete,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          // Notify success
          alert(result.message);
          // Optionally refresh the file list or update the UI
          toast.success("File deleted successfully! Refresh to continue");
        } else {
          // Handle errors
          alert(result.error || "Failed to delete the file.");
        }
      } catch (error) {
        console.error("Error during file deletion:", error);
        alert("An error occurred while deleting the file.");
      } finally {
        closeDeleteModal();
      }
    }
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

      {/* Modal for Continue Chat */}
      {selectedFile && (
        <ContinueChat
          isOpen={isModalOpen}
          onClose={closeModal}
          email={session?.user?.email || ""}
          fileName={selectedFile}
        />
      )}

      {/* Modal for Delete Confirmation */}
      {fileToDelete && (
        <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} size="sm">
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
                Confirm Delete
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default ChatHistoryTable;
