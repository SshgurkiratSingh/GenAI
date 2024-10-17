import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Tooltip } from "@nextui-org/tooltip";
import ReactMarkdown from "react-markdown";

// Define the structure for a single chat message
interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "ai";
}

// Define the structure for the chat history storage
interface ChatHistoryStore {
  chatHistory: string[]; // array of alternating user/ai responses
  fileName: string;
  title: string;
}

// Define the structure for the API response
interface ChatApiResponse {
  message: string;
  data: string; // JSON string containing ChatHistoryStore
}

// Define the props for ContinueChat component
interface ContinueChatProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  fileName: string;
}

const ContinueChat: React.FC<ContinueChatProps> = ({
  isOpen,
  onClose,
  email,
  fileName,
}) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch the chat history when the modal is open or email/fileName changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.post<ChatApiResponse>(
          "http://192.168.100.113:2500/files/chat",
          { email, fname: fileName }
        );

        // Parse the JSON string in the data field
        const parsedData: ChatHistoryStore = JSON.parse(response.data.data);

        // Map the fetched history to align with ChatModal format
        const mappedChatHistory: ChatMessage[] = parsedData.chatHistory.map(
          (message, index) => ({
            id: index + 1,
            text: message,
            sender: index % 2 === 0 ? "user" : "ai", // Ensure sender is either "user" or "ai"
          })
        );

        // Update the chat history and title state
        setChatHistory(mappedChatHistory);
        setTitle(parsedData.title);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen, email, fileName]);

  // Play notification sound and auto-scroll when a new message is added
  useEffect(() => {
    const chatContainer = document.getElementById("continue-chat-container");

    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    if (newMessage && audioRef.current) {
      audioRef.current.play();
    }
    setNewMessage(false); // Reset after playing sound
  }, [chatHistory, newMessage]);

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between items-center">
                <span>{title || fileName || "Continue Chat"}</span>
              </ModalHeader>
              <ModalBody>
                <ScrollShadow
                  className="h-[400px] overflow-y-auto"
                  id="continue-chat-container"
                >
                  {loading ? (
                    <div>Loading chat history...</div>
                  ) : chatHistory.length === 0 ? (
                    <div>No chat history available.</div>
                  ) : (
                    chatHistory.map((msg) => (
                      <div key={msg.id} className="mb-4">
                        <div
                          className={`flex ${
                            msg.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`${
                              msg.sender === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-black"
                            } p-2 rounded-lg`}
                          >
                            {msg.sender === "user" ? (
                              <strong>User:</strong>
                            ) : (
                              <Tooltip
                                content="Click to copy"
                                placement="bottom"
                              >
                                <div
                                  onClick={() =>
                                    navigator.clipboard.writeText(msg.text)
                                  }
                                >
                                  <strong>AI:</strong>{" "}
                                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollShadow>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
export default ContinueChat;
