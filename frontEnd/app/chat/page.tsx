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

// Define the structure of chat files
interface ChatFile {
  file: string; // You can define this based on the exact structure of files you receive
}

const ChatHistoryTable: React.FC = () => {
  const [chatFiles, setChatFiles] = useState<ChatFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchChatHistory = async (): Promise<void> => {
    if (session?.user?.email) {
      try {
        setIsLoading(true);
        const response = await axios.post<{ files: ChatFile[] }>(
          "http://192.168.100.113:2500/files/history",
          {
            email: session.user.email,
          }
        );
        setChatFiles(response.data.files);
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
                  <Link href={`/chat/${encodeURIComponent(file.file)}`}>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Continue
                    </button>
                  </Link>
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
    </div>
  );
};

export default ChatHistoryTable;
