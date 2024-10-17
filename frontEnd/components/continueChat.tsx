import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react"; // Ensure you have installed @nextui-org/react
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Tooltip } from "@nextui-org/tooltip";
import ReactMarkdown from "react-markdown";

// Define the structure for a single chat message
interface ChatMessage {
  question: string;
  answer: string;
}

// Define the structure for the chat history storage
interface ChatHistoryStore {
  chatHistory: ChatMessage[];
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
        setChatHistory(parsedData.chatHistory);
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

  // Auto-scroll when chatHistory is updated
  useEffect(() => {
    const chatContainer = document.getElementById("continue-chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    // Optionally play a sound if you have an audio file
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, [chatHistory]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
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
              chatHistory.map((msg, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-start">
                    <div className="bg-gray-200 p-2 rounded-lg">
                      <strong>User:</strong> {msg.question}
                    </div>
                  </div>
                  <div className="flex justify-start mt-2">
                    <Tooltip content="Click to copy" placement="bottom">
                      <div
                        className="bg-blue-500 text-white p-2 rounded-lg cursor-pointer"
                        onClick={() =>
                          navigator.clipboard.writeText(msg.answer)
                        }
                      >
                        <strong>AI:</strong>{" "}
                        <ReactMarkdown>{msg.answer}</ReactMarkdown>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              ))
            )}
          </ScrollShadow>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
      <audio ref={audioRef} src="/notification.mp3" /> {/* Update the source as needed */}
    </Modal>
  );
};

export default ContinueChat;
